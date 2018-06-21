import {PushNotificationIOS,Linking, Clipboard} from 'react-native'
import PushNotification from 'react-native-push-notification'
import {localfy, storeData, loadData} from './tools'
import Web3 from 'web3'
import fetch from 'cross-fetch'
import keyMirror from 'utils/keyMirror'

import origin, {bridgeUrl, defaultProviderUrl} from './services/origin'
import uuidv1 from 'uuid/v1'

const providerUrl = defaultProviderUrl

const API_ETH_NOTIFICATION = `${bridgeUrl}/api/notifications/eth-endpoint`
const API_WALLET_LINKER = `${bridgeUrl}/api/wallet-linker`
const API_WALLET_LINKER_LINK = API_WALLET_LINKER + "/link-wallet"
const API_WALLET_LINKER_UNLINK = API_WALLET_LINKER + "/unlink-wallet"
const API_WALLET_LINKER_MESSAGES = API_WALLET_LINKER + "/wallet-messages"
const API_WALLET_LINK_INFO = API_WALLET_LINKER + "/link-info"
const API_WALLET_LINKER_RETURN_CALL = API_WALLET_LINKER + "/wallet-called"
const APN_NOTIFICATION_TYPE = "APN"
const ETHEREUM_QR_PREFIX = "ethereum:"
const ORIGIN_QR_PREFIX = "orgw:"


const ORIGIN_PROTOCOL_PREFIX = "http://www.originprotocol.com/mobile/"
const SECURE_ORIGIN_PROTOCOL_PREFIX = "https://www.originprotocol.com/mobile/"
const LAST_MESSAGE_IDS = "last_message_ids"
const TEST_PRIVATE_KEY = "0x388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418"
const WALLET_PASSWORD = "TEST_PASS"
const WALLET_STORE = "WALLET_STORE"

