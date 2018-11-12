import {PushNotificationIOS,Linking, Clipboard} from 'react-native'
import PushNotification from 'react-native-push-notification'
import {localfy, storeData, loadData} from './tools'
import Web3 from 'web3'
import fetch from 'cross-fetch'
import keyMirror from 'utils/keyMirror'
import EventEmitter from 'events'
import {EthNotificationTypes} from 'origin/common/enums'

import origin, {apiUrl, defaultProviderUrl, messageOpenUrl} from './services/origin'

const providerUrl = defaultProviderUrl

const wsApiUrl = apiUrl.replace(/^http/, 'ws')

const API_ETH_NOTIFICATION = `${apiUrl}/api/notifications/eth-endpoint`
const API_WALLET_LINKER = `${apiUrl}/api/wallet-linker`
const API_WALLET_LINKER_LINK = API_WALLET_LINKER + "/link-wallet/"
const API_WALLET_LINKER_UNLINK = API_WALLET_LINKER + "/unlink-wallet/"
const WS_API_WALLET_LINKER_MESSAGES = `${wsApiUrl}/api/wallet-linker/wallet-messages/`
const API_WALLET_LINK_INFO = API_WALLET_LINKER + "/link-info"
const API_WALLET_LINKER_RETURN_CALL = API_WALLET_LINKER + "/wallet-called/"
const API_WALLET_GET_LINKS = API_WALLET_LINKER + "/wallet-links/"
const ETHEREUM_QR_PREFIX = "ethereum:"
const ORIGIN_QR_PREFIX = "orgw:"


const ORIGIN_PROTOCOL_PREFIX = "http://www.originprotocol.com/mobile/"
const SECURE_ORIGIN_PROTOCOL_PREFIX = "https://www.originprotocol.com/mobile/"
const LAST_MESSAGE_IDS = "last_message_ids"
const TEST_PRIVATE_KEY = "0x388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418"
const WALLET_PASSWORD = "TEST_PASS"
const WALLET_STORE = "WALLET_STORE"

// This is the format of the walletToken
const getWalletToken = (deviceType, deviceToken) => `${deviceType}:${deviceToken}`

