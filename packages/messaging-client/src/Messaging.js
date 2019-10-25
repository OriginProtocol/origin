'use strict'

import secp256k1 from 'secp256k1'
import CryptoJS from 'crypto-js'
import cryptoRandomString from 'crypto-random-string'
import EventEmitter from 'events'
import Ajv from 'ajv'
import cookieStorage from './cookieStorage'
import createDebug from 'debug'
import Bottleneck from 'bottleneck'

import stringify from 'json-stable-stringify'

const debug = createDebug('messaging:')

const PROMPT_MESSAGE = 'I am ready to start messaging on Origin.'
const PROMPT_PUB_KEY = 'My public messaging key is: '
const MESSAGING_KEY = 'MK_'
const MESSAGING_PHRASE = 'MP_'
const PUB_MESSAGING_SIG = 'PMS_'
const PUB_MESSAGING = 'KEY_'
const COULD_NOT_DECRYPT = 'Could not decrypt'
const INVALID_MESSAGE_OBJECT = 'Invalid message object'

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
const limiter = new Bottleneck({ maxConcurrent: 25 })

/**
 * Origin Messaging Client
 *
 * To use:
 *
 * ```
 * const messaging = new Messaging(options)
 * await messaging.init(this.address)
 * await messaging.startConversing()
 * // Once ready:
 * await messaging.sendConvMessage(aliceAddress, { content: 'Hi' })
 * // Once someone else's messages have arrived
 * const messages = messaging.getAllMessages(aliceAddress)
 * ```
 *
 */
