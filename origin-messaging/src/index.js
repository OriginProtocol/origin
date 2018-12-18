'use strict'

import '@babel/polyfill'
import OrbitDB from 'orbit-db'

const Log = require('ipfs-log')
const IPFSApi = require('ipfs-api')
const IPFS = require('ipfs')
import * as config from './config'
import InsertOnlyKeystore from './insert-only-keystore'
import exchangeHeads from './exchange-heads'
import logger from './logger'
import {
  verifyConversationSignature,
  verifyMessageSignature,
  verifyRegistrySignature
} from './verify'

//the OrbitDB should be the message one
const messagingRoomsMap = {}

async function startRoom(roomDb, roomId, storeType, writers, shareFunc) {
  let key = roomId
  if (writers.length != 1 || writers[0] != '*') {
    key = roomId + '-' +  writers.join('-')
  }

  logger.debug(`Checking key: ${key}`)

  if(!messagingRoomsMap[key]) {
    messagingRoomsMap[key] = 'pending'
    const room = await roomDb[storeType](roomId, { write: writers })

    logger.debug(`Room started: ${room.id}`)

    if (shareFunc) {
      shareFunc(room)
    }
    messagingRoomsMap[key] = room
    rebroadcastOnReplicate(roomDb, room)
    //for persistence replace drop with below
    //room.load()
    startSnapshotDB(room)
  }
}

function onConverse(roomDb, conversee, payload) {
  const converser = payload.key
  logger.debug(`Started conversation between: ${converser} and ${conversee}`)
  const writers = [converser, conversee].sort()
  startRoom(roomDb, config.CONV, 'eventlog', writers)
}

function handleGlobalRegistryWrite(convInitDb, payload) {
  if (payload.op == 'PUT') {
    const ethAddress = payload.key
    logger.debug(`Started conversation for: ${ethAddress}`)
    startRoom(convInitDb, config.CONV_INIT_PREFIX + ethAddress, 'kvstore', ['*'])
  }
}

function rebroadcastOnReplicate(DB, db){
  db.events.on('replicated', () => {
    // rebroadcast
    DB._pubsub.publish(db.id,  db._oplog.heads)
    snapshotDB(db)
  })
}

async function saveToIpfs(ipfs, entry, signature, key) {
  if (!entry) {
    logger.warn('Warning: Given input entry was null.')
    return null
  }

  const logEntry = Object.assign({}, entry)
  logEntry.hash = null

  if (signature) {
    logEntry.sig = signature
  }

  if (key) {
    logEntry.key = key
  }

  return ipfs.object.put(Buffer.from(JSON.stringify(logEntry)))
    .then((dagObj) => dagObj.toJSON().multihash)
    .then(hash => {
      // We need to make sure that the head message's hash actually
      // matches the hash given by IPFS in order to verify that the
      // message contents are authentic
      if (entry.hash) {
        if(entry.hash != hash) {
          logger.warn(`Hash mismatch: ${hash} from ${entry}`)
        }
      }
      else {
        logger.warn(`Hash: ${hash} from ${logEntry}`)
      }
      return hash
    })
}

async function snapshotDB(db) {
  const unfinished = db._replicator.getQueue()
  const snapshotData = db._oplog.toSnapshot()

  await db._cache.set('queue', unfinished)
  await db._cache.set('raw_snapshot', snapshotData)

  logger.debug('Saved snapshot:', snapshotData.id, ' queue:', unfinished.length)
}

async function loadSnapshotDB(db) {
  const queue = await db._cache.get('queue')
  db.sync(queue || [])
  const snapshotData = await db._cache.get('raw_snapshot')
  if (snapshotData) {
    for (const entry of snapshotData.values){
      await saveToIpfs(db._ipfs, entry)
    }
    const log = new Log(
      db._ipfs,
      snapshotData.id,
      snapshotData.values,
      snapshotData.heads,
      null,
      db._key,
      db.access.write
    )
    await db._oplog.join(log)
    await db._updateIndex()
    db.events.emit('replicated', db.address.toString())
  }
  db.__snapshot_loaded = true
  db.events.emit('ready', db.address.toString(), db._oplog.heads)
}

async function startSnapshotDB(db) {
  await loadSnapshotDB(db)
}

async function _onPeerConnected(address, peer) {
  const getStore = address => this.stores[address]
  const getDirectConnection = peer => this._directConnections[peer]
  const onChannelCreated = channel => this._directConnections[channel._receiverID] = channel
  const onMessage = (address, heads) => this._onMessage(address, heads)

  await exchangeHeads(
    this._ipfs,
    address,
    peer,
    getStore,
    getDirectConnection,
    onMessage,
    onChannelCreated
  )

  if (getStore(address)) {
    getStore(address).events.emit('peer', peer)
  }
}

const startOrbitDbServer = async (ipfs) => {
  // Remap the peer connected to ours which will wait before exchanging heads
  // with the same peer
  const orbitGlobal = new OrbitDB(
    ipfs,
    config.ORBIT_DB_PATH,
    { keystore: new InsertOnlyKeystore() }
  )

  orbitGlobal._onPeerConnected = _onPeerConnected

  orbitGlobal.keystore.registerSignVerify(
    config.GLOBAL_KEYS,
    undefined,
    verifyRegistrySignature,
    message => {
      handleGlobalRegistryWrite(orbitGlobal, message.payload)
    }
  )

  const globalRegistry = await orbitGlobal.kvstore(
    config.GLOBAL_KEYS, { write: ['*'] }
  )
  rebroadcastOnReplicate(orbitGlobal, globalRegistry)

  orbitGlobal.keystore.registerSignVerify(
    config.CONV_INIT_PREFIX,
    undefined,
    verifyConversationSignature(globalRegistry),
    message => {
      // Hopefully the last 42 is the eth address
      const ethAddress = message.id.substr(-42)
      onConverse(orbitGlobal, ethAddress, message.payload)
    }
  )
  orbitGlobal.keystore.registerSignVerify(
    config.CONV, undefined, verifyMessageSignature(globalRegistry, orbitGlobal)
  )
  logger.debug(`Orbit registry started...: ${globalRegistry.id}`)

  globalRegistry.events.on('ready', () => {
    logger.info(`Ready...`)
  })

  // testing it's best to drop this for now
  // globalRegistry.load()
  startSnapshotDB(globalRegistry)
}

const main = async () => {
  if (config.IPFS_ADDRESS) {
    // Server configured via env
    const ipfs = IPFSApi(config.IPFS_ADDRESS, config.IPFS_PORT)
    const ipfsId = ipfs.id()

    await ipfsId.then((peer) => {
      logger.info(`Connected to IPFS server: ${peer.id}`)
      startOrbitDbServer(ipfs)
    }).catch((error) => {
      logger.error(`Connection error ${config.IPFS_ADDRESS}:${config.IPFS_PORT}`)
      logger.error(error)
      setTimeout(main, 5000)
    })
  } else {
    // Create our own IPFS server
    logger.debug(`Creating IPFS server`)

    const ipfs = new IPFS({
      repo: config.IPFS_REPO_PATH,
      EXPERIMENTAL: {
        pubsub: true,
      },
      config: {
        Bootstrap: [],
        Addresses: {
         Swarm: [config.IPFS_WS_ADDRESS]
        }
      }
    })

    ipfs.on('error', (e) => console.error(e))
    ipfs.on('ready', async () => {
      ipfs.setMaxListeners(config.IPFS_MAX_CONNECTIONS)
      startOrbitDbServer(ipfs)
    })
  }
}

main()