const Events = keyMirror({
  PROMPT_LINK:null,
  PROMPT_TRANSACTION:null,
  PROMPT_SIGN:null,
  NEW_ACCOUNT:null,
  LINKED:null,
  TRANSACTED:null,
  UNLINKED:null,
  REJECT:null,
  LINKS:null,
  UPDATE:null
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


class OriginWallet {
  constructor() {
    this.state = {
      notifyTime: null,
      notifyMessage: null,
      deviceToken: undefined,
      notificationType: undefined,
      ethAddress: undefined,
      linkCode: undefined,
    }

    this.last_message_ids = {}
    //sync messages once we have it all ready
    this.check_messages_interval = setInterval(this.checkSyncMessages.bind(this), 1000)

    loadData(LAST_MESSAGE_IDS).then((ids) => { 
      if (ids) {
        this.last_message_ids = ids
      }
    })

    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function(device_token) {
        this.onNotificationRegistered(device_token["token"], this.getNotifyType())
      }.bind(this),

      // (required) Called when a remote or local notification is opened or received
      onNotification: function(notification) {
        console.log( 'NOTIFICATION:', notification )
        this.onNotification(notification)

        // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
        notification.finish(PushNotificationIOS.FetchResult.NoData)
      }.bind(this),

      // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: "YOUR GCM SENDER ID",

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
        * (optional) default: true
        * - Specified if permissions (ios) and token (android and ios) will requested or not,
        * - if not, you must call PushNotificationsHandler.requestPermissions() later
        */
      requestPermissions: true,
    })

    this.events = new EventEmitter()
    this.onQRScanned = this.onQRScanned.bind(this)
  }

  getNotifyType() {
    return EthNotificationTypes.APN
  }


  async fireEvent(event_type, event, matcher) {
    if (typeof(event) == 'object')
    {
      const ts = new Date()
      if(!event.event_id)
      {
        //make it a true event by filling it
        event = await this.extractEventInfo(event)
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

  getAccount() {
    return this.state.ethAddress;
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
    }).then((response) => response.json())
  }

  registerNotificationAddress(eth_address, device_token, notification_type) {
    return this.doFetch(API_ETH_NOTIFICATION, 'POST', {
      eth_address: eth_address,
      device_token: device_token,
      type: notification_type
    }).then((responseJson) => {
      console.log("We are now subscribed to:" + eth_address)
    }).catch((error) => {
      console.error(error)
    })
  }

  doLink(code, current_rpc, current_accounts) {
    return this.doFetch(API_WALLET_LINKER_LINK + getWalletToken(this.getNotifyType(), this.state.deviceToken), 'POST', {
      code,
      current_rpc,
      current_accounts
    }).then((responseJson) => {
      const app_info = responseJson.app_info
      console.log("We are now linked to a remote wallet:", responseJson, " browser is:", app_info)

      const link_id = responseJson.link_id
      this.fireEvent(Events.LINKED, {linked:true, link:{link_id, return_url:app_info.return_url, app_info:responseJson.app_info, linked_at:new Date(responseJson.linked_at)}})

      if (responseJson.pending_call)
      {
        const msg = responseJson.pending_call
        this.processCall(msg.call, msg.call_id, app_info.return_url, msg.session_token, link_id, true)
      }
      else
      {
        if (responseJson.return_url && this.copied_code == code)
        {
          Linking.openURL(responseJson.return_url)
        }
        else
        {
          console.log("We are now linked return url:"+ responseJson.return_url + " on browser:" + app_info)
        }
      }

      return true
    }).catch((error) => {
      console.error(error)
    })
  }

  doUnlink(wallet_token, link_id) {
    return this.doFetch(API_WALLET_LINKER_UNLINK + getWalletToken(this.getNotifyType(), this.state.deviceToken), 'POST', {
      link_id
    }).then((responseJson) => {
      console.log("We are now unlinked from remote wallet:", link_id)
      if (responseJson.success)
      {
        this.fireEvent(Events.UNLINKED, {link_id, unlinked_at:new Date()}, eventMatcherByLinkId(link_id))
      }
      return true
    }).catch((error) => {
      console.error(error)
    })
  }


  doGetLinkedDevices(wallet_token) {
    return this.doFetch(API_WALLET_GET_LINKS + getWalletToken(this.getNotifyType(), this.state.deviceToken), "GET").then((responseJson) => {
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


  checkRegisterNotification() {
    let state = this.state
    if (state.ethAddress && state.notificationType && state.deviceToken)
    {
      // TODO: figure out where to implement this later
      //this.registerNotificationAddress(state.ethAddress, state.deviceToken, state.notificationType)
    }
  }

  checkDoLink() {
    let state = this.state
    if (state.linkCode && state.deviceToken && state.ethAddress)
    {
      console.log("linking...")
      let rpc_server = this.copied_code == state.linkCode ? localfy(providerUrl) : providerUrl
      return this.doLink(state.linkCode, rpc_server, [state.ethAddress])
    }
  }


  checkDoUnlink(link_id) {
    if (this.state.deviceToken)
    {
      console.log("Unlinking...")
      return this.doUnlink(link_id)
    }
  }

  onNotificationRegistered(deviceToken, notification_type) {
    // TODO: Send the token to my server so it could send back push notifications...
    console.log("Device Token Received", deviceToken)

    Object.assign(this.state, {deviceToken, notificationType:notification_type})
    this.checkRegisterNotification()
  }

  returnCall(event_id, call_id, session_token, link_id, result, fire_event) {
    return this.doFetch(API_WALLET_LINKER_RETURN_CALL + getWalletToken(this.getNotifyType(), this.state.deviceToken), 'POST', {
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

  async extractEventInfo(event_data) {
    const transaction = event_data.transaction
    const link = event_data.link
    if (transaction)
    {
      const meta = await this.extractMetaFromCall(transaction.call) || {}
      const cost = this.extractTransactionCost(transaction.call)
      const gas_cost = this.extractTransactionGasCost(transaction.call)
      const listing = this.extractListing(meta)
      const to = this.extractTo(transaction.call)
      const action_label = this.extractTransactionActionLabel(meta)
      const action = "transaction"
      return {...event_data, meta, action, action_label, to, cost, gas_cost, listing}
    }
    else if (link)
    {
      const action = "link"
      return {...event_data, action}
    }
    else if (event_data.sign)
    {
      const action = "sign"
      return {...event_data, action}
    }
    //this is the bare event
    return event_data
  }

  async extractMetaFromCall({net_id, params:{txn_object}}) {
    const netId = this.state.netId
    if(netId != net_id)
    {
      throw(`Remote net id ${net_id} does not match local netId ${netId}`)
    }
    return origin.reflection.extractContractCallMeta(netId, txn_object.to, txn_object.data)
  }

  extractTransactionActionLabel({marketplace, originToken, contract, method, params, subMeta}) {
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
        return "Purchase"
      }
      else if (method.startsWith("createListing"))
      {
        return "Create listing"
      }
    }
    // TODO: need something better here
    return contract + "." + method
  }

  extractTo({params}) {
    return params && params.txn_object && params.txn_object.to
  }


  extractListing({listing, subMeta}) {
    return listing || (subMeta && subMeta.listing)
  }

  extractTransactionCost({params}){
    // might want to format this some how
    return params && params.txn_object && web3.utils.toBN(params.txn_object.value)
  }

  extractTransactionGasCost({params}){
    // might want to format this some how
    return params && params.txn_object && (web3.utils.toBN(params.txn_object.gas) * web3.utils.toBN(params.txn_object.gasPrice))
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
    let {link_id} = event.link
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
                  console.log("transaction approved returning to:", return_url)
                  Linking.openURL(return_url)
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

  _handleSign(event_id, {call, call_id, return_url, session_token, link_id}){
    const method = call.method
    const params = call.params
    return new Promise((resolve, reject) => {
      if (call_name == "signMessage")
      {
        const msg = params.msg
        const post_phrase_prefix = params.post_phrase_prefix
        console.log("signing message:", msg)
        const signature = web3.eth.accounts.wallet[0].sign(msg).signature
        const ret = {msg, signature, account:this.state.ethAddress}

        if (post_phrase_prefix)
        {
          const sig_key = signature.substring(0, 66)
          const temp_account = web3.eth.accounts.privateKeyToAccount(sig_key)

          const post_phrase = post_phrase_prefix + temp_account.address
          const post_signature = web3.eth.accounts.wallet[0].sign(post_phrase).signature
          ret.post_phrase = post_phrase
          ret.post_signature = post_signature
        }
        console.log("Signing result:", ret)

        this.returnCall(event_id, call_id, session_token, link_id, ret, Events.TRANSACTED).then(
            (success) => {
              if (return_url)
              {
                console.log("transaction approved returning to:", return_url)
                Linking.openURL(return_url)
              }
              resolve(success)
            })
      }
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
    this.last_message_ids[this.state.ethAddress] = msgId
    this.syncLastMessages()
  }

  syncServerMessages() {
    this.closeLinkMessages()
    const last_message_id = this.last_message_ids[this.state.ethAddress] || '0'
    console.log("syncing messages on last_message_id:", last_message_id)
    // Connect the websocket
    const ws = new WebSocket(WS_API_WALLET_LINKER_MESSAGES + getWalletToken(this.getNotifyType(), this.state.deviceToken) + '/' + last_message_id)

    ws.onmessage = e => {
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
        }, 60000) // check in 60 seconds
      }
    }
    this.messages_ws = ws
  }

  checkSyncMessages(force) {
    const doSync = !this.messages_ws || (force && !this.isLinkMessagesOpen())
    if (this.state.deviceToken && this.state.ethAddress && this.state.netId && doSync)
    {
      this.syncServerMessages()
    }
  }

  onNotification(notification) {
    Object.assign( this.state, {
      notifyTime:new Date(),
      notifyMessage:notification.message
    })
    console.log("notification.message:", notification.message)
    if (notification.message == "You've received a new message")
    {
      Linking.openURL(messageOpenUrl)
    }
    this.checkSyncMessages(true)
  }

  onQRScanned(scan) {
    console.log("Address scanned:", scan.data)
    let key
    if (scan.data.startsWith(ETHEREUM_QR_PREFIX))
    {
      let ethAddress = scan.data.substr(ETHEREUM_QR_PREFIX.length)
      if (ethAddress != this.state.ethAddress)
      {
        Object.assign(this.state, {ethAddress})
        this.checkRegisterNotification()
      }
    }
    else if (scan.data.startsWith(ORIGIN_QR_PREFIX))
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
    if (url.startsWith(ORIGIN_PROTOCOL_PREFIX))
    {
      return url.substr(ORIGIN_PROTOCOL_PREFIX.length)
    }
    if (url.startsWith(SECURE_ORIGIN_PROTOCOL_PREFIX))
    {
      return url.substr(SECURE_ORIGIN_PROTOCOL_PREFIX.length)
    }
  }

  checkIncomingUrl(url) {
    let key = this.checkStripOriginUrl(url)
    if (key)
    {
      this.promptForLink(key)
    }
  }

  setLinkCode(linkCode){
    if (linkCode != this.state.linkCode)
    {
      Object.assign(this.state, {linkCode})
      return this.checkDoLink()
    }
  }

  promptForLink(linkCode) {
    console.log("link code is:" + linkCode)
    if (this.linking_code != linkCode)
    {
      this.linking_code = linkCode

      this.doFetch(API_WALLET_LINK_INFO, 'POST',
        {code:linkCode}).then(responseJson => {
          //get info about the link
          this.fireEvent(Events.PROMPT_LINK, {linked:false, link:{linkCode, link_id:responseJson.link_id, return_url:responseJson.return_url, app_info:responseJson.app_info, expires_at:new Date(responseJson.expires_at)}})
        })
    }
  }

  async checkClipboardLink() {
    let content = await Clipboard.getString()

    if (content && content.startsWith(ORIGIN_QR_PREFIX))
    {
      let linkCode = content.substr(ORIGIN_QR_PREFIX.length)
      this.copied_code = linkCode
      Clipboard.setString("")
      this.promptForLink(linkCode)
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

  saveWallet() {
    //save the freaking wallet
    storeData(WALLET_STORE, web3.eth.accounts.wallet.encrypt(WALLET_PASSWORD))
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

  openWallet() {
    let state = this.state
    loadData(WALLET_STORE).then((wallet_data) => { 
      //set the provider here..
      //this should probably also come from the data block
      //in case when we want to let people change providers...
      web3.setProvider(new Web3.providers.HttpProvider(localfy(providerUrl), 20000))
      // set the net id after the provider
      this.setNetId()

      if (wallet_data)
      {
        web3.eth.accounts.wallet.decrypt(wallet_data, WALLET_PASSWORD)
      }

      if(!web3.eth.accounts.wallet.length)
      {
        //generate our wallet
        //web3.eth.accounts.wallet.add(TEST_PRIVATE_KEY)
        web3.eth.accounts.wallet.create(1)
      }
      let ethAddress = web3.eth.accounts.wallet[0].address
      if (ethAddress != this.state.ethAddress)
      {
        web3.eth.defaultAccount = ethAddress
        this.fireEvent(Events.NEW_ACCOUNT, {address:ethAddress})
        Object.assign(this.state, {ethAddress})
        this.checkRegisterNotification()
        this.saveWallet()
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
