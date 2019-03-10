import {AppState, Platform, PushNotificationIOS, Linking, Clipboard} from 'react-native'
import PushNotification from 'react-native-push-notification'
import Web3 from 'web3'
import fetch from 'cross-fetch'
import keyMirror from 'utils/keyMirror'
import EventEmitter from 'events'
import {EthNotificationTypes} from 'origin/common/enums'
import secp256k1 from 'secp256k1'
import ecies from 'eth-ecies'
import CryptoJS from 'crypto-js'
import UUIDGenerator from 'react-native-uuid-generator'
import { randomBytes } from 'react-native-randombytes'
import { TypedDataUtils, concatSig } from 'eth-sig-util'
import ethUtil from 'ethereumjs-util'


import {
  GCM_SENDER_ID,
} from 'react-native-dotenv'

import {setRemoteLocal, localfy, storeData, loadData} from './tools'

import origin, {apiUrl, defaultProviderUrl, localApi, defaultLocalRemoteHost, getEthCode} from 'services/origin'

const ETHEREUM_QR_PREFIX = "ethereum:"
const ORIGIN_QR_PREFIX = "orgw:"
const ORIGIN_WALLET = "OriginWallet"
const ORIGIN_PROTOCOL_PREFIX = "http://www.originprotocol.com/mobile/"
const SECURE_ORIGIN_PROTOCOL_PREFIX = "https://www.originprotocol.com/mobile/"
const LAST_MESSAGE_IDS = "last_message_ids"
const TEST_PRIVATE_KEY = "0x388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418"
const ACCOUNT_MAPPING = "ACCOUNT_MAPPING"
const WALLET_PASSWORD = "TEST_PASS"
const WALLET_STORE = "WALLET_STORE"
const WALLET_INFO = "WALLET_INFO"
const WALLET_LINK = "WALLET_LINK"
const REMOTE_LOCALHOST_STORE = "REMOTE_LOCAL_STORE"
const DEFAULT_NOTIFICATION_PERMISSIONS = {
  alert: true,
  badge: true,
  sound: true
}

const Events = keyMirror({
  PROMPT_LINK:null,
  PROMPT_TRANSACTION:null,
  PROMPT_SIGN:null,
  CURRENT_ACCOUNT:null,
  AVAILABLE_ACCOUNTS:null,
  LINKED:null,
  TRANSACTED:null,
  UNLINKED:null,
  REJECT:null,
  LINKS:null,
  UPDATE:null,
  SHOW_MESSAGES:null,
  NOTIFICATION:null,
  NEW_MESSAGE:null
}, "WalletEvents")

const eventMatcherByLinkId = link_id => {
  return event => event.link && event.link.link_id == link_id
}

const eventMatcherByEventId = event_id => {
  return event => event.event_id == event_id
}

const getEventId = event => {
  if (event.event_id)
  {
    return event.event_id
  }
  else if (event.link && event.link.link_id)
  {
    return event.link.link_id
  }
  else if(event.transaction && event.transaction.call_id)
  {
    return event.transaction.call_id
  }
  else if (event.sign && event.sign.session_token)
  {
    return event.sign.session_token + ":" + event.sign.call_id
  }
}

const matchEvents = (event1, event2) => {
  let ekey = getEventId(event1)
  return ekey && ekey == getEventId(event2)
}

