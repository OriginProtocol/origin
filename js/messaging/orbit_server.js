import ipfsAPI from 'ipfs-api'
import _ from 'lodash'
import Web3 from 'web3'
import url from 'url'

import OrbitDB from 'orbit-db'
import Keystore from 'orbit-db-keystore'

//get the dotenv config
require('dotenv').config()

const GLOBAL_KEYS = "global"
const CONV_INIT_PREFIX = "convo-init-"
const CONV = "conv"

const web3 = new Web3(process.env.RPC_SERVER)


const ipfsURL = new url.parse(process.env.MESSAGING_IPFS_URL)
const ipfs_opts = {host:ipfsURL.hostname, port:ipfsURL.port, protocol:ipfsURL.protocol.slice(0, -1)}
console.log("opts:", ipfs_opts)

if (process.env.MESSAGING_IPFS_AUTH_TOKEN) {
  console.log("Auth token is:", process.env.MESSAGING_IPFS_AUTH_TOKEN)
  ipfs_opts["headers"] = {
    authorization: process.env.MESSAGING_IPFS_AUTH_TOKEN
  }
}
const ipfs = ipfsAPI(ipfs_opts)
process.env.LOG = "DEBUG"


class InsertOnlyKeystore {
  constructor() {
    this._signVerifyRegistry = {}
  }

  registerSignVerify(db_sig, signFunc, verifyFunc, postFunc) {
    this._signVerifyRegistry[db_sig] = { signFunc, verifyFunc, postFunc}
  }

  getSignVerify(id) {
    const parts = id.split("/")
    const end = parts[parts.length-1]

    const obj = this._signVerifyRegistry[end]
    if (obj) return obj

    for (const k of Object.keys(this._signVerifyRegistry))
    {
      if (k.endsWith("-") && end.startsWith(k))
      {
        return this._signVerifyRegistry[k]
      }
    }
  }

  createKey(id) {
    return ""
  }

  getKey(id) {
    //for some reason Orbit requires a key for verify to be triggered
    return {
      getPublic:(type) => "-"
    }
  }

  async importPublicKey(key) {
    return key
  }

  verify(signature, key, data) {
    try{
      const message = JSON.parse(data.toString('utf8'))
      console.log("we got a message to verify:", message, " sig:", signature)
      const obj = this.getSignVerify(message.id)
      if (obj && obj.verifyFunc)
      {
        if (message.payload.op == "PUT" || message.payload.op == "ADD")
        {
          //verify all for now
          if(obj.verifyFunc(signature, key, message, data))
          {
            if (obj.postFunc){
              obj.postFunc(message)
            }
            return Promise.resolve(true)
          }
        }
      }
    } catch(error)
    {
      console.log(error)
    }
    return Promise.reject(false)
  }
}

function verifyRegistrySignature(signature, key, message) {
  const value = message.payload.value
  const set_key = message.payload.key
  const verify_address = web3.eth.accounts.recover(value.msg, signature)
  if (verify_address == set_key && value.msg.includes(value.address))
  {
    const extracted_address = "0x" + web3.utils.sha3(value.pub_key).substr(-40)
    //console.log("extracted address is:", extracted_address)
    if (extracted_address == value.address.toLowerCase())
    {

      const verify_ph_address = web3.eth.accounts.recover(value.ph, value.phs)
      if (verify_ph_address == value.address)
      {
        console.log("Key Verified: ", value.msg, " Signature: ", signature,  " Signed with: ", verify_address)
        return true
      }
    }
  }
  console.log("Verify failed...")
  return false
}

function verifyMessageSignature(keys_map)
{
  return (signature, key, message, buffer) => {
    console.log("Verify Message:", message, " key: ", key, " sig: ", signature)
    const verify_address = web3.eth.accounts.recover(buffer.toString("utf8"), signature)
    const entry = keys_map.get(key)
    //only two addresses should have write access to here
    if (entry.address == verify_address)
    {
      return true
    }
    return false
  }
}