Events = keyMirror({
  PROMPT_LINK:null,
  PROMPT_TRANSACTION:null,
  NEW_ACCOUNT:null,
  LINKED:null,
  TRANSACTED:null,
  UNLINKED:null,
  REJECT:null
}, "WalletEvents")

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

    this.new_messages = true
    this.last_message_ids = {}
    this.check_messages_interval = setInterval(this.checkServerMessages.bind(this), 1000)
    this.listeners = {}

    loadData(LAST_MESSAGE_IDS).then((ids) => { 
      if (ids) {
        this.last_message_ids = ids
      }
    })

    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function(device_token) {
        this.onNotificationRegistered(device_token["token"], APN_NOTIFICATION_TYPE)
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

    this.onQRScanned = this.onQRScanned.bind(this)
  }

  registerListener(event_type, callback)
  {
    this.listeners[event_type] = (this.listeners[event_type] || []).concat(callback)
  }

  unregisterListener(event_type, callback)
  {
    this.listeners[event_type] = (this.listeners[event_type] || []).filter(cb => cb != callback)
  }

  purgeListeners()
  {
    this.listeners = {}
  }

  async fireEvent(event_type, data, matcher) {
    if (!matcher)
    {
      matcher = this.eventMatcherByEvent(data)
    }
    let ts = new Date()
    let event = await this.extractEventInfo(data)
    event.event_id = uuidv1()
    event.timestamp = ts
    if (this.listeners[event_type])
    {
      this.listeners[event_type].forEach((callback) => 
        callback(event, matcher));
    }
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
    this.new_messages = true
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

  

  doLink(wallet_token, code, current_rpc, current_accounts) {
    return this.doFetch(API_WALLET_LINKER_LINK, 'POST', {
      wallet_token,
      code,
      current_rpc,
      current_accounts
    }).then((responseJson) => {
      let app_info = responseJson.app_info
      console.log("We are now linked to a remote wallet:", responseJson, " browser is:", app_info)
      if (responseJson.pending_call)
      {
        let msg = responseJson.pending_call
        let call = responseJson.pending_call.call
        this.processCall(msg.meta, call[0], msg.call_id, call[1], responseJson.return_url, msg.session_token, true)
      }
      else
      {
        if (responseJson.return_url && this.copied_code == code)
        {
          Linking.openURL(responseJson.return_url)
        }
        else
        {
          console.log("We are now linked return url:"+ responseJson.return_url + " on browser:" + app_info.browser)
        }
      }

      if (responseJson.link_id)
      {
        let link_id = responseJson.link_id
        this.fireEvent(Events.LINKED, {link:{linked:true, link_id, return_url:responseJson.return_url, app_info:responseJson.app_info}})
      }
      return true
    }).catch((error) => {
      console.error(error)
    })
  }

  doUnlink(wallet_token, link_id) {
    return this.doFetch(API_WALLET_LINKER_UNLINK, 'POST', {
      wallet_token,
      link_id
    }).then((responseJson) => {
      console.log("We are now unlinked from remote wallet:", link_id)
      if (responseJson.success)
      {
        this.fireEvent(Events.UNLINKED, {link_id}, eventMatcherByLinkId(link_id))
      }
      return true
    }).catch((error) => {
      console.error(error)
    })
  }


  checkRegisterNotification() {
    let state = this.state
    if (state.ethAddress && state.notificationType && state.deviceToken)
    {
      this.registerNotificationAddress(state.ethAddress, state.deviceToken, state.notificationType)
    }
  }

  checkDoLink() {
    let state = this.state
    if (state.linkCode && state.deviceToken && state.ethAddress)
    {
      console.log("linking...")
      let rpc_server = this.copied_code == state.linkCode ? localfy(providerUrl) : providerUrl
      return this.doLink(state.deviceToken, state.linkCode, rpc_server, [state.ethAddress])
    }
  }


  checkDoUnlink(link_id) {
    if (state.deviceToken)
    {
      console.log("Unlinking...")
      return this.doUnlink(state.deviceToken, link_id)
    }
  }

  onNotificationRegistered(deviceToken, notification_type) {
    // TODO: Send the token to my server so it could send back push notifications...
    console.log("Device Token Received", deviceToken)

    Object.assign(this.state, {deviceToken, notificationType:notification_type})
    this.checkRegisterNotification()
  }

  returnCall(wallet_token, call_id, session_token, result) {
    return this.doFetch(API_WALLET_LINKER_RETURN_CALL, 'POST', {
      wallet_token,
        call_id,
      session_token,
      result,
    }).then((responseJson) => {
      console.log("returnCall successful:", responseJson.success)
      this.fireEvent(Events.TRANSACTED, {call_id}, eventMatcherByCallId(call_id))
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
      const cost = transaction && this.extractTransactionValue(transaction)
      const listing = await this.extractListing(transaction)
      const to = this.extractTo(transaction)
      const action = OriginWallet.extractAction(transaction)
      return {...event_data, action, to, cost, listing}
    }
    else if (link)
    {
      const action = "link"
      return {...event_data, action}
    }
    //this is the bare event
    return event_data
  }

  extractAction({meta}) {
    return meta && meta.action
  }

  extractTo({params}) {
    return params && params.tx_object && params.txn_object.to
  }


  async extractListing({meta, params}) {
    if (params && params.txn_object && meta)
    {
      if (meta.type == "Listing")
      {
        return origin.listings.get(params.txn_object.to)
      }
      else if(meta.type == "preListing")
      {
        return origin.ipfsService.getFile(meta.ipfs)
      }
    }
  }

  extractTransactionValue({params}){
    if ( params && params.txn_object)
    {
        return web3.utils.fromWei(params.txn_obj.value, "ether")
    }
  }

  eventMatcherByLinkId(link_id) {
    return event => event.link && event.link.link_id == link_id
  }

  eventMatcherByCallId(call_id) {
    return event => event.transaction && event.transaction.call_id == call_id
  }

  eventMatcherByEvent(event) {
    return in_event => this.matchEvents(in_event, event)
  }

  matchEvents(event1, event2) {
    if (event1.link && event2.link)
    {
      return event1.link.link_id && event1.link.link_id == event2.link.link_id
    }
    else if(event1.transaction && event2.transaction)
    {
      return event1.transaction.call_id && event1.transaction.call_id == event2.transaction.call_id
    }
    return event1.event_id == event2.event_id
  }

  async handleEvent(e) {
    if (e.link)
    {
      return this.handleLink(e.link)
    }
    else if (e.transaction)
    {
      return this.handleTransaction(e.transaction)
    }
  }

  handleUnlink({link_id}){
    checkDoUnlink(link_id)
  }

  handleReject(event){
    this.fireEvent(Events.REJECT, event)
  }

  handleLink({linkCode}){
    return this.setLinkCode(linkCode)
  }

  handleTransaction({meta, call_name, call_id, params, return_url, session_token}){
    return new Promise((resolve, reject) => {
      if (call_name == "signTransaction")
      {
        web3.eth.signTransaction(params.txn_object).then(ret => {
          this.returnCall(this.state.deviceToken, call_id, session_token, ret["raw"]).then(
            (success) => {
              if (return_url)
              {
                console.log("transaction approved returning to:", message.return_url)
                Linking.openURL(message.return_url)
                resolve(true)
              }
            })
        }).catch(err)
        {
          reject(err)
        }
      }
      else if (call_name == "processTransaction")
      {
        web3.eth.sendTransaction(params.txn_object).on('receipt', (receipt) => {
          console.log("transaction sent:", receipt)
        }).on('confirmation', (conf_number, receipt) => {
          console.log("confirmation:", conf_number)
          if (conf_number == 1)  // TODO: set this as a setting
          {
            // TODO: detect purchase assume it's all purchases for now.
            let call = undefined
            if (params.meta && params.meta.call)
            {
              call = params.meta.call
            }
            let transactionResult = {hash:receipt.transactionHash, call}
            this.returnCall(this.state.deviceToken, call_id, session_token, transactionResult).then(
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

  processCall(meta, call_name, call_id, params, return_url, session_token, force_from = false) {
    if (force_from && params.txn_object)
    {
      params.txn_object.from = this.state.ethAddress
    }
    let info = meta.info
    let title = "Transaction pending"
    let description = "Do you approve of this transaction?"
    if (call_name == "signTransaction")
    {
      if (params.txn_object.from.toLowerCase() == this.state.ethAddress.toLowerCase())
      {
        this.fireEvent(Events.PROMPT_TRANSACTION, {transaction:{meta, call_name, call_id, params, return_url, session_token}})
      }
    }
    else if (call_name == "processTransaction")
    {
      if (params.txn_object.from.toLowerCase() == this.state.ethAddress.toLowerCase())
      {
        this.fireEvent(Events.PROMPT_TRANSACTION, {transaction:{meta, call_name, call_id, params, return_url, session_token}})
      }
    }
  }

  getServerMessages() {
    let last_message_id = this.last_message_ids[this.state.ethAddress]
    console.log("Getting messages for last_message_id:", last_message_id)
    return this.doFetch(API_WALLET_LINKER_MESSAGES, 'POST', {
        wallet_token:this.state.deviceToken,
        last_message_id:last_message_id,
        accounts:[this.state.ethAddress]
      }).then((responseJson) => {
        console.log("we got some messages:", responseJson.messages)

        for (let message of responseJson.messages)
        {
          if (message.type == "CALL")
          {
            this.processCall(message.meta, message.call[0], message.call_id, message.call[1], message.return_url, message.session_token)  
          }
          last_message_id = message.id
        }

        if (responseJson.messages.length){
          this.last_message_ids[this.state.ethAddress] = last_message_id
          this.syncLastMessages()
          //there's some messages here we might have more
          this.new_messages = true
        }
      }).catch((error) => {
        console.error(error)
      })
  }

  checkServerMessages() {
    if (this.new_messages && this.state.deviceToken && this.state.ethAddress)
    {
       this.getServerMessages()
       this.new_messages = false
    }
  }

  onNotification(notification) {
    Object.assign( this.state, {
      notifyTime:new Date(),
      notifyMessage:notification.message
    })
    console.log("checking server for messages..")
    this.new_messages = true
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
          this.fireEvent(Events.PROMPT_LINK, {link:{linkCode, link_id:responseJson.link_id, return_url:responseJson.return_url, app_info:responseJson.app_info}})
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
    storeData(WALLET_STORE, web3.accounts.wallet)
  }

  openWallet() {
    let state = this.state
    loadData(WALLET_STORE).then((wallet_data) => { 
      //set the provider here..
      //this should probably also come from the data block
      //in case when we want to let people change providers...
      web3.setProvider(new Web3.providers.HttpProvider(localfy(providerUrl), 20000))
      if (wallet_data)
      {
        web3.eth.accounts.wallet.decrypt(wallet_data, WALLET_PASSWORD)
      }

      if(!web3.eth.accounts.wallet.length)
      {
        //generate our wallet
        web3.eth.accounts.wallet.add(TEST_PRIVATE_KEY)
        //web3.eth.accounts.wallet.create()
      }

      let ethAddress = web3.eth.accounts.wallet[0].address
      if (ethAddress != this.state.ethAddress)
      {
        this.fireEvent(Events.NEW_ACCOUNT, {address:ethAddress})
        Object.assign(this.state, {ethAddress})
        this.checkRegisterNotification()
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
