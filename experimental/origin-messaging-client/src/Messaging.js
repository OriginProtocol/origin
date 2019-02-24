import secp256k1 from 'secp256k1'
import CryptoJS from 'crypto-js'
import cryptoRandomString from 'crypto-random-string'
import EventEmitter from 'events'
import Ajv from 'ajv'
import cookieStorage from './cookieStorage'
import createDebug from 'debug'

const debug = createDebug('messaging:')

const PROMPT_MESSAGE = 'I am ready to start messaging on Origin.'
const PROMPT_PUB_KEY = 'My public messaging key is: '
const MESSAGING_KEY = 'MK_'
const MESSAGING_PHRASE = 'MP_'
const PUB_MESSAGING_SIG = 'PMS_'
const PUB_MESSAGING = 'KEY_'
const PRE_GLOBAL_KEYS = ':global'
const PRE_CONV_INIT_PREFIX = ':convo-init-'
const PRE_CONV = ':conv'
const UNREAD_STATUS = 'unread'
const READ_STATUS = 'read'

const storeKeys = {
  messageSubscriptionStart: 'message_subscription_start',
  messageStatuses: 'message_statuses'
}

const MESSAGE_FORMAT = {
  type: 'object',
  required: ['created'],
  properties: {
    content: { type: 'string' },
    media: { type: 'array' },
    created: { type: 'number' },
    decryption: {
      type: 'object',
      required: ['keys', 'roomId'],
      properties: {
        keys: {
          type: 'array',
          items: { type: 'string' }
        },
        roomId: { type: 'string' }
      }
    }
  }
}
const validator = new Ajv()
const validateMessage = validator.compile(MESSAGE_FORMAT)

const DEFAULT_ORBIT_OPTIONS = { referenceCount: 0 }

class InsertOnlyKeystore {
  constructor(pubKey, privKey) {
    this._signVerifyRegistry = {}
    this._pubKey = pubKey
    this._privKey = privKey
  }

  registerSignVerify(db_id, signFunc, verifyFunc, postFunc) {
    this._signVerifyRegistry[db_id] = { signFunc, verifyFunc, postFunc }
  }

  getSignVerify(id) {
    const parts = id.split('/')
    const end = parts[parts.length - 1]

    const obj = this._signVerifyRegistry[end]
    if (obj) return obj

    for (const k of Object.keys(this._signVerifyRegistry)) {
      if (k.endsWith('-') && end.startsWith(k)) {
        return this._signVerifyRegistry[k]
      }
    }
  }

  getKey() {
    // for some reason Orbit requires a key for verify to be triggered
    return {
      getPublic: () => this._pubKey
    }
  }

  async exportPublicKey() {
    return this._pubKey
  }

  exportPrivateKey() {
    // This function should never be called
  }

  async importPublicKey(key) {
    return key
  }

  async importPrivateKey() {
    return this._privKey
  }

  async sign(key, data) {
    const message = JSON.parse(data)
    const obj = this.getSignVerify(message.id)
    if (obj && obj.signFunc) {
      return obj.signFunc(key, data)
    }
  }

