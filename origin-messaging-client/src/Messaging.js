import secp256k1 from 'secp256k1'
import CryptoJS from 'crypto-js'
import cryptoRandomString from 'crypto-random-string'
import EventEmitter from 'events'
import Ajv from 'ajv'
import cookieStorage from './cookieStorage'
import createDebug from 'debug'

import stringify from 'json-stable-stringify'

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

class Messaging {
  constructor({
    contractService,
    ecies,
    messagingNamespace,
    globalKeyServer,
    personalSign = true,
    walletLinker
  }) {
    this.contractService = contractService
    this.web3 = this.contractService.web3
    this.sharedRooms = {}
    this.convs = {}
    this.ecies = ecies
    this.events = new EventEmitter()
    this.globalKeyServer = globalKeyServer
    this.personalSign = personalSign
    this.messagingNamespace = messagingNamespace

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

    this._registryCache = {}
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
    debug('onPreGenKeys')
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
    if (!this.account) {
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

    this.account_key = key
    this.account = undefined
    this.events.emit('new', this.account_key)
    // just start it up here
    if (await this.initRemote()) {
      this.pub_sig = this.getKeyItem(`${PUB_MESSAGING_SIG}:${this.account_key}`)
      this.pub_msg = this.getKeyItem(`${PUB_MESSAGING}:${this.account_key}`)

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

  orbitStoreOptions(options) {
    return Object.assign(Object.assign({}, DEFAULT_ORBIT_OPTIONS), options)
  }

  async initRemote() {
    debug('initRemote')
    this.events.emit('initRemote')
    return true
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

  async getGlobalKey(key) {
    if (!this.globalKeyServer) {
      throw new Error("Global key server required")
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
    const entry = this._registryCache[key]
    if (entry) {
      return entry
    }
    const serverResponse = await fetch(
      `${this.globalKeyServer}/accounts/${key}`
    )
    if (serverResponse.status === 200) {
      const j_entry = await serverResponse.json()
      this._registryCache[key] = j_entry
      return j_entry
    }
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

  async setRemoteMessagingSig() {
    debug('setRemoteMessagingSig', this.account_key)
    const msg = this.getMessagingPhrase()
    const body = {
      signature: this.pub_sig,
      data: {
        address: this.account.address,
        msg: this.pub_msg,
        pub_key: this.account.publicKey,
        ph: msg,
        phs: this.account.sign(msg).signature
      }
    }
    const response = await fetch(
      `${this.globalKeyServer}/accounts/${this.account_key}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }
    )
    if (response.status != 200) {
      console.log('setting registry failed:', response)
    }
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
    const room_id = this.generateRoomId(this.account_key, eth_address)
    return this.convs[room_id]
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

  processContent(content, conv_obj, onMessage, onEncrypted) {
    if (content.type == 'keys') {
      for (const v of content.keys) {
        if (v.address == this.account_key) {
          let key
          try {
            key = this.ec_decrypt(v.ekey)
          } catch (e) {
            /* Ignore */
          }
          if (key && !conv_obj.keys.includes(key)) {
            conv_obj.keys.push(key)
          }
        }
      }
    } else if (content.type == 'msg') {
      const v = content
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

  onMessageUpdate(entry) {
    debug("we got a update entry:", entry)
    const {content, conversationId, conversationIndex} = entry
    if (content && conversationId) {
      if(!this.convs[conversationId]) {
        this.getRoom(conversationId)
      } else {
        const conv_obj = this.convs[conversationId]
        if (conversationIndex != conv_obj.conversationIndex + 1) {
          this.processContent(
            entry.content,
            conv_obj,
            (msg, address) => {
              const message = this.toMessage(msg, conversationId, entry, address)
              conv_obj.messages.push(message)
              debug("message:", message)
              this.events.emit('msg', message)
            },
            (msg, address) => {
              this.events.emit('emsg', this.toMessage(msg, conversationId, entry, address))
            }
          )
          conv_obj.lastConversationIndex = entry.conversationIndex
          conv_obj.messageCount = entry.conversationIndex + 1
        } else {
          // we are missing a message
          this.getRoom(conversationId)
        }
      }
    }
  }

  getMessageId(room_id, container) {
    return room_id + "." + container.conversationIndex
  }

  toMessage(msg, room_id, container, address) {
    return { msg: msg, room_id, index:container.conversationIndex, address, hash: this.getMessageId(room_id, container)}
  }

  async getRoom(room_id) {
    const conv_obj = { keys: [], messages: [] }
    this.convs[room_id] = conv_obj

    const res = await fetch(`${this.globalKeyServer}/messages/${room_id}`, {
        headers: { 'content-type': 'application/json' }
    })
    const messages = await res.json()

    messages.forEach((entry) => {
      this.processContent(
        entry.content,
        conv_obj,
        (msg, address) => {
          const message = this.toMessage(msg, room_id, entry, address)
          conv_obj.messages.push(message)
          debug("msg:", message)
          this.events.emit('msg', message)
        },
        (msg, address) => {
          this.events.emit('emsg', this.toMessage(msg, room_id, entry, address))
        }
      )
      conv_obj.lastConversationIndex = entry.conversationIndex
      conv_obj.messageCount = entry.conversationIndex + 1
    })
  }

  getMessagesCount(remote_eth_address) {
    const room_id = this.generateRoomId(this.account_key, remote_eth_address)
    const conv_obj = this.convs[room_id]

    if (conv_obj) {
      return conv_obj.messageCount
    }
    return 0
  }

  async fetchConvs() {
    const res = await fetch(`${this.globalKeyServer}/conversations/${this.account_key}`, {
      headers: { 'content-type': 'application/json' }
    })
    return await res.json()
  }

  listenForUpdates() {
    if (this.ws) {
      this.ws.close()
    }
    const wsServer = this.globalKeyServer.replace(/^http/, 'ws')
    const wsUrl = `${wsServer}/message-events/${this.account_key}`
    const ws = new WebSocket(wsUrl)
    this.ws = ws

    ws.onmessage = e => this.onMessageUpdate(JSON.parse(e.data))

    //reconnect to messaging
    ws.onclose = e => {
      if (e.code != 1000) {
        // If this is an abnormal close, try to reopen soon.
        setTimeout(() => {
          if (this.ws === ws) {
            // load them back up in case we miss something
            this.loadMyConvs()
          }
        }, 30000)
      }
    }
  }

  async loadMyConvs() {
    debug("loading convs:")
    for (const conv of await this.fetchConvs()) {
      // TODO: make use of the count and do actual lazy loading!
      this.getRoom(conv.id)
    }
    this.listenForUpdates()
  }

  async getMyConvs() {
    const out_convs = {}
    for (const id of Object.keys(this.convs)) {
      const recipients = this.getRecipients(id)
      if (recipients.length == 2)
      {
        const remote_eth_address = recipients.find(
            addr => addr !== this.account_key
          )
        out_convs[remote_eth_address] = new Date()
      }
      else
      {
        out_convs[id] = new Date()
      }
    }
    return out_convs
  }

  getAllMessages(remote_eth_address) {
    const room_id = this.generateRoomId(this.account_key, remote_eth_address)
    const conv_obj = this.convs[room_id]

    if (conv_obj) {
      return conv_obj.messages
    }
    return []
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
    const { account_key } = this
    const address = this.web3.utils.toChecksumAddress(remote_eth_address)
    const entry = await this.getRegisteredKey(address)

    return this.canSendMessages() && account_key !== address && entry
  }

  async canReceiveMessages(remote_eth_address) {
    const address = this.web3.utils.toChecksumAddress(remote_eth_address)
    return Boolean(await this.getRegisteredKey(address))
  }

  canSendMessages() {
    const { account, account_key } = this

    return account && account_key
  }

  async addRoomMsg(conversationId, conversationIndex, content) {
    const data = stringify({conversationId, conversationIndex, content})
    const signature = this.account.sign(data).signature
    const response = await fetch(
      `${this.globalKeyServer}/messages/${conversationId}/${conversationIndex}`,
      {
        method: 'POST',
        body: JSON.stringify({content, signature}),
        headers: { 'content-type': 'application/json' }
      }
    )
    if (response.status != 200) {
      // for whatever reason we cannot create a message might want to refresh
      // status 409 is semi expected because that's a conflict in indicies
      return false
    }
    return true
  }

  async startConv(remote_eth_address) {
    debug('startConv', remote_eth_address)
    const entry = await this.getRegisteredKey(remote_eth_address)

    if (!entry) {
      debug('remote account messaging disabled')
      return
    }
  
    const room_id = this.generateRoomId(this.account_key, remote_eth_address)
    const conv_obj = this.convs[room_id] || {keys:[], messageCount:0}

    if (!conv_obj.keys.length) {
      //
      // a conversation haven't even been started yet
      //
      const conversationIndex = conv_obj ? conv_obj.messageCount : 0
      const encrypt_key = cryptoRandomString(32).toString('hex')

      const keys_content = ({type:"keys", address:this.account_key, keys:[ {
        ekey: this.ec_encrypt(encrypt_key),
        maddress: this.account.address,
        address: this.account_key
      },
        {
          ekey: this.ec_encrypt(encrypt_key, entry.pub_key),
          maddress: entry.address,
          address: remote_eth_address
        }
      ]})
      const result = await this.addRoomMsg(room_id, conversationIndex, keys_content)

      if (result) {
        conv_obj.keys.push(encrypt_key)
        conv_obj.messageCount += 1
      }
    }
    return conv_obj
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
    const conv_obj = await this.startConv(remote_eth_address)
    if (!conv_obj) {
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
    const key = conv_obj.keys[0]
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
    if (await this.addRoomMsg(room_id, conv_obj.messageCount, { type: 'msg', emsg: encmsg, i: iv_str, address: this.account_key }))
    {
      debug('room.add OK')
      //do something different if this succeeds
    } else {
      debug('Err: cannot add message.')
    }
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