class Messaging {
  constructor({
    contractService,
    ecies,
    messagingNamespace,
    globalKeyServer,
    personalSign = true,
    pubsub
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
    // Use cookie storage
    this.currentStorage = this.cookieStorage
    this._registryCache = {}
    this.pubsub = pubsub
    this.unreadCount = 0
    this.unreadCountLoaded = false
    this.hasMoreConversations = true

    this.ready = false
    this._keyStatus = 'disabled'
  }

  // Helper function for use by outside services
  preGenKeys(web3Account) {
    const sigPhrase = PROMPT_MESSAGE
    const signature = web3Account.sign(sigPhrase).signature

    const sigKey = signature.substring(0, 66)
    const msgAccount = this.web3.eth.accounts.privateKeyToAccount(sigKey)

    const pubMsg = PROMPT_PUB_KEY + msgAccount.address
    const pubSig = web3Account.sign(pubMsg).signature
    return {
      account: web3Account.address,
      sig_phrase: sigPhrase,
      sig_key: sigKey,
      pub_msg: pubMsg,
      pub_sig: pubSig
    }
  }

  async publishStatus(newStatus) {
    debug('messaging status change', this._keyStatus, 'to', newStatus)

    // Set state
    this._keyStatus = newStatus

    this.ready = newStatus === 'ready'
    this.events.emit(newStatus, this.account_key)

    if (!this.pubsub) {
      console.error('PubSub is not intialized')
      return
    }

    // Notify the DApp about the state change
    await this.pubsub.publish('MESSAGING_STATUS_CHANGE', {
      messagingStatusChange: newStatus
    })
  }

  isKeysLoading() {
    return !this.ready && this._keyStatus === 'disabled'
  }

  async onPreGenKeys({ address, signatureKey, pubMessage, pubSignature }) {
    debug('onPreGenKeys')
    const accounts = await this.web3.eth.getAccounts()

    if (!this.account_key) {
      // Initialize if not done already
      await this.init(accounts[0])
    }

    if (address === accounts[0]) {
      this.currentStorage = sessionStorage
      this.setKeyItem(`${MESSAGING_KEY}:${address}`, signatureKey)
      this.setKeyItem(`${MESSAGING_PHRASE}:${address}`, PROMPT_MESSAGE)
      this.setKeyItem(`${PUB_MESSAGING}:${address}`, pubMessage)
      this.setKeyItem(`${PUB_MESSAGING_SIG}:${address}`, pubSignature)
      this.pub_sig = pubSignature
      this.pub_msg = pubMessage

      if (address === this.account_key) {
        this.startConversing()
        // On mobile, messaging is always enabled, if there is a wallet
        await this.publishStatus('ready')
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

  getPublicMessagingSignature() {
    return this.getKeyItem(`${PUB_MESSAGING_SIG}:${this.account_key}`)
  }

  async initKeys() {
    const sigKey = this.getMessagingKey()
    const sigPhrase = this.getMessagingPhrase()
    // lock in the message to the hardcoded one
    if (sigKey && sigPhrase == PROMPT_MESSAGE) {
      await this.setAccount(sigKey, sigPhrase)
    } else {
      await this.promptToEnable()
    }
  }

  // throws exception when user denies signature
  async startConversing() {
    debug('startConversing')
    if (!this.account || !this.getPublicMessagingSignature()) {
      // Remote has been initialized
      await this.initKeys()
    } else {
      this.convsEnabled = true
    }
  }

  async init(key) {
    debug('init', key)

    // Reset state...
    this.convs = {}
    this.unreadCount = 0
    this.unreadCountLoaded = false
    this.convsEnabled = false
    this.hasMoreConversations = true
    this.ready = false
    clearInterval(this.refreshIntervalId)

    this.account_key = key
    this.account = undefined

    this.events.emit('initRemote')

    this.pub_sig = this.getKeyItem(`${PUB_MESSAGING_SIG}:${this.account_key}`)
    this.pub_msg = this.getKeyItem(`${PUB_MESSAGING}:${this.account_key}`)

    if (this.convsEnabled || this.getMessagingKey()) {
      // Keys found
      await this.initKeys()
    } else {
      // Initialized but keys are not signed yet
      // This means messaging client has done loading
      await this.publishStatus('initialized')
    }
  }

  async getGlobalKey(key) {
    if (!this.globalKeyServer) {
      throw new Error('Global key server required')
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
      const jEntry = await serverResponse.json()
      this._registryCache[key] = jEntry
      return jEntry
    }
  }

  async initMessaging() {
    debug('initMessaging')
    const entry = await this.getRemoteMessagingSig()
    const accountMatch = entry && entry.address == this.account.address
    if (!(this.pub_sig && this.pub_msg)) {
      if (accountMatch && entry.sig && entry.msg) {
        this.pub_sig = entry.sig
        this.pub_msg = entry.msg
      } else {
        await this.promptForSignature()
      }
    } else if (!accountMatch) {
      await this.setRemoteMessagingSig()
    }

    await this.loadMyConvs({
      limit: 10
    })

    await this.publishStatus('ready')
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

  async setAccount(keyStr, phraseStr) {
    debug('setAccount', keyStr, phraseStr)
    this.account = this.web3.eth.accounts.privateKeyToAccount(keyStr)
    this.account.publicKey =
      '0x' +
      secp256k1
        .publicKeyCreate(new Buffer(keyStr.substring(2), 'hex'), false)
        .slice(1)
        .toString('hex')
    // send it to local storage
    const scopedMessagingKeyName = `${MESSAGING_KEY}:${this.account_key}`
    this.setKeyItem(scopedMessagingKeyName, keyStr)
    //set phrase in the cookie
    const scopedMessagingPhraseName = `${MESSAGING_PHRASE}:${this.account_key}`
    this.setKeyItem(scopedMessagingPhraseName, phraseStr)

    await this.initMessaging()
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Enable messsaging by getting the user to sign the magic text.
   */
  async promptToEnable() {
    debug('promptToEnable', this.account_key)
    const sigPhrase = PROMPT_MESSAGE
    const signer = this.personalSign ? this.web3.eth.personal : this.web3.eth
    const signature = await signer.sign(sigPhrase, this.account_key)
    debug('signedSig', signature)
    this.events.emit('signedSig')

    // 32 bytes in hex + 0x
    const sigKey = signature.substring(0, 66)

    await this.publishStatus('sign1')

    // Delay to prevent hidden MetaMask popup
    await this.sleep(500)
    await this.setAccount(sigKey, sigPhrase)
  }

  async promptForSignature() {
    debug('promptForSignature', this.account_key)
    this.pub_msg = PROMPT_PUB_KEY + this.account.address
    const signer = this.personalSign ? this.web3.eth.personal : this.web3.eth
    this.pub_sig = await signer.sign(this.pub_msg, this.account_key)
    await this.publishStatus('sign2')
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

  getConvo(ethAddress) {
    const roomId = this.generateRoomId(this.account_key, ethAddress)
    return this.convs[roomId]
  }

  decryptEmsg(ivStr, msg, key) {
    const buffer = CryptoJS.AES.decrypt(msg, key, {
      iv: CryptoJS.enc.Base64.parse(ivStr)
    })
    let outText
    try {
      outText = buffer.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      return
    }

    if (outText && outText.length > 6) {
      const verifyText = outText.slice(0, -6)
      const shaCheck = outText.substr(-6)
      if (
        shaCheck ==
        CryptoJS.enc.Base64.stringify(CryptoJS.SHA1(verifyText)).substr(0, 6)
      ) {
        return verifyText
      }
    }
  }

  /**
   * Handles reading from content update object.
   *
   * New keys are stored on the convObj, while a decrypted message
   * fires a callback.
   */
  processContent({ content, convObj, onMessage, onEncrypted }) {
    switch (content.type) {
      case 'keys':
        this.processKeys(content, convObj)
        break
      case 'event':
        onMessage(content.eventData, content.sender)
        break
      case 'msg':
        {
          const decrypted = this.decryptMessage(content, convObj)
          if (decrypted.error == COULD_NOT_DECRYPT) {
            onEncrypted(content.emsg, content.address)
          } else if (decrypted.error == INVALID_MESSAGE_OBJECT) {
            // Do nothing
            debug('Could not decrypt', content)
          } else if (decrypted.content) {
            onMessage(decrypted.content, content.address)
          }
        }
        break
    }
  }

  /**
   * Adds any of my keys to the conversation
   */
  processKeys(content, convObj) {
    for (const v of content.keys) {
      if (v.address == this.account_key) {
        let key
        try {
          key = this.ecDecrypt(v.ekey)
        } catch (e) {
          /* Ignore */
        }
        if (key && !convObj.keys.includes(key)) {
          convObj.keys.push(key)
        }
      }
    }
  }

  /**
   * Decrypts a message using the keys from a conversation.
   */
  decryptMessage(content, convObj) {
    const v = content
    for (const key of convObj.keys) {
      const buffer = this.decryptEmsg(v.i, v.emsg, key)
      if (buffer != undefined) {
        let obj = buffer
        try {
          obj = JSON.parse(buffer)
        } catch (error) {
          return { error: INVALID_MESSAGE_OBJECT }
        }
        if (!validateMessage(obj)) {
          // force it to be an object
          return { error: INVALID_MESSAGE_OBJECT }
        }
        return { content: obj }
      }
    }
    return { error: COULD_NOT_DECRYPT }
  }

  /**
   * Marks the conversation with `remoteEthAddres` as read
   * @param {String} remoteEthAddress ETH address of the counter party
   * @returns {Object|null} An object with `success` and `messagesRead` keys if successful, null otherwise
   */
  async markConversationRead(remoteEthAddress) {
    if (!this.ready) {
      return
    }

    const roomId = this.generateRoomId(this.account_key, remoteEthAddress)
    debug(`Marking conversation ${roomId} as read from account`)

    if (this.convs[roomId] && this.convs[roomId].unreadCount === 0) {
      // If there is nothing to mark as read, ignore
      debug('Not marking as read')
      return null
    }

    try {
      const response = await fetch(
        `${this.globalKeyServer}/messages/${roomId}/read?address=${this.account_key}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' }
        }
      )

      return await response.json()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  /**
   * Parses, decrypts and processes the new message sent by socket server
   * @param {Object} entry Message received from socket
   */
  onNewMessageUpdate(entry) {
    debug('we got a new message entry:', entry)
    const { content, conversationId, conversationIndex } = entry
    const roomId = conversationId
    const remoteEthAddress = this.getRecipients(roomId).find(
      addr => addr !== this.account_key
    )

    if (content && conversationId) {
      if (content.address !== this.account_key) {
        // The new message is yet to be read
        debug('increaming unread count')
        this.unreadCount++
      }

      if (!this.convs[conversationId]) {
        // The conversation isn't locally cached or queried before.
        // Fetch the conversation keys, recent messages and push the update to GraphQL subscription
        // eslint-disable-next-line no-extra-semi
        ;(async () => {
          await this.getRoom(conversationId, { keys: true })
          const convObj = await this.getRoom(conversationId)
          this.pubsub.publish('MESSAGE_ADDED', {
            messageAdded: {
              conversationId: remoteEthAddress,
              roomId,
              message: convObj.messages[0],
              totalUnread: convObj.unreadCount
            }
          })
        })()
      } else {
        const convObj = this.convs[conversationId]
        if (conversationIndex === convObj.lastConversationIndex + 1) {
          // The conversation is cached and the ordering of the message is correct too.
          // Append it to existing object and push the update to GraphQL subscription
          this.processContent({
            content: entry.content,
            convObj,
            onMessage: (msg, address) => {
              const message = this.toMessage(
                msg,
                conversationId,
                entry,
                address
              )

              convObj.messages.unshift(message)
              debug('message:', message)
              this.events.emit('msg', message)

              if (content.address !== this.account_key) {
                convObj.unreadCount = (convObj.unreadCount || 0) + 1
              }

              convObj.lastMessage = message

              this.pubsub.publish('MESSAGE_ADDED', {
                messageAdded: {
                  conversationId: remoteEthAddress,
                  roomId,
                  message,
                  totalUnread: convObj.unreadCount
                }
              })
            },
            onEncrypted: (msg, address) => {
              this.events.emit(
                'emsg',
                this.toMessage(msg, conversationId, entry, address)
              )
            }
          })
          convObj.lastConversationIndex = entry.conversationIndex
          convObj.messageCount = entry.conversationIndex + 1
        } else {
          // Locally cached version is out of sync
          // Clear and fetch the messages again and push the update to GraphQL subscription

          const lastConversationIndex = convObj.lastConversationIndex

          ;(async () => {
            const updatedConvObj = await this.getRoom(conversationId)
            updatedConvObj.messages
              .filter(message => message.conversationId > lastConversationIndex)
              .map(message => {
                this.pubsub.publish('MESSAGE_ADDED', {
                  messageAdded: {
                    conversationId: remoteEthAddress,
                    roomId,
                    message,
                    totalUnread: updatedConvObj.unreadCount
                  }
                })
              })
          })()
        }
      }
    }
  }

  /**
   * Updates `unreadCount` and `<Conversation>.unreadCount` when
   * a conversation has been marked as read successfully
   * @param {Object} entry Message received from socket
   */
  onMarkedAsReadUpdate(entry) {
    debug('user marked conversation as read', entry)
    const { messagesRead, conversationId, address } = entry

    if (messagesRead === 0 || this.account_key !== address) {
      return
    }

    const roomId = conversationId
    const remoteEthAddress = this.getRecipients(roomId).find(
      addr => addr !== this.account_key
    )

    const convObj = this.convs[roomId]

    // Total unread count
    this.unreadCount = Math.min(this.unreadCount - messagesRead, 0)

    if (convObj) {
      // Reset conversation unread count
      convObj.unreadCount = 0
      convObj.messages = convObj.messages.map(m => ({
        ...m,
        read: true
      }))
    }

    // Notify DApp
    this.pubsub.publish('MARKED_AS_READ', {
      markedAsRead: {
        conversationId: remoteEthAddress,
        roomId,
        // Messages marked as read(from this conversation)
        messagesRead,
        // Overall count of unread messages (across all conversations)
        totalUnread: this.unreadCount
      }
    })
  }

  /**
   * Parses the update from socket server and invokes corresponding callbacks
   * @param {Object} entry Message from socket server
   */
  onMessageUpdate(entry) {
    debug('we got a new message entry:', entry)
    switch (entry.type) {
      case 'MARKETPLACE_EVENT':
      case 'NEW_MESSAGE':
        this.onNewMessageUpdate(entry)
        break
      case 'MARKED_AS_READ':
        this.onMarkedAsReadUpdate(entry)
        break
      default:
        debug('dropping update')
    }
  }

  getMessageId(roomId, container) {
    return roomId + '.' + container.conversationIndex
  }

  toMessage(data, roomId, container, address) {
    return {
      msg: data,
      type: container.content.type,
      room_id: roomId,
      index: container.conversationIndex,
      address,
      hash: this.getMessageId(roomId, container)
    }
  }

  async getRoom(roomId, { keys, before, after } = {}) {
    let convObj = {
      keys: [],
      messages: [],
      lastConversationIndex: 0,
      messageCount: 0,
      loaded: false,
      hasMore: true
    }

    const existingConv = this.convs[roomId]
    if (existingConv) {
      convObj = {
        ...existingConv,
        keys: [...existingConv.keys],
        messages: [...existingConv.messages]
      }
    }

    this.convs[roomId] = convObj

    const url = new URL(
      `${this.globalKeyServer}/messages/${roomId}${keys ? '/keys' : ''}`
    )

    if (!keys) {
      before && url.searchParams.set('before', before)
      after && url.searchParams.set('after', after)

      if (!after && !before) {
        // Clear messages if pagination is not mentioned
        convObj.messages = []
      }
    }

    if (convObj.hasMore) {
      debug('Fetching room', roomId, { keys, before, after })
      // Fetch only if there are more messages
      const messages = await limiter.schedule(async () => {
        const res = await fetch(url.toString(), {
          headers: { 'content-type': 'application/json' }
        })

        if (res.status === 204) {
          return []
        }

        return (await res.json()) || []
      })

      if (typeof before === 'number' && messages.length === 0) {
        convObj.hasMore = false
      }

      debug(`Got ${messages.length} messages in ${roomId}`)

      messages.forEach(entry => {
        this.processContent({
          content: entry.content,
          convObj,
          onMessage: (msg, address) => {
            const message = this.toMessage(msg, roomId, entry, address)

            if (
              convObj.messages.findIndex(m => m.index === message.index) < 0
            ) {
              // Push only if it is not already there
              convObj.messages.push(message)
              debug('msg:', message)
            } else {
              debug('Ignoring duplicate message', message.index)
            }
            this.events.emit('msg', message)
          },
          onEncrypted: (msg, address) => {
            this.events.emit(
              'emsg',
              this.toMessage(msg, roomId, entry, address)
            )
          }
        })

        if (convObj.lastConversationIndex < entry.conversationIndex) {
          convObj.lastConversationIndex = entry.conversationIndex
        }

        convObj.messageCount = entry.lastConversationIndex + 1
      })

      // Sort things in descending order
      convObj.messages = convObj.messages.sort((m1, m2) => {
        return m2.index - m1.index
      })

      if (!keys && !convObj.loaded) {
        convObj.loaded = true
      }
    }

    return convObj
  }

  async fetchConvs({ limit, offset }) {
    const res = await fetch(
      `${this.globalKeyServer}/conversations/${this.account_key}?${
        !Number.isNaN(Number(limit)) ? `limit=${limit}&` : ''
      }${!Number.isNaN(Number(offset)) ? `offset=${offset}` : ''}`,
      {
        headers: { 'content-type': 'application/json' }
      }
    )
    return await res.json()
  }

  /**
   * Subcscribes to the socket server
   */
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

  /**
   * Loads user's conversations from messaging server and populates the local `this.convs` object
   * @param {Integer} params.limit No. of conversation to fetch
   * @param {Integer} params.ofsset No. of conversation to skip
   */
  async loadMyConvs({ limit, offset } = {}) {
    if (this.hasMoreConversations) {
      debug('loading convs:')
      const conversations = await this.fetchConvs({ limit, offset })

      if (conversations.length === 0 && typeof offset === 'number') {
        this.hasMoreConversations = false
      }

      await Promise.all(
        conversations.map(conv => {
          return new Promise(async resolve => {
            // Populate keys and messages for all loaded conversations
            await this.getRoom(conv.id, { keys: true })
            const convObj = await this.getRoom(conv.id)
            convObj.unreadCount = conv.unread || 0

            this.convs[conv.id] = convObj

            resolve(convObj)
          })
        })
      )
    }

    if (!this.ws) {
      this.listenForUpdates()
    }
  }

  /**
   * Returns cached conversations, if it exists.
   * Loads from messaging server, populates the cache and then returns it, otherwise.
   * @param {Integer} params.limit No. of conversation to return
   * @param {Integer} params.ofsset No. of conversation to skip
   * @returns {[Object]} A sorted array of conversations by time in descending order
   */
  async getMyConvs({ limit, offset } = {}) {
    const _limit = Number(limit) || 10
    const startIndex = Number(offset) || 0
    const endIndex = startIndex + _limit

    let cachedConvs = Object.keys(this.convs)
    if (
      !cachedConvs.length ||
      (offset && cachedConvs.length - _limit < offset)
    ) {
      await this.loadMyConvs({ limit, offset })
      cachedConvs = Object.keys(this.convs)
    }

    const sortedConvs = cachedConvs
      .sort((conv1, conv2) => {
        const conv1LastMessage = this.convs[conv1].lastMessage
        const conv2LastMessage = this.convs[conv2].lastMessage

        if (conv1LastMessage && !conv2LastMessage) {
          return -1
        } else if (!conv1LastMessage && conv2LastMessage) {
          return 1
        } else if (!conv1LastMessage && !conv2LastMessage) {
          return 0
        }

        return conv2LastMessage.msg.created - conv1LastMessage.msg.created
      })
      .slice(startIndex, endIndex)
      .map(convId => {
        const recipients = this.getRecipients(convId)
        if (recipients.length === 2) {
          return recipients.find(addr => addr !== this.account_key)
        }

        return convId
      })

    return sortedConvs
  }

  /**
   * Checks if an conversation exists and prepopulates the data from messaging server
   * @param {String} remoteEthAddress
   * @return {Boolean} true if the has conversed with address identified by `remoteEthAddress`. False, otherwise
   */
  async conversationExists(remoteEthAddress) {
    const roomId = this.generateRoomId(this.account_key, remoteEthAddress)
    let convObj = this.convs[roomId]

    try {
      if (!convObj) {
        await this.getRoom(roomId, {
          keys: true
        })
        convObj = await this.getRoom(roomId)
      }

      return true
    } catch (e) {
      console.error('conversationExists', e)
      return false
    }
  }

  /**
   * Read from our local cache for messages to or from particular user
   */
  async getMessages(remoteEthAddress, { before, after } = {}) {
    const roomId = this.generateRoomId(this.account_key, remoteEthAddress)
    let convObj = this.convs[roomId]

    if (!convObj) {
      // Conversation isn't cached, fetch the keys and recent messages
      await this.getRoom(roomId, {
        keys: true
      })
      convObj = await this.getRoom(roomId, {
        before,
        after
      })
    } else if (!convObj.loaded || before || after) {
      // Conversation hasn't loaded before or the user has specified a pagination
      // In either keys, fetch the room from messaging server
      if (!convObj.keys.length) {
        // Load keys if it does not exist
        await this.getRoom(roomId, {
          keys: true
        })
      }

      // Fetch paginated results
      convObj = await this.getRoom(roomId, {
        before,
        after
      })
    }

    // Return entire set of messages
    // TODO: Should only the subset that satisfies `after` and `before` be returned?
    return convObj.messages
  }

  /**
   * Returns the unread count of a conversation, if `remoteEthAddress` is specified
   * Returns the unread count across all conversation otherwise
   * @param {String} remoteEthAddress
   * @returns {Integer} count of unread messages
   */
  async getUnreadCount(remoteEthAddress) {
    debug('getUnreadCount', remoteEthAddress)
    if (remoteEthAddress) {
      // Return the unread count of a conversation
      let convObj = this.getConvo(remoteEthAddress)

      if (convObj) {
        // from cache, if it exists
        return convObj.unreadCount
      } else {
        // fetch and then return, if it doesn't
        const roomId = this.generateRoomId(this.account_key, remoteEthAddress)
        await this.getRoom(roomId, { keys: true })
        convObj = await this.getRoom(roomId)

        this.convs[roomId] = convObj

        return convObj.unreadCount
      }
    }

    if (this.unreadCountLoaded) {
      // We have loaded the unread count across all messages already
      // Return that
      return this.unreadCount
    }

    const accountId = this.web3.utils.toChecksumAddress(this.account_key)

    // Fetch unread count across all conversations
    try {
      const response = await fetch(
        `${this.globalKeyServer}/conversations/${accountId}/unread`,
        {
          headers: { 'content-type': 'application/json' }
        }
      )

      const { unread } = await response.json()

      this.unreadCount = unread
      this.unreadCountLoaded = true
    } catch (e) {
      console.error('Failed to get unread count for ', accountId, e)
      this.unreadCount = 0
    }

    return this.unreadCount
  }

  ecEncrypt(text, pubKey) {
    const plaintext = new Buffer(text)
    if (!pubKey) {
      pubKey = this.account.publicKey
    }
    return this.ecies
      .encrypt(new Buffer(pubKey.substring(2), 'hex'), plaintext)
      .toString('hex')
  }

  ecDecrypt(buffer) {
    if (this.account) {
      return this.ecies
        .decrypt(
          new Buffer(this.account.privateKey.substring(2), 'hex'),
          new Buffer(buffer, 'hex')
        )
        .toString('utf8')
    }
  }

  async canConverseWith(remoteEthAddress) {
    const accountKey = this.account_key
    const address = this.web3.utils.toChecksumAddress(remoteEthAddress)
    const entry = await this.getRegisteredKey(address)

    return this.canSendMessages() && accountKey !== address && entry
  }

  async canReceiveMessages(remoteEthAddress) {
    const address = this.web3.utils.toChecksumAddress(remoteEthAddress)
    return Boolean(await this.getRegisteredKey(address))
  }

  canSendMessages() {
    return this.account && this.account_key
  }

  async addRoomMsg(conversationId, conversationIndex, content) {
    const data = stringify({ conversationId, conversationIndex, content })
    const signature = this.account.sign(data).signature
    const response = await fetch(
      `${this.globalKeyServer}/messages/${conversationId}/${conversationIndex}`,
      {
        method: 'POST',
        body: JSON.stringify({ content, signature }),
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

  async startConv(remoteEthAddress) {
    debug('startConv', remoteEthAddress)
    const entry = await this.getRegisteredKey(remoteEthAddress)

    if (!entry) {
      debug('remote account messaging disabled')
      return
    }

    const roomId = this.generateRoomId(this.account_key, remoteEthAddress)
    const convObj = this.convs[roomId] || {
      keys: [],
      lastConversationIndex: -1
    }

    if (!convObj.keys.length) {
      //
      // a conversation haven't even been started yet
      //
      const conversationIndex = convObj.lastConversationIndex + 1
      const encryptKey = cryptoRandomString({ length: 32 }).toString('hex')

      const keysContent = {
        type: 'keys',
        address: this.account_key,
        keys: [
          {
            ekey: this.ecEncrypt(encryptKey),
            maddress: this.account.address,
            address: this.account_key
          },
          {
            ekey: this.ecEncrypt(encryptKey, entry.pub_key),
            maddress: entry.address,
            address: remoteEthAddress
          }
        ]
      }
      const result = await this.addRoomMsg(
        roomId,
        conversationIndex,
        keysContent
      )

      if (result) {
        convObj.keys.push(encryptKey)
        convObj.messageCount += 1

        if (convObj.lastConversationIndex < conversationIndex) {
          convObj.lastConversationIndex = conversationIndex
        }
      }
    }
    return convObj
  }

  async createEncrypted(address, convObj, messageObj) {
    let remoteEthAddress = address
    if (!this.web3.utils.isAddress(remoteEthAddress)) {
      throw new Error(`${remoteEthAddress} is not a valid Ethereum address`)
    }
    remoteEthAddress = this.web3.utils.toChecksumAddress(remoteEthAddress)

    if (typeof messageObj == 'string') {
      messageObj = { content: messageObj }
    }
    const message = Object.assign({}, messageObj)
    // set timestamp
    message.created = Date.now()

    if (!validateMessage(message)) {
      debug('ERR: invalid message')
      return
    }
    const key = convObj.keys[0]
    const iv = CryptoJS.lib.WordArray.random(16)
    const messageStr = JSON.stringify(message)
    const shaSub = CryptoJS.enc.Base64.stringify(
      CryptoJS.SHA1(messageStr)
    ).substr(0, 6)
    const encmsg = CryptoJS.AES.encrypt(messageStr + shaSub, key, {
      iv: iv
    }).toString()
    const ivStr = CryptoJS.enc.Base64.stringify(iv)

    return {
      type: 'msg',
      emsg: encmsg,
      i: ivStr,
      address: this.account_key
    }
  }

  async sendConvMessage(roomIdOrAddress, messageObj) {
    debug('sendConvMessage', roomIdOrAddress, messageObj)
    if (this._sending_message) {
      debug('ERR: already sending message')
      return
    }
    let remoteEthAddress, roomId
    if (this.isRoomId(roomIdOrAddress)) {
      roomId = roomIdOrAddress
      remoteEthAddress = this.getRecipients(roomId).find(
        addr => addr !== this.account_key
      )
    } else {
      remoteEthAddress = roomIdOrAddress
      if (!this.web3.utils.isAddress(remoteEthAddress)) {
        throw new Error(`${remoteEthAddress} is not a valid Ethereum address`)
      }
      roomId = this.generateRoomId(this.account_key, remoteEthAddress)
    }
    remoteEthAddress = this.web3.utils.toChecksumAddress(remoteEthAddress)
    const convObj = await this.startConv(remoteEthAddress)
    if (!convObj) {
      debug('ERR: no room to send message to')
      return
    }

    const encryptedContent = await this.createEncrypted(
      remoteEthAddress,
      convObj,
      messageObj
    )
    if (!encryptedContent) {
      return
    }

    this._sending_message = true
    // include a random iv str so that people can't match strings of the same message
    if (
      await this.addRoomMsg(
        roomId,
        convObj.lastConversationIndex + 1,
        encryptedContent
      )
    ) {
      debug('room.add OK')
      //do something different if this succeeds
    } else {
      debug('Err: cannot add message.')
    }
    this._sending_message = false

    this.markConversationRead(remoteEthAddress)

    return roomId
  }

  async createOutOfBandMessage(address, messageObj) {
    debug('createOutOfBandMessage', address, messageObj)
    let remoteEthAddress = address
    if (!this.web3.utils.isAddress(remoteEthAddress)) {
      throw new Error(`${remoteEthAddress} is not a valid Ethereum address`)
    }
    remoteEthAddress = this.web3.utils.toChecksumAddress(remoteEthAddress)
    const convObj = await this.startConv(remoteEthAddress)
    if (!convObj) {
      debug('ERR: no room to send message to')
      return
    }
    const encryptedContent = await this.createEncrypted(
      remoteEthAddress,
      convObj,
      messageObj
    )
    if (!encryptedContent) {
      return
    }
    const myAddress = this.web3.utils.toChecksumAddress(remoteEthAddress)
    encryptedContent.to = myAddress
    return encryptedContent
  }

  async decryptOutOfBandMessage(message) {
    // We don't know which one will be us, because we could be
    // reading our own message.
    const addresses = [message.address, message.to].map(x => {
      if (!this.web3.utils.isAddress(x)) {
        throw new Error(`${x} is not a valid Ethereum address`)
      }
      return this.web3.utils.toChecksumAddress(x)
    })
    // Sort my address to the end of the array
    // Making the the first address not me (unless I'm messaging myself)
    addresses.sort(x => (x == this.account_key ? 1 : -1))
    const remoteEthAddress = addresses[0]

    const convObj = await this.startConv(remoteEthAddress)
    if (!convObj) {
      debug('ERR: no room to get message from')
      return
    }
    return this.decryptMessage(message, convObj)
  }
}

export default Messaging