const eventMatcherByEvent = event => {
  return in_event => matchEvents(in_event, event)
}

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class OriginWallet {
  constructor() {
    this.state = {
      notifyTime: null,
      notifyMessage: null,
      deviceToken: undefined,
      notificationType: undefined,
      ethAddress: undefined,
      linkCode: undefined,
      walletToken: undefined
    }

    this.last_message_ids = {}
    //sync messages once we have it all ready
    this.check_messages_interval = setInterval(this.checkSyncMessages.bind(this), 1000)

    loadData(LAST_MESSAGE_IDS).then((ids) => { 
      if (ids) {
        this.last_message_ids = ids
      }
    })

    this.events = new EventEmitter()
    this.onQRScanned = this.onQRScanned.bind(this)

  }

  getNotifyType() {
    if (Platform.OS === 'ios') {
      return EthNotificationTypes.APN
    } else if (Platform.OS === 'android') {
      return EthNotificationTypes.FCM
    }
  }

  initNotifications() {
    console.log('GCM_SENDER_ID: ', GCM_SENDER_ID)
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function(device_token) {
        this.onNotificationRegistered(device_token["token"], this.getNotifyType())
      }.bind(this),

      // (required) Called when a remote or local notification is opened or received
      onNotification: function(notification) {
        this.onNotification(notification)

        // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData)
        }
      }.bind(this),

      // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: GCM_SENDER_ID,

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: DEFAULT_NOTIFICATION_PERMISSIONS,

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
        * (optional) default: true
        * - Specified if permissions (ios) and token (android and ios) will requested or not,
        * - if not, you must call PushNotificationsHandler.requestPermissions() later
        */
      requestPermissions: Platform.OS !== 'ios',
    })
  }

  requestNotifications() {
    if (Platform.OS === 'ios') {
      return PushNotificationIOS.requestPermissions()
    } else {
      // Function callers expect a Promise
      return new Promise((resolve, reject) => {
        resolve(DEFAULT_NOTIFICATION_PERMISSIONS)
      })
    }
  }

  initUrls() {
    const remote_is_url = this.remote_localhost.startsWith("http://")
      || this.remote_localhost.startsWith("https://")

    const localApiUrl = remote_is_url ? this.remote_localhost : localfy(apiUrl)
    console.log("localApi Url:", localApiUrl)

    const wsApiUrl = localApiUrl.replace(/^http/, 'ws')

    const API_WALLET_LINKER = `${localApiUrl}/api/wallet-linker`

    this.API_REGISTER_WALLET_NOTIFICATION = API_WALLET_LINKER + "/register-wallet-notification/"
    this.API_WALLET_LINKER_LINK = API_WALLET_LINKER + "/link-wallet/"
    this.API_WALLET_LINKER_PRELINK = API_WALLET_LINKER + "/prelink-wallet/"
    this.API_WALLET_LINKER_UNLINK = API_WALLET_LINKER + "/unlink-wallet/"
    this.WS_API_WALLET_LINKER_MESSAGES = `${wsApiUrl}/api/wallet-linker/wallet-messages/`
    this.API_WALLET_SERVER_INFO = API_WALLET_LINKER + "/server-info"
    this.API_WALLET_LINK_INFO = API_WALLET_LINKER + "/link-info/"
    this.API_WALLET_LINKER_RETURN_CALL = API_WALLET_LINKER + "/wallet-called/"
    this.API_WALLET_GET_LINKS = API_WALLET_LINKER + "/wallet-links/"
    this.API_WALLET_UPDATE_LINKS = API_WALLET_LINKER + "/wallet-update-links/"
    this.state.localApiUrl = localApiUrl

    if (!this._originalIpfsGateway)
    {
      this._originalIpfsGateway = origin.ipfsService.gateway
    }

    if (!this.originalIpfsApi)
    {
      this._originalIpfsApi = origin.ipfsService.api
    }

    origin.ipfsService.gateway = localfy(this._originalIpfsGateway)
    origin.ipfsService.api = localfy(this._originalIpfsApi)

    console.log("ipfsGateway is:", origin.ipfsService.gateway)
  }

  async setRemoteLocal(remote_ip) {
    if (remote_ip) {
      //in case there's a url!
      remote_ip = remote_ip.replace(/\/$/, "")
    }
    await storeData(REMOTE_LOCALHOST_STORE, remote_ip)
    await this.initWeb3()
  }

  getCurrentRemoteLocal() {
    return this.remote_localhost
  }

  getMessagingUrl() {
    return this.messagingUrl + ORIGIN_WALLET
  }

  getWalletToken() {
    return this.state.walletToken
  }

  isLocalApi() {
    return localApi
  }

  async fireEvent(event_type, event, matcher) {
    // event may be an array (see doGetLinkedDevices)
    if (typeof(event) == 'object' && event.length === undefined)
    {
      const ts = new Date()
      if(!event.event_id)
      {
        //make it a true event by filling it
        event = await this.extractEvent(event)
        event.event_id = getEventId(event)
        event.timestamp = ts
      }

      // use a default event matcher
      if (!matcher)
      {
        matcher = eventMatcherByEvent(event)
      }
    }
    this.events.emit(event_type, event, matcher)
  }

  syncLastMessages() {
    storeData(LAST_MESSAGE_IDS, this.last_message_ids)
  }

  onClearMessages() {
    this.last_message_ids = {}
    this.syncLastMessages()
    this.syncServerMessages()
  }

  doFetch(endpoint, method, data){
    return fetch(endpoint, {
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => {
      try {
        return response.json()
      } catch (error) {
        console.log("Json Error on fetch[", endpoint, "]:", error)
        throw error
      }
    }).catch(error => {
      console.log("fetch Error on fetch[", endpoint, "]:", error, " response: ")
      throw error
    })
  }

  registerNotificationAddress(eth_address, device_token, notification_type) {
    return this.doFetch(this.API_REGISTER_WALLET_NOTIFICATION + this.getWalletToken(), 'POST', {
      eth_address: eth_address,
      device_token: device_token,
      device_type: notification_type
    })
  }

  getMessagingKeys( ) {
    return origin.messaging.preGenKeys(this.getCurrentWeb3Account())
  }

  getPrivData(pub_key) {
    if (pub_key)
    {
      const data = {messaging:this.getMessagingKeys()}
      return this.ecEncrypt(JSON.stringify(data), pub_key)
    }
  }

  async doLink(code, current_rpc, current_accounts) {
    const linkInfo = await this.getLinkInfo(code)
    if(!linkInfo || !Object.keys(linkInfo).length || linkInfo.linked)
    {
      console.log(code, " already linked.")
      return
    }
    const priv_data = this.getPrivData(linkInfo.pub_key)
    return this.doFetch(this.API_WALLET_LINKER_LINK + this.getWalletToken(), 'POST', {
      code,
      current_rpc,
      current_accounts,
      priv_data
    }).then((responseJson) => {
      const app_info = responseJson.app_info
      console.log("We are now linked to a remote wallet:", responseJson, " browser is:", app_info)

      const link_id = responseJson.link_id
      const return_url = app_info && app_info.return_url

      if (this.__internal_link_code == code)
      {
        return true
      }
      this.fireEvent(Events.LINKED, {linked:true, link:{link_id, return_url:app_info.return_url, app_info:responseJson.app_info, linked_at:new Date(responseJson.linked_at)}})

      if (responseJson.pending_call_context)
      {
        const msg = responseJson.pending_call_context
        this.processCall(msg.call, msg.call_id, return_url, msg.session_token, link_id, true)
      }
      else
      {
        if (return_url && this.copied_code == code)
        {
          Linking.openURL(return_url)
        }
        else
        {
          console.log("We are now linked return url:"+ return_url + " on browser:" + app_info)
        }
      }

      return true
    }).catch((error) => {
      console.error(error)
    })
  }

  doUnlink(link_id) {
    console.log("Unlink from:", link_id)
    return this.doFetch(this.API_WALLET_LINKER_UNLINK + this.getWalletToken(), 'POST', {
      link_id
    }).then((responseJson) => {
      console.log("We are now unlinked from remote wallet:", link_id)
      // response is simply true
      if (responseJson)
      {
        this.fireEvent(Events.UNLINKED, {link_id, unlinked_at:new Date()}, eventMatcherByLinkId(link_id))
      }
      return true
    }).catch((error) => {
      console.error(error)
    })
  }


  doGetLinkedDevices() {
    return this.doFetch(this.API_WALLET_GET_LINKS + this.getWalletToken(), "GET").then((responseJson) => {
      let devices = []
      for(const l of responseJson){
        devices.push({event_id:l.link_id, linked:l.linked, link:{app_info:l.app_info, link_id:l.link_id, linked_at:new Date(l.linked_at)}})
      }
      this.fireEvent(Events.LINKS, devices)
    }).catch((error) => {
      console.error(error)
    })
  }

  getDevices() {
    this.doGetLinkedDevices()
  }

  async checkRegisterNotification() {
    let state = this.state
    console.log("checking server notification:", state)
    if (state.ethAddress && state.notificationType && state.deviceToken)
    {
      console.log("save wallet info:", this.save_wallet_info)
      if (this.save_wallet_info &&
        ( (this.save_wallet_info.ethAddress != state.ethAddress
          || this.save_wallet_info.localApiUrl != state.localApiUrl
          || this.save_wallet_info.deviceToken != state.deviceToken)))
      {
        try {
          await this.registerNotificationAddress(state.ethAddress, state.deviceToken, state.notificationType)

          //only after registering do we store the notification info
          this.save_wallet_info.ethAddress = state.ethAddress
          this.save_wallet_info.deviceToken = state.deviceToken
          this.save_wallet_info.localApiUrl = state.localApiUrl
          this.saveInfo()
        } catch (error) {
          console.log("Error registering notification:", error)
        }
      }
    }
  }

  checkDoLink() {
    let state = this.state
    if (state.linkCode && state.ethAddress && state.netId)
    {
      let rpc_server = this.copied_code == state.linkCode ? localfy(this.providerUrl) : this.providerUrl
      return this.doLink(state.linkCode, rpc_server, [state.ethAddress])
    }
  }


  checkDoUnlink(link_id) {
    if (this.state.walletToken)
    {
      return this.doUnlink(link_id)
    }
  }

  onNotificationRegistered(deviceToken, notification_type) {
    console.log("Device Token Received", deviceToken)

    Object.assign(this.state, {deviceToken, notificationType:notification_type})
    this.checkRegisterNotification()
  }

  returnCall(event_id, call_id, session_token, link_id, result, fire_event) {
    return this.doFetch(this.API_WALLET_LINKER_RETURN_CALL + this.getWalletToken(), 'POST', {
      call_id,
      link_id,
      session_token,
      result,
    }).then((responseJson) => {
      console.log("returnCall successful:", responseJson.success)
      this.fireEvent(fire_event, undefined, eventMatcherByEventId(event_id))
      return responseJson.success
    }).catch((error) => {
      console.error(error)
    })
  }

  async extractEvent(event_data) {
    const transaction = event_data.transaction
    const link = event_data.link
    if (transaction)
    {
      const meta = await this.extractMetaFromCall(transaction.call) || {}
      // NOTE: this is assuming extractMeta enforces netId matching!
      const net_id = this.state.netId
      const cost = this.extractTransactionCost(transaction.call)
      const gas_cost = this.extractTransactionGasCost(transaction.call)
      const ogn_cost = this.extractOgnCost(meta)
      const identity = this.extractIdentity(meta)
      const listing = this.extractListing(meta)
      const to = this.extractTo(transaction.call)
      const transaction_type = this.extractTransactionActionType(meta)
      console.log("meta:", meta, " ogn_cost:", ogn_cost)
      const action = "transaction"
      return {...event_data, meta, net_id, action, to, cost, gas_cost, ogn_cost, identity, listing, transaction_type}
    }
    else if (link)
    {
      const action = "link"
      return {...event_data, action}
    }
    else if (event_data.sign)
    {
      const action = "sign"
      let msg = ""
      let domain = ""
      let listing = undefined
      let sign_type = undefined

      if (event_data.sign.call.params.msg)
      {
        msg = event_data.sign.call.params.msg
      }
      else if(event_data.sign.call.params.method == "eth_signTypedData_v3")
      {
        const data = JSON.parse(event_data.sign.call.params.data)
        domain = data.domain
        msg = data.message
        if (data)
        {
          sign_type = data.primaryType
          if (data.primaryType == "Listing")
          {
            listing = msg
          }
          else if (data.primaryType == "AcceptOffer")
          {
            const listingId = origin.reflection.makeSignedListingId(this.state.netId, msg.listingID)
            listing = await origin.marketplace.getListing(listingId)
          }
          else if (data.primaryType == "Finalize")
          {
            const listingId = origin.reflection.makeSignedListingId(this.state.netId, msg.listingID)
            listing = await origin.marketplace.getListing(listingId)
          }
        }
      }
      return {...event_data, listing, sign_type, msg, domain, action}
    }
    //this is the bare event
    return event_data
  }

  extractOgnCost(meta)
  {
    return (meta && meta.originTokenValue && web3.utils.toBN(meta.originTokenValue)) || web3.utils.toBN("0")
  }

  async extractMetaFromCall({net_id, params:{txn_object}}) {
    const netId = this.state.netId
    if(net_id && netId != net_id)
    {
      throw(`Remote net id ${net_id} does not match local netId ${netId}`)
    }
    return origin.reflection.extractContractCallMeta(netId, txn_object.to, txn_object.data)
  }

  extractTransactionActionType({marketplace, originToken, contract, method, params, subMeta}) {
    if (originToken && subMeta)
    {
      method = subMeta.method
      marketplace = subMeta.marketplace
      params = subMeta.params
    }

    if (marketplace)
    {
      if (method == "makeOffer")
      {
        return 'purchase'
      }
      else if (method.startsWith("createListing"))
      {
        return 'sell'
      }
    }
    // TODO: need something better here
    return contract + "." + method
  }

  extractTo({params}) {
    return params && params.txn_object && params.txn_object.to
  }

  extractIdentity({identity, subMeta}) {
    return identity || (subMeta && subMeta.identity)
  }

  extractListing({listing, subMeta}) {
    return listing || (subMeta && subMeta.listing)
  }

  extractTransactionCost({params:{txn_object}}){
    // might want to format this some how
    return (txn_object && txn_object.value && web3.utils.toBN(txn_object.value)) || web3.utils.toBN("0")
  }

  extractTransactionGasCost({params}){
    // might want to format this some how
    return params && params.txn_object && (web3.utils.toBN(params.txn_object.gas).mul(web3.utils.toBN(params.txn_object.gasPrice)))
  }

  async handleEvent(e) {
    if (e.link)
    {
      return this._handleLink(e.link)
    }
    else if (e.transaction)
    {
      return this._handleTransaction(e.event_id, e.transaction)
    }
    else if (e.sign)
    {
      return this._handleSign(e.event_id, e.sign)
    }
  }

  handleUnlink(event){
    const {link_id} = event.link
    this.checkDoUnlink(link_id)
  }

  handleReject(event){
    if (event.transaction)
    {
      return this._handleRejectTransaction(event.event_id, event.transaction)
    }
    else if (event.sign)
    {
      //treat it like a transactions
      return this._handleRejectTransaction(event.event_id, event.sign)
    }
    this.fireEvent(Events.REJECT, event)
  }

  _handleLink({linkCode}){
    return this.setLinkCode(linkCode)
  }

  _handleTransaction(event_id, {call, call_id, return_url, session_token, link_id}){
    const method = call.method
    const params = call.params
    return new Promise((resolve, reject) => {
      if (method == "signTransaction")
      {
        web3.eth.signTransaction(params.txn_object).then(ret => {
          this.returnCall(event_id, call_id, session_token, link_id, ret["raw"], Events.TRANSACTED).then(
            (success) => {
              if (return_url)
              {
                Linking.openURL(return_url)
              }
              resolve(true)
            })
        }).catch(err)
        {
          reject(err)
        }
      }
      else if (method == "processTransaction")
      {
        web3.eth.sendTransaction(params.txn_object).on('receipt', (receipt) => {
          console.log("transaction sent:", receipt)
        }).on('confirmation', (conf_number, receipt) => {
          console.log("confirmation:", conf_number)
          if (conf_number == 1)  // TODO: set this as a setting
          {
            const transactionResult = {hash:receipt.transactionHash}
            this.returnCall(event_id, call_id, session_token, link_id, transactionResult, Events.TRANSACTED).then(
              (success) => {
                if (return_url)
                {
                  const successUrl = this.addTransactionHashToUrl(return_url, receipt.transactionHash)
                  console.log("transaction approved returning to:", successUrl)
                  Linking.openURL(successUrl)
                }
                resolve(true)
              }
            )
          }
        }).on('error', error => {
          console.error(error)
          reject(error)
        }).catch(error => {
          reject(error)
        })// TODO: handle error and completion here!
      }
    })
  }

  getCurrentWeb3Account() {
    return web3.eth.accounts.wallet[this.state.ethAddress]
  }

  _handleSign(event_id, {call, call_id, return_url, session_token, link_id}){
    const method = call.method
    const params = call.params
    return new Promise((resolve, reject) => {
      let ret
      let shash
      if (params.method == "eth_signTypedData_v3")
      {
        const data = JSON.parse(params.data)
        const pkey = this.getCurrentWeb3Account().privateKey
        const sig = ethUtil.ecsign(TypedDataUtils.sign(data), ethUtil.toBuffer(pkey))
        const result = ethUtil.bufferToHex(concatSig(sig.v, sig.r, sig.s))
        shash = result.slice(2, 6)
        ret = {result}
      } else {
        const msg = params.msg
        const post_phrase_prefix = params.post_phrase_prefix
        console.log("signing message:", msg)
        const signature = this.getCurrentWeb3Account().sign(msg).signature
        shash = result.slice(2, 6)
        ret = {msg, signature, account:this.state.ethAddress}

        if (post_phrase_prefix)
        {
          const sig_key = signature.substring(0, 66)
          const temp_account = web3.eth.accounts.privateKeyToAccount(sig_key)

          const post_phrase = post_phrase_prefix + temp_account.address
          const post_signature = this.getCurrentWeb3Account().sign(post_phrase).signature
          ret.post_phrase = post_phrase
          ret.post_signature = post_signature

        }
      }
      console.log("Signing result:", ret)

      this.returnCall(event_id, call_id, session_token, link_id, ret, Events.TRANSACTED).then(
          (success) => {
            if (return_url)
            {
              const successUrl = this.addSignHashToUrl(return_url, shash)
              console.log("transaction approved returning to:", return_url)
              Linking.openURL(successUrl)
            }
            resolve(success)
          })
    })
  }

  _handleRejectTransaction(event_id, {call, call_id, session_token, link_id}){
    //return empty result
    return this.returnCall(event_id, call_id, session_token, link_id, {}, Events.REJECT)
  }

  async processCall(call, call_id, return_url, session_token, link_id, force_from = false) {
    const method = call.method
    const params = call.params

    if (force_from && params.txn_object)
    {
      params.txn_object.from = this.state.ethAddress

      // replace any placeholders in the parameter list
      const placeholder_address = web3.eth.abi.encodeParameter("address", origin.contractService.walletPlaceholderAccount())
        .slice(2)
      
      if (params.txn_object.data.includes(placeholder_address))
      {
        const this_address = web3.eth.abi.encodeParameter("address", this.state.ethAddress)
          .slice(2)
        params.txn_object.data = params.txn_object.data.replace(new RegExp(placeholder_address, "g"), this_address)
      }
    }

    if (method == "signTransaction")
    {
      if (params.txn_object.from.toLowerCase() == this.state.ethAddress.toLowerCase())
      {
        return this.fireEvent(Events.PROMPT_TRANSACTION, {transaction:{call, call_id, return_url, session_token, link_id}})
      }
    }
    else if (method == "processTransaction")
    {
      if (params.txn_object.from.toLowerCase() == this.state.ethAddress.toLowerCase())
      {
        return this.fireEvent(Events.PROMPT_TRANSACTION, {transaction:{call, call_id, return_url, session_token, link_id}})
      }
    }
    else if (method == "signMessage")
    {
      return this.fireEvent(Events.PROMPT_SIGN, {sign:{call, call_id, return_url, session_token, link_id}})
    }
  }

  closeLinkMessages() {
    if (this.messages_ws && this.messages_ws.readyState !== this.messages_ws.CLOSED)
    {
      this.messages_ws.close()
    }
  }

  isLinkMessagesOpen() {
    return this.messages_ws && this.messages_ws.readyState === this.messages_ws.OPEN
  }

  async processMessage(m) {
    const type = m.msg.type
    const message = m.msg.data
    const msgId = m.msgId
    if (type == "CALL")
    {
      console.log("Processing call:", message)
      await this.processCall(message.call, message.call_id, message.return_url, message.session_token, message.link_id)  
    }
    else if ( type == "LINK_REQUEST")
    {
      console.log("requesting link:", message)
      this.__internal_link_code = message.code
      this.setLinkCode(message.code)
    }
    this.last_message_ids[this.state.ethAddress] = msgId
    this.syncLastMessages()
  }

  syncServerMessages() {
    this.closeLinkMessages()
    const last_message_id = this.last_message_ids[this.state.ethAddress] || '0'
    console.log("syncing messages on last_message_id:", last_message_id)
    // Connect the websocket
    const ws = new WebSocket(this.WS_API_WALLET_LINKER_MESSAGES + this.getWalletToken() + '/' + last_message_id)

    ws.onmessage = e => {
      console.log("got message:", e.data)
      this.processMessage(JSON.parse(e.data))
    }

    ws.onclose = e => {
      console.log("Websocket closed event:", e)
      if (e.code != 1000)
      {
        //this is an abnormal closure let's try reopen this in a bit
        setTimeout(() => {
          if (this.messages_ws === ws) {
            this.syncServerMessages()
          }
        }, 5000) // check in 5 seconds
      }
    }
    this.messages_ws = ws
  }

  checkSyncMessages(force) {
    const doSync = !this.messages_ws || force // && !this.isLinkMessagesOpen())
    if (this.state.walletToken && this.state.ethAddress && this.state.netId && doSync)
    {
      this.syncServerMessages()
    }
  }

  async getPrivateLink() {
    if (Platform.OS === 'ios') {
      await PushNotificationIOS.requestPermissions()
    }
    const stored_link_id = await loadData(WALLET_LINK)

    if (stored_link_id) 
    {
      const links = await this.doFetch(this.API_WALLET_GET_LINKS + this.getWalletToken(), "GET")
      for (const link of links) {
        if (stored_link_id == link.link_id)
        {
          return randomBytes(4).toString('hex') + stored_link_id
        }
      }
    }
    const priv_key = randomBytes(32)
    const current_rpc = localfy(this.providerUrl)
    const current_accounts = [this.state.ethAddress]
    const pub_key = this.getPublicKey(priv_key)
    const priv_data = this.getPrivData(pub_key)
    const {code, link_id} = await this.doFetch(this.API_WALLET_LINKER_PRELINK + this.getWalletToken(), 
      'POST', {
      pub_key,
      current_rpc,
      current_accounts,
      priv_data
    })

    await storeData(WALLET_LINK, link_id)
    return `${link_id}-${code}-${priv_key.toString('hex')}`
  }

  async toLinkedDappUrl(dappUrl) {
    const localUrl = localfy(dappUrl)
    return localUrl + (localUrl.includes('?') ? '&' : '?' ) + 'plink=' + await this.getPrivateLink()
  }

  addTransactionHashToUrl(url, thash) {
    return url + (url.includes('?') ? '&' : '?' ) + 'thash=' + thash
  }

  addSignHashToUrl(url, shash) {
    return url + (url.includes('?') ? '&' : '?' ) + 'shash=' + shash
  }


  async open(url) {
    switch(url) {
      case 'profile':
        if (this.profileUrl) {
          const linkingUrl = await this.toLinkedDappUrl(this.profileUrl)
          console.log("Opening profile url:", linkingUrl)
          Linking.openURL(linkingUrl)
        }
        break
      case 'root':
        if (this.dappUrl) {
          const linkingUrl = await this.toLinkedDappUrl(this.dappUrl)
          console.log("Opening root url:", linkingUrl)
          Linking.openURL(linkingUrl)
        }
        break
      case 'selling':
        if (this.sellingUrl) {
          const linkingUrl = await this.toLinkedDappUrl(this.sellingUrl)
          console.log("Opening selling url:", linkingUrl)
          Linking.openURL(linkingUrl)
        }
        break
      default:
        console.log("Opening url:", url)
        Linking.openURL(await this.toLinkedDappUrl(url))
    }
  }

  async onNotification(notification) {
    Object.assign( this.state, {
      notifyTime:new Date(),
      notifyMessage:notification.message
    })

    while(!(this.state.walletToken && this.state.ethAddress && this.state.netId))
    {
      await timeout(1000)
    }
    console.log("notification.message:", notification.message)
    if (!notification.data) {
      console.log("notification has no data", notification)
    }
    if (notification.data && notification.data.newMessage)
    {
      if (notification.foreground)
      {
        this.fireEvent(Events.NEW_MESSAGE)
        // TODO: micah put red dot here..
      }
      else
      {
        this.fireEvent(Events.SHOW_MESSAGES)
      }
    }
    else if (notification.data && notification.data.to_dapp && notification.data.url)
    {
      if (notification.foreground)
      {
        this.fireEvent(Events.NOTIFICATION, notification)
      }
      else
      {
        Linking.openURL(await this.toLinkedDappUrl(notification.data.url))
      }
    }
    //force if it's comming from the background
    this.checkSyncMessages(!notification.foreground)
  }

  onQRScanned(scan) {
    console.log("Address scanned:", scan.data)
    let key
    /*if (scan.data.startsWith(ETHEREUM_QR_PREFIX))
    {
      let ethAddress = scan.data.substr(ETHEREUM_QR_PREFIX.length)
      if (ethAddress != this.state.ethAddress)
      {
        Object.assign(this.state, {ethAddress})
        this.checkRegisterNotification()
      }
    }
    else*/
    if (scan.data.startsWith(ORIGIN_QR_PREFIX))
    {
      let linkCode = scan.data.substr(ORIGIN_QR_PREFIX.length)
      this.setLinkCode(linkCode)
    }
    else if (key = this.checkStripOriginUrl(scan.data))
    {
      this.setLinkCode(key)
    }
  }

  checkStripOriginUrl(url){
    const urlWithoutQueryParams = url.split('?')[0]

    if (urlWithoutQueryParams.startsWith(ORIGIN_PROTOCOL_PREFIX))
    {
      return urlWithoutQueryParams.substr(ORIGIN_PROTOCOL_PREFIX.length)
    }
    if (urlWithoutQueryParams.startsWith(SECURE_ORIGIN_PROTOCOL_PREFIX))
    {
      return urlWithoutQueryParams.substr(SECURE_ORIGIN_PROTOCOL_PREFIX.length)
    }
  }

  checkIncomingUrl(url) {
    let key = this.checkStripOriginUrl(url)
    console.log("incoming url:", url, " key is:", key)
    if (key)
    {
      // this.promptForLink(key)
      this._handleLink({ linkCode: key })
    }
  }

  setLinkCode(linkCode){
    if (linkCode != this.state.linkCode)
    {
      Object.assign(this.state, {linkCode})
      return this.checkDoLink()
    }
  }

  async getLinkInfo(linkCode){
    let tries = 3
    while (tries > 0)
    {
      try {
        return await this.doFetch(this.API_WALLET_LINK_INFO + linkCode, 'GET')
      } catch (error) {
        console.log("link info error:", error)
      }
      tries -= 1
      // wait for half a second
      await timeout(500)
    }
  }

  promptForLink(linkCode) {
    console.log("link code is:" + linkCode)
    if (this.linking_code != linkCode)
    {
      this.linking_code = linkCode

      this.getLinkInfo(linkCode)
        .then(responseJson => {
          //get info about the link
          this.fireEvent(Events.PROMPT_LINK, {linked:false, link:{linkCode, link_id:responseJson.link_id, return_url:responseJson.return_url, app_info:responseJson.app_info, expires_at:new Date(responseJson.expires_at)}})
        })
    }
  }

  getPublicKey(priv_key) {
    return secp256k1
      .publicKeyCreate(priv_key, false)
      .slice(1)
      .toString('hex')
  }

  ecEncrypt(text, pub_key) {
    return ecies
      .encrypt(new Buffer(pub_key, 'hex'), new Buffer(text))
      .toString('hex')
  }

  async checkClipboardLink() {
    let content = await Clipboard.getString()

    if (content && content.startsWith(ORIGIN_QR_PREFIX))
    {
      let linkCode = content.substr(ORIGIN_QR_PREFIX.length)
      this.copied_code = linkCode
      Clipboard.setString("")
      // this.promptForLink(linkCode)
      this._handleLink({ linkCode })
    }
  }

  handleOpenFromOut(event) {
    this.checkIncomingUrl(event.url)
    this.checkClipboardLink()
  }


  closeWallet() {
    //store the wallet
    this.saveWallet()
    Linking.removeEventListener('url', this.handleOpenFromOut)
  }

  async saveActiveAccount(address) {
    try {
      let accounts = (await this.getAccountMapping()) || []
      //move flag to selected account
      accounts = accounts.map(account => Object.assign({}, account, { active: account.address === address }))
      await storeData(ACCOUNT_MAPPING, accounts)
      return accounts.find(account => account.address === address)
    } catch (error) {
      console.log("Cannot store active wallet account:", address)
    }
  }

  async saveWallet() {
    //save the freaking wallet
    const encrypted_accounts = []
    const addresses = this.getAddresses()
    addresses.forEach(address => {
      const account = web3.eth.accounts.wallet[address]
      encrypted_accounts.push({crypt:"aes",
        enc:CryptoJS.AES.encrypt(account.privateKey, WALLET_PASSWORD).toString()})
    })
    try {
      await storeData(WALLET_STORE, encrypted_accounts)
    } catch (error) {
      console.log("Cannot store wallet data:", error)
    }
  }

  async saveInfo() {
    if (this.save_wallet_info)
    {
      await storeData(WALLET_INFO, this.save_wallet_info)
    }
  }

  async giveMeEth (eth_value) {
    if (this.state.ethAddress)
    {
      const netId = this.state.netId
      if (netId == 999)
      {
        const value = web3.utils.toWei(eth_value, 'ether')
        const sig = await web3.eth.accounts.signTransaction({
             gas: 4000000,
             to: this.state.ethAddress,
             value }, TEST_PRIVATE_KEY)
        const send_result = await web3.eth.sendSignedTransaction(sig.rawTransaction)
        console.log("Funding result:", send_result)
        this.events.emit(Events.UPDATE)
      }
      else
      {
        console.log("Unknown netId:", netId)
      }
    }
  }

  async setNetId() {
    this.state.netId = await web3.eth.net.getId()
  }

  isTestNet() {
    return this.state.netId == 999
  }

  getBuyEthUrl() {
    return `https://buy.coinbase.com/widget?address=${this.state.ethAddress}&amount=0&code=${getEthCode}&crypto_currency=ETH`
  }

  async initWeb3() {
    this.remote_localhost = await loadData(REMOTE_LOCALHOST_STORE)
    if (this.remote_localhost == undefined) {
      this.remote_localhost = defaultLocalRemoteHost
    }
    if (this.remote_localhost.startsWith("http://") || this.remote_localhost.startsWith("https://"))
    {
      const rurl = new URL(this.remote_localhost)
      setRemoteLocal(rurl.hostname)
    } else {
      setRemoteLocal(this.remote_localhost)
    }
    this.initUrls()

    try {
      const {
        provider_url,
        contract_addresses,
        ipfs_gateway,
        ipfs_api,
        dapp_url,
        messaging_url,
        profile_url,
        selling_url,
        attestation_account,
        perf_mode_enabled,
        discovery_server_url
      } = await this.doFetch(this.API_WALLET_SERVER_INFO, 'GET')

      const newProviderUrl = localfy(provider_url)
      console.log("Set network to:", newProviderUrl, contract_addresses)
      console.log("Service urls:", dapp_url, messaging_url, profile_url, selling_url)
      console.log("Discovery:", perf_mode_enabled, discovery_server_url)


      if (this.currentProviderUrl != newProviderUrl)
      {
        web3.setProvider(new Web3.providers.HttpProvider(newProviderUrl, 20000))
        this.currentProviderUrl = newProviderUrl
        // things are probably very different now... we need to reset origin
        origin.initInstance()
      }

      this.dappUrl = dapp_url
      this.messagingUrl = localfy(messaging_url)
      this.profileUrl = profile_url
      this.sellingUrl = selling_url
      // update the contract addresses contract
      origin.contractService.updateContractAddresses(contract_addresses)
      origin.ipfsService.gateway = localfy(ipfs_gateway)
      origin.ipfsService.api = localfy(ipfs_api)
      origin.marketplace.perfModeEnabled = perf_mode_enabled
      origin.discoveryService.discoveryServerUrl = localfy(discovery_server_url)
      // Update the users config.
      origin.users.resolver.updateConfig({ attestation_account })

      await this.setNetId()
      if (this.state.ethAddress)
      {
        this.checkRegisterNotification()
        this.fireEvent(Events.CURRENT_ACCOUNT, {address:this.state.ethAddress})
        this.checkSyncMessages(true)
      }
      this.providerUrl = provider_url
    } catch(error)
    {
      console.log("Cannot fetch server info:", error)
    }
  }

  async updateLinks() {
    try {
      const links = await this.doFetch(this.API_WALLET_GET_LINKS + this.getWalletToken(), "GET")
      const current_rpc = localfy(this.providerUrl)
      const current_accounts = [this.state.ethAddress]
      const updates = {}
      for (const link of links) {
        const priv_data = this.getPrivData(link.pub_key)
        updates[link.link_id] = {current_rpc, current_accounts, priv_data}
      }
      return await this.doFetch(this.API_WALLET_UPDATE_LINKS + this.getWalletToken(), 'POST', {
        updates
      })
    } catch (error) {
      console.log("error updating links ", error)
    }
  }

  async addAccount(privateKey) {
    if (!privateKey.startsWith('0x') && /^[0-9a-fA-F]+$/.test(privateKey))
    {
      privateKey = '0x' + privateKey
    }
    if (privateKey)
    {
      const { address } = web3.eth.accounts.wallet.add(privateKey)
      this.saveWallet()
      this.syncAccountMapping()
      //use only if necessary
      !this.state.ethAddress && this.setWeb3Address(address)
      return true
    }
  }

  async removeAccount(address) {
    const accounts = await web3.eth.getAccounts()
    const result = web3.eth.accounts.wallet.remove(address)
    if (result)
    {
      this.saveWallet()
      this.syncAccountMapping()
    }
    return result
  }

  async nameAccount(address, name) {
    try {
      let accounts = await this.getAccountMapping()
      accounts = accounts.map(account => {
        if (address !== account.address) {
          return account
        }

        return Object.assign({}, account, { name })
      })
      await storeData(ACCOUNT_MAPPING, accounts)
      this.fireEvent(Events.AVAILABLE_ACCOUNTS, { accounts })
      return true
    } catch (error) {
      return false
    }
  }

  //reconcile, store, and emit account objects
  async syncAccountMapping() {
    let accounts = (await this.getAccountMapping()) || []
    //exclude any that were removed from the wallet
    accounts = accounts.filter(({ address }) => web3.eth.accounts.wallet[address])
    //include any that were added to the wallet
    this.getAddresses().filter(address => !accounts.find(account => account.address === address)).forEach(address => {
      accounts.push({ address })
    })
    //update listeners
    this.fireEvent(Events.AVAILABLE_ACCOUNTS, { accounts })
    await storeData(ACCOUNT_MAPPING, accounts)
    return accounts
  }

  getPrivateKey(address) {
    const account = (address ? web3.eth.accounts.wallet[address] : this.getCurrentWeb3Account()) || {}
    return account.privateKey 
  }

  //retrieve account addresses from wallet keys since indexes can get deleted
  getAddresses() {
    return Object.keys(web3.eth.accounts.wallet).filter(k => {
      return web3.utils.isAddress(k) && k === web3.utils.toChecksumAddress(k)
    })
  }

  async getAccountMapping() {
    return await loadData(ACCOUNT_MAPPING)
  }

  async setWeb3Address(ethAddress) {
    if (ethAddress !== this.state.ethAddress)
    {
      web3.eth.defaultAccount = ethAddress
      Object.assign(this.state, {ethAddress})
      this.saveActiveAccount(ethAddress)
      if (this.state.netId)
      {
        this.fireEvent(Events.CURRENT_ACCOUNT, {address:this.state.ethAddress})
      }
      this.checkRegisterNotification()
      this.checkDoLink()
      this.saveWallet()
      await this.updateLinks()
    }
  }

  createAccount() {
    //record prior state
    const prevAddresses = this.getAddresses()
    const wallet = web3.eth.accounts.wallet.create(1)
    this.syncAccountMapping()
    //identify change in state
    const address = this.getAddresses().find(address => !prevAddresses.find(addr => addr === address))
    //use only if solitary
    !this.state.ethAddress && this.setWeb3Address(address)
    return address
  }

  openWallet() {
    let state = this.state
    const wallet_data = loadData(WALLET_STORE).then(async (wallet_data) => {
      let wallet_info = await loadData(WALLET_INFO)
      if (!wallet_info)
      {
        //brand new info
        wallet_info = {walletToken: await UUIDGenerator.getRandomUUID()}
      }
      else
      {
        if (wallet_info.deviceToken)
        {
          // if we have a deviceToken store, then assume we already have notifications on
          // and make sure we have the correct(non-expired) token
          this.requestNotifications()
        }
      }
      this.state.walletToken = wallet_info.walletToken
      this.save_wallet_info = wallet_info
      this.saveInfo()
      //set the provider here..
      //this should probably also come from the data block
      //in case when we want to let people change providers...
      web3.setProvider(new Web3.providers.HttpProvider(defaultProviderUrl, 20000))
      this.currentProviderUrl = defaultProviderUrl
      await this.initWeb3()

      if (wallet_data)
      {
        web3.eth.accounts.wallet.clear()
        for (let i=0; i < wallet_data.length; i++) {
          const data = wallet_data[i]
          if (data.crypt == "aes" && data.enc) {
            const privKey = CryptoJS.AES.decrypt(data.enc, WALLET_PASSWORD).toString(CryptoJS.enc.Utf8)
            if (privKey)
            {
              web3.eth.accounts.wallet.add(privKey)
            }
          }
        }
        const { length } = web3.eth.accounts.wallet
        if (length)
        {
          const accounts = await this.syncAccountMapping()
          const active = accounts.find(({ active }) => active) || {}
          this.setWeb3Address(active.address || accounts[0].address)
        }
      }
    })

    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial url is: ' + url)
        this.checkIncomingUrl(url)
      }
    }).catch(err => console.error('An error occurred', err))

    //in case it's an initial install
    this.checkClipboardLink()

    this.handleOpenFromOut = this.handleOpenFromOut.bind(this)
    Linking.addEventListener('url', this.handleOpenFromOut)
  }
}

const wallet = new OriginWallet()
export default wallet
export { Events }