function verifyConversationSignature(keys_map)
{
  return (signature, key, message, buffer) => {
    const verify_address = web3.eth.accounts.recover(buffer.toString("utf8"), signature)
    const eth_address = message.id.substr(-42) //hopefully the last 42 is the eth address
    if(key == message.payload.key || key == eth_address) //only one of the two conversers can set this parameter
    {
      const entry = keys_map.get(key)
      if (entry.address == verify_address)
      {
        return true
      }
    }
    return false
  }
}


function verifyConversers(conversee, keys_map){
  return (o, content_object) => {
    const check_string = joinConversationKey(conversee, o.parentSub) + content_object.ts.toString()

    const verify_address = web3.eth.accounts.recover(check_string, content_object.sig)

    const parent_key = keys_map.get(o.parentSub)
    const conversee_key = keys_map.get(conversee)

    if ((parent_key && verify_address == parent_key.address) || (conversee_key && verify_address == keys_map.get(conversee).address))
    {
      console.log("Verified conv init for: ", conversee, " Signature: ", content_object.sig,  " Signed with: ", verify_address)
      return true
    }
    return false
  }
}

//the OrbitDB should be the message one
const messagingRoomsMap = {}

async function startRoom(room_db, room_id, store_type, writers, share_func) {
  let key = room_id
  if (writers.length != 1 || writers[0] != "*")
  {
    key = room_id + "-" +  writers.join("-")
  }
  console.log("checking key:", key)
  if(!messagingRoomsMap[key])
  {
    messagingRoomsMap[key] = "pending"
    const room = await room_db[store_type](room_id, {write:writers})
    console.log("Room started:", room.id)
    if (share_func){
      share_func(room)
    }
    messagingRoomsMap[key] = room
    rebroadcastOnReplicate(room_db, room)
    //for persistence replace drop with below
    room.load()
  }
}

function joinConversationKey(converser1, converser2)
{
  const keys = [converser1, converser2]
  keys.sort()

  return keys.join('-')
}

function onConverse(room_db, conversee, payload){
    const converser = payload.key
    console.log("started conversation between:", converser, " and ", conversee)
    const writers = [converser, conversee].sort()
    startRoom(room_db, CONV, "eventlog", writers)
}

function handleGlobalRegistryWrite(conv_init_db, payload) {
  if (payload.op == "PUT")
  {
    const eth_address = payload.key
    console.log("started conversation for:", eth_address)
    startRoom(conv_init_db, CONV_INIT_PREFIX + eth_address, 'kvstore', ['*'])
  }
}

function rebroadcastOnReplicate(DB, db){
  db.events.on('replicated', (dbname) => {
    //rebroadcast
    DB._pubsub.publish(db.id,  db._oplog.heads)
  })
}

ipfs.id().then(async (peer_id) => {
    const orbit_global = new OrbitDB(ipfs, "odb/Main", {keystore:new InsertOnlyKeystore()})

    orbit_global.keystore.registerSignVerify(GLOBAL_KEYS, undefined, verifyRegistrySignature, message => {
        handleGlobalRegistryWrite(orbit_global, message.payload)
      })

    const global_registry = await orbit_global.kvstore(GLOBAL_KEYS, { write: ['*'] })
    rebroadcastOnReplicate(orbit_global, global_registry)

    orbit_global.keystore.registerSignVerify(CONV_INIT_PREFIX, undefined, verifyConversationSignature(global_registry),
      message => {
        const eth_address = message.id.substr(-42) //hopefully the last 42 is the eth address
        onConverse(orbit_global, eth_address, message.payload)
      })

    orbit_global.keystore.registerSignVerify(CONV, undefined, verifyMessageSignature(global_registry))

    console.log("Oribt registry started...:", global_registry.id)

    global_registry.events.on('ready', (address) => 
      {
        console.log("ready...", global_registry.all())
      })

    // testing it's best to drop this for now
    global_registry.load()
})