  async verify(signature, key, data) {
    try {
      const message = JSON.parse(data)
      const obj = this.getSignVerify(message.id)
      if (obj && obj.verifyFunc) {
        if (message.payload.op == 'PUT' || message.payload.op == 'ADD') {
          // verify all for now
          if (await obj.verifyFunc(signature, key, message, data)) {
            if (obj.postFunc) {
              obj.postFunc(message)
            }
            return true
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
    throw new Error('Cannot verify signature')
  }
}

class Messaging {
  constructor({
    contractService,
    ipfsCreator,
    OrbitDB,
    ecies,
    messagingNamespace,
    globalKeyServer,
    personalSign = true,
    walletLinker
  }) {
    this.contractService = contractService
    this.web3 = this.contractService.web3
    this.ipfsCreator = ipfsCreator
    this.OrbitDB = OrbitDB
    this.sharedRooms = {}
    this.convs = {}
    this.ecies = ecies
    this.events = new EventEmitter()
    this.globalKeyServer = globalKeyServer
    this.personalSign = personalSign
    this.GLOBAL_KEYS = messagingNamespace + PRE_GLOBAL_KEYS
    this.CONV = messagingNamespace + PRE_CONV
    this.CONV_INIT_PREFIX = messagingNamespace + PRE_CONV_INIT_PREFIX

    this.cookieStorage = new cookieStorage({
      path:
        typeof location === 'object' && location.pathname
          ? location.pathname
          : '/'
    })

    //default to cookieStorage
    this.currentStorage = this.cookieStorage

    this.walletLinker = walletLinker
    this.registerWalletLinker()
  }

  registerWalletLinker() {
    const walletLinker = this.linker || this.contractService.walletLinker
    if (walletLinker) {
      walletLinker.registerCallback('messaging', this.onPreGenKeys.bind(this))
    }
  }

  onAccount(account_key) {
    if ((account_key && !this.account_key) || account_key != this.account_key) {
      this.checkSetCurrentStorage(account_key)
      this.init(account_key)
    }
  }

  checkSetCurrentStorage(account_key) {
    if (sessionStorage.getItem(`${MESSAGING_KEY}:${account_key}`)) {
      this.currentStorage = sessionStorage
    } else {
      this.currentStorage = this.cookieStorage
    }
  }

  //helper function for use by outside services
  preGenKeys(web3Account) {
    const sig_phrase = PROMPT_MESSAGE
    const signature = web3Account.sign(sig_phrase).signature
    console.log('We got a signature of: ', signature)

    const sig_key = signature.substring(0, 66)
    const msg_account = this.web3.eth.accounts.privateKeyToAccount(sig_key)

    const pub_msg = PROMPT_PUB_KEY + msg_account.address
    const pub_sig = web3Account.sign(pub_msg).signature
    return {
      account: web3Account.address,
      sig_phrase,
      sig_key,
      pub_msg,
      pub_sig
    }
  }

  async onPreGenKeys(data) {
    const account_id = data.account
    const sig_key = data.sig_key
    const sig_phrase = data.sig_phrase
    const pub_msg = data.pub_msg
    const pub_sig = data.pub_sig
    const accounts = await this.web3.eth.getAccounts()
    if (account_id === accounts[0]) {
      this.currentStorage = sessionStorage
      this.setKeyItem(`${MESSAGING_KEY}:${account_id}`, sig_key)
      this.setKeyItem(`${MESSAGING_PHRASE}:${account_id}`, sig_phrase)
      this.setKeyItem(`${PUB_MESSAGING}:${account_id}`, pub_msg)
      this.setKeyItem(`${PUB_MESSAGING_SIG}:${account_id}`, pub_sig)
      this.pub_sig = pub_sig
      this.pub_msg = pub_msg
      if (account_id == this.account_key) {
        this.startConversing()
      }
    }
  }

  setKeyItem(key, value) {
    this.currentStorage.setItem(key, value)
  }

  getKeyItem(key) {
    return this.currentStorage.getItem(key)
  }

  getMessagingKey() {
    return this.getKeyItem(`${MESSAGING_KEY}:${this.account_key}`)
  }

  getMessagingPhrase() {
    return this.getKeyItem(`${MESSAGING_PHRASE}:${this.account_key}`)
  }

  initKeys() {
    const sig_key = this.getMessagingKey()
    const sig_phrase = this.getMessagingPhrase()
    // lock in the message to the hardcoded one
    if (sig_key && sig_phrase == PROMPT_MESSAGE) {
      this.setAccount(sig_key, sig_phrase)
    } else {
      this.promptInit()
    }
  }

  startConversing() {
    debug('startConversing')
    if (this.ipfs_bound_account == this.account_key && !this.account) {
      // remote has been initialized
      this.initKeys()
    } else {
      this.convs_enabled = true
    }
  }

  async init(key) {
    debug('init', key)

    // Reset state...
    this.convs = {}
    this.convs_enabled = false
    clearInterval(this.refreshIntervalId)
    Object.keys(this.sharedRooms).forEach(room =>
      this.sharedRooms[room].close()
    )
    this.sharedRooms = {}
    Object.keys(this.events._events).forEach(k => {
      if (k.indexOf('SharedRoom') === 0) {
        context.messaging.events.removeAllListeners(k)
      }
    })
    if (this.ipfs) {
      await this.main_orbit.disconnect()
      await this.ipfs.shutdown()
      delete this.ipfs
      delete this.main_orbit
    }

    this.account_key = key
    this.account = undefined
    this.events.emit('new', this.account_key)
    // just start it up here
    if (await this.initRemote()) {
      this.pub_sig = this.getKeyItem(`${PUB_MESSAGING_SIG}:${this.account_key}`)
      this.pub_msg = this.getKeyItem(`${PUB_MESSAGING}:${this.account_key}`)

      this.initConvs()
      this.events.emit('initialized', this.account_key)
      if (this.convs_enabled || this.getMessagingKey()) {
        this.initKeys()
      }
    }
    // bootstrap read status
    const scopedSubStartKeyName = `${storeKeys.messageSubscriptionStart}:${
      this.account_key
    }`
    if (!localStorage.getItem(scopedSubStartKeyName)) {
      localStorage.setItem(scopedSubStartKeyName, JSON.stringify(Date.now()))
    }
    const scopedStatusesKeyName = `${storeKeys.messageStatuses}:${
      this.account_key
    }`
    if (!localStorage.getItem(scopedStatusesKeyName)) {
      localStorage.setItem(scopedStatusesKeyName, JSON.stringify({}))
    }
  }

  refreshPeerList() {
    debug('refreshPeerList')
    this.ipfs.swarm.peers().then(peers => {
      const peer_ids = peers.map(x => x.peer._idB58String)
      if (
        (peer_ids && !this.last_peers) ||
        (peer_ids && peer_ids.sort().join() !== this.last_peers.sort().join())
      ) {
        this.last_peers = peer_ids
        console.log('New peers:', this.last_peers)
      }
      //let's do a 15 second reconnect policy
      if (
        this.ipfs.__reconnect_peers &&
        Date.now() - this.last_connect_time > 20000 &&
        this.last_peers
      ) {
        this.last_connect_time = Date.now()
        //every 20 seconds either connect or ping
        for (const peer of Object.keys(this.ipfs.__reconnect_peers)) {
          if (!this.last_peers.includes(peer)) {
            const peer_address = this.ipfs.__reconnect_peers[peer]
            console.log('Reconnecting:', peer_address)
            this.ipfs.swarm.connect(peer_address)
          }
        }
      }
    })
  }

  initConvs() {
    debug('initConvs')
    this.main_orbit.keystore.registerSignVerify(
      this.CONV_INIT_PREFIX,
      this.signInitPair.bind(this),
      this.verifyConversationSignature.bind(this),
      message => {
        const eth_address = message.id.substr(-42) // hopefully the last 42 is the eth address
        debug('convInit', eth_address, this.account_key)
        if (eth_address == this.account_key) {
          this.events.emit('pending_conv', message.payload.key)
          const remote_address = message.payload.key
          this.initRoom(remote_address)
          // may be overkill but may help prevent https://github.com/OriginProtocol/origin-js/issues/559
          this.getConvo(remote_address)
        }
      }
    )
    this.main_orbit.keystore.registerSignVerify(
      this.CONV,
      this.signInitPair.bind(this),
      this.verifyMessageSignature.bind(this)
    )

    this.watchMyConv()
  }

  orbitStoreOptions(options) {
    return Object.assign(Object.assign({}, DEFAULT_ORBIT_OPTIONS), options)
  }

  async initRemote() {
    debug('initRemote')
    this.ipfs = this.ipfsCreator(this.account_key)

    return new Promise((resolve, reject) => {
      this.ipfs
        .on('ready', async () => {
          debug('ipfsReady')
          if (this.refreshIntervalId) {
            clearInterval(this.refreshIntervalId)
          }

          this.last_connect_time = Date.now()
          this.refreshIntervalId = setInterval(
            this.refreshPeerList.bind(this),
            5000
          )

          const main_keystore = new InsertOnlyKeystore(this.account_key, '-')
          this.main_orbit = new this.OrbitDB(
            this.ipfs,
            'main_orbit' + this.account_key,
            { keystore: main_keystore }
          )

          main_keystore.registerSignVerify(
            this.GLOBAL_KEYS,
            this.signRegistry.bind(this),
            this.verifyRegistrySignature.bind(this),
            this.postVerifyRegistry.bind(this)
          )

          // took a hint from peerpad
          this.global_keys = await this.main_orbit.kvstore(
            this.GLOBAL_KEYS,
            this.orbitStoreOptions({ write: ['*'] })
          )

          this.events.emit('initRemote')

          try {
            // await this.global_keys.load()
            this.global_keys.load()
          } catch (error) {
            console.error(error)
          }

          this.ipfs_bound_account = this.account_key
          resolve(this.global_keys)
        })
    })
  }

  signRegistry() {
    return this.pub_sig
  }

  signMessaging(key, data) {
    return this.account.sign(data).signature
  }

  signInitPair(key, data) {
    return this.account.sign(data).signature
  }

  async verifySignature() {
    return (/* signature, key, data */) => {
      // pass through for now
      return true
    }
  }

  postVerifyRegistry(message) {
    const set_key = message.payload.key
    this.events.emit('registered-' + set_key, message.payload.value)
  }

  async getGlobalKey(key) {
    if (!this.globalKeyServer) {
      return this.global_keys.get(key)
    }
    try {
      const res = await fetch(`${this.globalKeyServer}/accounts/${key}`, {
        headers: { 'content-type': 'application/json' }
      })
      return await res.json()
    } catch (e) {
      return
    }
  }

  async getRegisteredKey(key) {
    const entry = await this.getGlobalKey(key)
    if (entry) {
      return entry
    } else {
      return new Promise(resolve => {
        //resolve to nothing after a second
        setTimeout(resolve, 5000)
        this.events.on('registered-' + key, entry => {
          resolve(entry)
        })
      })
    }
  }

  async verifyRegistrySignature(signature, key, message) {
    const value = message.payload.value
    const set_key = message.payload.key
    const verify_address = this.web3.eth.accounts.recover(value.msg, signature)
    if (verify_address == set_key && value.msg.includes(value.address)) {
      const extracted_address =
        '0x' + this.web3.utils.sha3(value.pub_key).substr(-40)
      if (extracted_address == value.address.toLowerCase()) {
        const verify_ph_address = this.web3.eth.accounts.recover(
          value.ph,
          value.phs
        )
        return verify_ph_address == value.address
      }
    }
    return false
  }

  async verifyMessageSignature(signature, key, message, buffer) {
    const verify_address = this.web3.eth.accounts.recover(
      buffer.toString('utf8'),
      signature
    )
    const entry = await this.getRegisteredKey(key)
    // only two addresses should have write access to here
    if (entry && entry.address == verify_address) {
      return true
    }
    return false
  }

  async verifyConversationSignature(signature, key, message, buffer) {
    const verify_address = this.web3.eth.accounts.recover(
      buffer.toString('utf8'),
      signature
    )
    const eth_address = message.id.substr(-42) //hopefully the last 42 is the eth address
    if (key == message.payload.key || key == eth_address) {
      // only one of the two conversers can set this parameter
      const entry = await this.getRegisteredKey(key)
      if (entry && entry.address == verify_address) {
        return true
      }
    }
    return false
  }

  async initMessaging() {
    debug('initMessaging')
    const entry = await this.getRemoteMessagingSig()
    const account_match = entry && entry.address == this.account.address
    if (!(this.pub_sig && this.pub_msg)) {
      if (account_match && entry.sig && entry.msg) {
        this.pub_sig = entry.sig
        this.pub_msg = entry.msg
      } else {
        await this.promptForSignature()
      }
    } else if (!account_match) {
      this.setRemoteMessagingSig()
    }
    this.events.emit('ready', this.account_key)
    this.loadMyConvs()
  }

  async getRemoteMessagingSig() {
    const entry = await this.getGlobalKey(this.account_key)
    if (entry && entry.address == this.account.address) {
      return entry
    }
  }

  setRemoteMessagingSig() {
    debug('setRemoteMessagingSig', this.account_key)
    const msg = this.getMessagingPhrase()
    this.global_keys.set(this.account_key, {
      address: this.account.address,
      msg: this.pub_msg,
      pub_key: this.account.publicKey,
      ph: msg,
      phs: this.account.sign(msg).signature
    })
  }

  setAccount(key_str, phrase_str) {
    debug('setAccount', key_str, phrase_str)
    this.account = this.web3.eth.accounts.privateKeyToAccount(key_str)
    this.account.publicKey =
      '0x' +
      secp256k1
        .publicKeyCreate(new Buffer(key_str.substring(2), 'hex'), false)
        .slice(1)
        .toString('hex')
    // send it to local storage
    const scopedMessagingKeyName = `${MESSAGING_KEY}:${this.account_key}`
    this.setKeyItem(scopedMessagingKeyName, key_str)
    //set phrase in the cookie
    const scopedMessagingPhraseName = `${MESSAGING_PHRASE}:${this.account_key}`
    this.setKeyItem(scopedMessagingPhraseName, phrase_str)
    this.initMessaging()
  }

  async promptInit() {
    debug('promptInit', this.account_key)
    const sig_phrase = PROMPT_MESSAGE
    const signer = this.personalSign ? this.web3.eth.personal : this.web3.eth
    const signature = await signer.sign(sig_phrase, this.account_key)
    debug('signedSig', signature)
    this.events.emit('signedSig')

    // 32 bytes in hex + 0x
    const sig_key = signature.substring(0, 66)

    // Delay to prevent hidden MetaMask popup
    setTimeout(() => this.setAccount(sig_key, sig_phrase), 500)
  }

  async promptForSignature() {
    debug('promptForSignature', this.account_key)
    this.pub_msg = PROMPT_PUB_KEY + this.account.address
    const signer = this.personalSign ? this.web3.eth.personal : this.web3.eth
    this.pub_sig = await signer.sign(this.pub_msg, this.account_key)
    const scopedPubSigKeyName = `${PUB_MESSAGING_SIG}:${this.account_key}`
    this.setKeyItem(scopedPubSigKeyName, this.pub_sig)
    const scopedPubMessagingKeyName = `${PUB_MESSAGING}:${this.account_key}`
    this.setKeyItem(scopedPubMessagingKeyName, this.pub_msg)
    this.setRemoteMessagingSig()
  }

  async getShareRoom(room_id, db_type, writers, onShare) {
    let key = room_id
    if (writers.length != 1 || writers[0] != '*') {
      key = room_id + '-' + writers.join('-')
    }
    if (this.sharedRooms[key]) {
      if (this.sharedRooms[key] == 'wait') {
        return new Promise(resolve => {
          this.events.on('SharedRoom.' + key, room => {
            console.log('Returning shared room:', key)
            resolve(room)
          })
        })
      } else {
        return this.sharedRooms[key]
      }
    } else {
      this.sharedRooms[key] = 'wait'
      const r = await this.main_orbit[db_type](
        room_id,
        this.orbitStoreOptions({ write: writers })
      )
      this.sharedRooms[key] = r
      this.events.emit('SharedRoom.' + key, r)
      if (onShare) {
        onShare(r)
      }
      debug('loadRoom', room_id)
      await r.load()
      debug('loadedRoom', room_id)
      return r
    }
  }

  generateRoomId(converser1, converser2) {
    const keys = [
      this.web3.utils.toChecksumAddress(converser1),
      this.web3.utils.toChecksumAddress(converser2)
    ]
    keys.sort()

    return keys.join('-')
  }

  isRoomId(str) {
    return str.includes('-')
  }

  getRecipients(key) {
    return key.split('-')
  }

  getSharedKeys(room_id) {
    const room = this.convs[room_id]

    return room ? room.keys || [] : []
  }

  getConvo(eth_address) {
    const room = this.CONV_INIT_PREFIX + eth_address
    return this.getShareRoom(room, 'kvstore', ['*'])
  }

  hasConversedWith(eth_address) {
    const room_id = this.generateRoomId(this.account_key, eth_address)

    return this.convs[room_id]
  }

  decryptMsg(iv_str, msg, key) {
    const buffer = CryptoJS.AES.decrypt(msg, key, {
      iv: CryptoJS.enc.Base64.parse(iv_str)
    })
    let out_text
    try {
      out_text = buffer.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      return
    }

    if (out_text && out_text.length > 6) {
      const verify_text = out_text.slice(0, -6)
      const sha_check = out_text.substr(-6)
      if (
        sha_check ==
        CryptoJS.enc.Base64.stringify(CryptoJS.SHA1(verify_text)).substr(0, 6)
      ) {
        return verify_text
      }
    }
  }

  processEntry(entry, conv_obj, onMessage, onEncrypted) {
    for (const v of entry.payload.value) {
      if (v.type == 'key') {
        if (v.address == this.account_key) {
          const key = this.ec_decrypt(v.ekey)
          if (key && !conv_obj.keys.includes(key)) {
            conv_obj.keys.push(key)
          }
        }
      } else if (v.type == 'msg') {
        let decrypted = false
        for (const key of conv_obj.keys) {
          const buffer = this.decryptMsg(v.i, v.emsg, key)
          if (buffer != undefined) {
            let obj = buffer
            try {
              obj = JSON.parse(buffer)
            } catch (error) {
              // pass
            }
            if (!validateMessage(obj)) {
              // force it to be an object
              continue
            }
            onMessage(obj, v.address)
            decrypted = true
            break
          }
        }
        if (!decrypted && onEncrypted) {
          onEncrypted(v.emsg, v.address)
        }
      }
    }
  }

  processMessage(room_id, room, ignore_current_hash) {
    if (!this.convs[room_id]) {
      this.convs[room_id] = { keys: [] }
    }
    const conv_obj = this.convs[room_id]
    const last_hashes = ignore_current_hash ? [] : conv_obj.last_hashes || []
    const ops = room._index.get()
    const hashes = ops.map(e => e.hash)
    const recipients = this.getRecipients(room_id)
    const messageStatuses = JSON.parse(
      localStorage.getItem(`${storeKeys.messageStatuses}:${this.account_key}`)
    )
    // convert stored timestamp string to date
    const subscriptionStart = new Date(
      +localStorage.getItem(
        `${storeKeys.messageSubscriptionStart}:${this.account_key}`
      )
    )

    ops.forEach((entry, index) => {
      if (index == last_hashes.indexOf(entry.hash)) {
        // we seen this already
        return
      }

      const withStatus = (obj, senderAddress) => {
        const isWatched = obj.created > subscriptionStart
        const status =
          isWatched && messageStatuses[entry.hash] !== READ_STATUS
            ? UNREAD_STATUS
            : READ_STATUS

        return Object.assign({}, obj, {
          hash: entry.hash,
          roomId: room_id,
          index,
          recipients,
          senderAddress,
          status
        })
      }

      this.processEntry(
        entry,
        conv_obj,
        (message, address) => {
          this.events.emit('msg', withStatus(message, address))
        },
        (emessage, address) => {
          this.events.emit('emsg', withStatus(emessage, address))
        }
      )
    })

    conv_obj.last_hashes = hashes
    conv_obj.last_hash = hashes[hashes.length - 1]
  }

  getAllMessages(remote_eth_address) {
    const room_id = this.generateRoomId(this.account_key, remote_eth_address)
    const conv_obj = this.convs[room_id]

    if (conv_obj) {
      const room = this.sharedRooms[this.CONV + '-' + room_id]
      const ops = room._index.get()
      const messages = []
      ops.forEach((entry, index) => {
        this.processEntry(entry, conv_obj, (message, address) => {
          messages.push({ msg: message, index, address, hash: entry.hash })
        })
      })
      return messages
    }
  }

  getAllRawMessages(remote_eth_address) {
    const room_id = this.generateRoomId(this.account_key, remote_eth_address)
    const conv_obj = this.convs[room_id]

    if (conv_obj) {
      const room = this.sharedRooms[this.CONV + '-' + room_id]
      const ops = room._index.get()
      const messages = []
      ops.forEach(entry => {
        for (const v of entry.payload.value) {
          messages.push(v)
        }
      })
      return messages
    }
  }

  getMessagesCount(remote_eth_address) {
    const room_id = this.generateRoomId(this.account_key, remote_eth_address)
    const conv_obj = this.convs[room_id]

    if (conv_obj) {
      const room = this.sharedRooms[this.CONV + '-' + room_id]
      const ops = room._index.get()
      let messages_count = 0
      ops.forEach(entry => {
        for (const v of entry.payload.value) {
          if (v.type == 'msg') {
            messages_count += 1
          }
        }
      })
      return messages_count
    }
  }

  async initRoom(room_id_or_address, keys = []) {
    debug('initRoom', room_id_or_address)
    let room_id, writers
    // called by an arbitrator who has key(s)
    if (this.isRoomId(room_id_or_address)) {
      room_id = room_id_or_address
      writers = this.getRecipients(room_id_or_address).sort()

      this.convs[room_id_or_address] = { keys }
      // called by a participant in the conversation
    } else {
      writers = [this.account_key, room_id_or_address].sort()
      room_id = this.generateRoomId(...writers)
    }

    const room = await this.getShareRoom(
      this.CONV,
      'eventlog',
      writers,
      room => {
        debug('addRoomEvents', room_id)
        room.events.on('write', (/* dbname, entry, items */) => {
          debug('roomWrite', room_id)
          this.processMessage(room_id, room)
        })
        room.events.on('ready', (/* dbname, entry, items */) => {
          debug('roomReady', room_id)
          this.processMessage(room_id, room)
        })
        room.events.on('replicated', (/* dbname */) => {
          debug('roomReplicated', room_id)
          this.processMessage(room_id, room)
        })
      }
    )
    return room
  }

  async watchMyConv() {
    await this.getConvo(this.account_key)
  }

  async getMyConvs() {
    const watchConv = await this.getConvo(this.account_key)
    return watchConv.all()
  }

  async loadMyConvs() {
    for (const k of Object.keys(await this.getMyConvs())) {
      this.initRoom(k)
    }
  }

  ec_encrypt(text, pub_key) {
    const plaintext = new Buffer(text)
    if (!pub_key) {
      pub_key = this.account.publicKey
    }
    return this.ecies
      .encrypt(new Buffer(pub_key.substring(2), 'hex'), plaintext)
      .toString('hex')
  }

  ec_decrypt(buffer) {
    if (this.account) {
      return this.ecies
        .decrypt(
          new Buffer(this.account.privateKey.substring(2), 'hex'),
          new Buffer(buffer, 'hex')
        )
        .toString('utf8')
    }
  }

  async canConverseWith(remote_eth_address) {
    const address = this.web3.utils.toChecksumAddress(remote_eth_address)
    const globalKey = await this.getGlobalKey(address)
    return this.canSendMessages() && this.account_key !== address && globalKey
  }

  async canReceiveMessages(remote_eth_address) {
    const address = this.web3.utils.toChecksumAddress(remote_eth_address)
    return await this.getGlobalKey(address)
  }

  canSendMessages() {
    const { account, account_key } = this

    return account && account_key
  }

  async startConv(remote_eth_address) {
    debug('startConv', remote_eth_address)
    const entry = await this.getGlobalKey(remote_eth_address)

    if (!entry) {
      debug('remote account messaging disabled')
      return
    }

    const self_init_conv = await this.getConvo(this.account_key)
    const remote_init_conv = await this.getConvo(remote_eth_address)
    const ts = Date.now()

    remote_init_conv.set(this.account_key, ts)
    self_init_conv.set(remote_eth_address, ts)

    const room = await this.initRoom(remote_eth_address)

    // we haven't put any keys here yet
    if (room.iterator({ limit: 2 }).collect().length < 2) {
      const encrypt_key = cryptoRandomString(32).toString('hex')

      await room.add([
        {
          type: 'key',
          ekey: this.ec_encrypt(encrypt_key),
          maddress: this.account.address,
          address: this.account_key
        },
        {
          type: 'key',
          ekey: this.ec_encrypt(encrypt_key, entry.pub_key),
          maddress: entry.address,
          address: remote_eth_address
        }
      ])
    }
    return room
  }

  async sendConvMessage(room_id_or_address, message_obj) {
    debug('sendConvMessage', room_id_or_address, message_obj)
    if (this._sending_message) {
      debug('ERR: already sending message')
      return false
    }
    let remote_eth_address, room_id
    if (this.isRoomId(room_id_or_address)) {
      room_id = room_id_or_address
      remote_eth_address = this.getRecipients(room_id).find(
        addr => addr !== this.account_key
      )
    } else {
      remote_eth_address = room_id_or_address
      if (!this.web3.utils.isAddress(remote_eth_address)) {
        throw new Error(`${remote_eth_address} is not a valid Ethereum address`)
      }
      room_id = this.generateRoomId(this.account_key, remote_eth_address)
    }
    remote_eth_address = this.web3.utils.toChecksumAddress(remote_eth_address)
    let room
    if (this.convs[room_id] && this.convs[room_id].keys.length) {
      room = await this.initRoom(remote_eth_address)
    } else {
      room = await this.startConv(remote_eth_address)
    }
    if (!room) {
      debug('ERR: no room to send message to')
      return
    }

    if (typeof message_obj == 'string') {
      message_obj = { content: message_obj }
    }
    const message = Object.assign({}, message_obj)
    // set timestamp
    message.created = Date.now()

    if (!validateMessage(message)) {
      debug('ERR: invalid message')
      return false
    }
    const key = this.convs[room_id].keys[0]
    const iv = CryptoJS.lib.WordArray.random(16)
    const message_str = JSON.stringify(message)
    const sha_sub = CryptoJS.enc.Base64.stringify(
      CryptoJS.SHA1(message_str)
    ).substr(0, 6)
    const encmsg = CryptoJS.AES.encrypt(message_str + sha_sub, key, {
      iv: iv
    }).toString()
    const iv_str = CryptoJS.enc.Base64.stringify(iv)
    this._sending_message = true
    // include a random iv str so that people can't match strings of the same message
    await room.add([
      { type: 'msg', emsg: encmsg, i: iv_str, address: this.account_key }
    ])
    debug('room.add OK')
    this._sending_message = false
    return room_id
  }

  // messages supplied by the 'msg' event have status included
  // this is a convenience method for tracking status on spoofed messages
  getStatus({ hash }) {
    const messageStatuses = JSON.parse(
      localStorage.getItem(`${storeKeys.messageStatuses}:${this.account_key}`)
    )
    const status =
      messageStatuses && messageStatuses[hash] === READ_STATUS
        ? READ_STATUS
        : UNREAD_STATUS
    return status
  }

  // we allow the entire message to be passed in (for consistency with other resources + convenience)
  // however all we are updating is the status
  set({ hash, status }) {
    const scopedStatusesKeyName = `${storeKeys.messageStatuses}:${
      this.account_key
    }`
    const messageStatuses = JSON.parse(
      localStorage.getItem(scopedStatusesKeyName)
    )
    messageStatuses[hash] = status
    localStorage.setItem(scopedStatusesKeyName, JSON.stringify(messageStatuses))
  }
}

export default Messaging
