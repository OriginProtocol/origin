'use strict'

import '@babel/polyfill'
import OrbitDB from 'orbit-db'
import bodyParser from 'body-parser'
import express from 'express'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import Web3 from 'web3'
import db from './models'

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
const snapshotBatchSize = config.SNAPSHOT_BATCH_SIZE


const signatureBufferMap = {}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function startRoom(roomDb, roomId, storeType, writers, shareFunc) {
  let key = roomId
  if (writers.length != 1 || writers[0] != '*') {
    key = roomId + '-' + writers.join('-')
  }

  logger.debug(`Checking key: ${key}`)

  if (!messagingRoomsMap[key]) {
    messagingRoomsMap[key] = 'pending'
    const room = await roomDb[storeType](roomId, { write: writers })

    logger.debug(`Room started: ${room.id}`)

    if (storeType == "eventlog")
    {
      room.__write_messages = true
    }

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

async function onConverse(roomDb, conversee, payload) {
  const converser = payload.key
  logger.debug(`Started conversation between: ${converser} and ${conversee}`)
  const writers = [converser, conversee].sort()

  const externalId = writers.join("-")

  let conversation = await db.Conversation.findOne({where:{externalId:externalId}})

  if (!conversation) {
    try {
      conversation = await db.Conversation.create({externalId, data:{payload}})
    } catch (error) {
      conversation = await db.Conversation.findOne({where:{externalId:externalId}})
      if (!conversation)
      {
        console.log(error)
        throw error
      }
    }
  }

  for (const writer of writers) {
    await db.Conversee.upsert({conversationId:conversation.id, ethAddress:writer}) //make sure this mapping is in place..
  }

  startRoom(roomDb, config.CONV, 'eventlog', writers)
}

function handleGlobalRegistryWrite(convInitDb, payload) {
  if (payload.op == 'PUT') {
    const ethAddress = payload.key
    logger.debug(`Started conversation for: ${ethAddress}`)
    startRoom(convInitDb, config.CONV_INIT_PREFIX + ethAddress, 'kvstore', [
      '*'
    ])
  }
}

function rebroadcastOnReplicate(DB, db) {
  db.events.on('replicated', (address, length, from) => {
    // rebroadcast
    DB._pubsub.publish(db.id, db._oplog.heads)
    if (from != 'fromSnapshot') {
      snapshotDB(db)
    }
  })
}

/*
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
*/

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
    /*
     * this might be causing locks to stall
    for (const entry of snapshotData.values){
      await saveToIpfs(db._ipfs, entry)
    }
    */
    if (snapshotData.values.length < snapshotBatchSize) {
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
    } else {
      const values = snapshotData.values
      while (values.length) {
        const push_values = values.splice(0, snapshotBatchSize)
        const log = new Log(
          db._ipfs,
          snapshotData.id,
          push_values,
          undefined,
          null,
          db._key,
          db.access.write
        )
        await db._oplog.join(log)
        await sleep(100)
      }
    }
    await db._updateIndex()
    db.events.emit(
      'replicated',
      db.address.toString(),
      undefined,
      'fromSnapshot'
    )
  }
  db.__snapshot_loaded = true

  if (db.__write_messages) {
    const ops = db._index.get()
    ops.forEach(entry => {
      const signature = entry.sig
      const ethAddress = entry.key
      const buffer = signatureBufferMap[signature]
      const data = {ext:buffer}
      const content = entry.payload.value
      let isKeys = false

      if (content.length == 2 && content[0].type == "key" && content[1].type == "key")
      {
        delete content[0].type
        delete content[1].type
        data.content = { type:"keys", address:ethAddress, keys:content }
        isKeys = true
      }
      else if ( content.length == 1 ) 
      {
        data.content = content[0]
      }
      else
      {
        console.log("Invalid content:", content)
        return
      }
      const writers = db.access.write

      console.log("data:", data, "ethAddress", ethAddress)
      writeDbMessage(writers, ethAddress, data, signature, isKeys)
    })
  }
  db.events.emit('ready', db.address.toString(), db._oplog.heads)
}

async function startSnapshotDB(db) {
  await loadSnapshotDB(db)
}

async function _onPeerConnected(address, peer) {
  const getStore = address => this.stores[address]
  const getDirectConnection = peer => this._directConnections[peer]
  const onChannelCreated = channel =>
    (this._directConnections[channel._receiverID] = channel)
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

function writeDbMessage(writers, ethAddress, data, signature, isKeys) {
  const externalId = writers.sort().join("-")
  db.sequelize.transaction( async (t) => {
    const conversation = await db.Conversation.findOne({ where:{ externalId:externalId }, transaction: t, lock: t.LOCK.UPDATE })
    await db.Message.create({ conversationId: conversation.id, conversationIndex:conversation.messageCount, ethAddress, data, signature, isKeys }, {transaction:t})
    conversation.messageCount += 1
    return conversation.save({ transaction:t })
  })
}

const startOrbitDbServer = async ipfs => {
  // Remap the peer connected to ours which will wait before exchanging heads
  // with the same peer
  const orbitGlobal = new OrbitDB(ipfs, config.ORBIT_DB_PATH, {
    keystore: new InsertOnlyKeystore()
  })

  orbitGlobal._onPeerConnected = _onPeerConnected

  orbitGlobal.keystore.registerSignVerify(
    config.GLOBAL_KEYS,
    undefined,
    (signature, key, message) => {
        if (verifyRegistrySignature(signature, key, message)) {
          const data = message.payload.value
          const ethAddress = message.payload.key
          db.Registry.upsert({ethAddress, data, signature})
          return true
        }
        return false
      },
    message => {
      handleGlobalRegistryWrite(orbitGlobal, message.payload)
    }
  )

  const globalRegistry = await orbitGlobal.kvstore(config.GLOBAL_KEYS, {
    write: ['*']
  })
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

  const _verifyMessageSignature = verifyMessageSignature(globalRegistry, orbitGlobal)
  orbitGlobal.keystore.registerSignVerify(
    config.CONV,
    undefined,
    (signature, key, message, buffer) => {
      if (_verifyMessageSignature(signature, key, message, buffer)) {
        signatureBufferMap[signature] = message
        return true
      }
      return false
    }
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

    await ipfsId
      .then(peer => {
        logger.info(`Connected to IPFS server: ${peer.id}`)
        startOrbitDbServer(ipfs)
      })
      .catch(error => {
        logger.error(
          `Connection error ${config.IPFS_ADDRESS}:${config.IPFS_PORT}`
        )
        logger.error(error)
        setTimeout(main, 5000)
      })
  } else {
    // Create our own IPFS server
    logger.debug(`Creating IPFS server`)

    const ipfs = new IPFS({
      repo: config.IPFS_REPO_PATH,
      EXPERIMENTAL: {
        pubsub: true
      },
      config: {
        Bootstrap: [],
        Addresses: {
          Swarm: [config.IPFS_WS_ADDRESS]
        }
      }
    })

    ipfs.on('error', e => console.error(e))
    ipfs.on('ready', async () => {
      ipfs.setMaxListeners(config.IPFS_MAX_CONNECTIONS)
      startOrbitDbServer(ipfs)
    })
  }
}

main()
