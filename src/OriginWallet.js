import {PushNotificationIOS,Linking, Clipboard} from 'react-native'
import PushNotification from 'react-native-push-notification'
import {localfy, storeData, loadData} from './tools'
import Web3 from 'web3'
import fetch from 'cross-fetch'
import keyMirror from 'utils/keyMirror'

import origin, {bridgeUrl, defaultProviderUrl} from './services/origin'


const providerUrl = defaultProviderUrl

const API_ETH_NOTIFICATION = `${bridgeUrl}/api/notifications/eth-endpoint`
const API_WALLET_LINKER = `${bridgeUrl}/api/wallet-linker`
const API_WALLET_LINKER_LINK = API_WALLET_LINKER + "/link-wallet"
const API_WALLET_LINKER_MESSAGES = API_WALLET_LINKER + "/wallet-messages"
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
  NEW_ACCOUNT:null
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

  registerListener(event, callback)
  {
    this.listeners[event] = (this.listeners[event] || []).concat(callback)
  }

  unregisterListener(event, callback)
  {
    this.listeners[event] = (this.listeners[event] || []).filter(cb => cb != callback)
  }

  fireEvent(event, data) {
    if (this.listeners[event])
    {
      this.listeners[event].forEach((callback) => 
        callback(data));
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
          alert("We are now linked return url:"+ responseJson.return_url + " on browser:" + app_info.browser)
        }
      }
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
      this.doLink(state.deviceToken, state.linkCode, rpc_server, [state.ethAddress])
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
      return responseJson.success
    }).catch((error) => {
      console.error(error)
    })
  }

  async fetchListing(address) {
    let listing = await origin.listings.get(address)
    console.log("listing is:", listing)
  }

  doTransaction({action, meta, call_name, call_id, params, return_url, session_token}){
    if (action == "sign")
    {
      web3.eth.signTransaction(params.txn_object).then(ret => {
        this.returnCall(this.state.deviceToken, call_id, session_token, ret["raw"]).then(
          (success) => {
            if (return_url)
            {
              console.log("transaction approved returning to:", message.return_url)
              alert("Please tap the return to safari button up top to complete transaction..")
              //Linking.openURL(message.return_url)
            }
          })
      })
    }
    else if (action == "send")
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
            }
          )
        }
      }).on('error', console.error) // TODO: handle error and completion here!
    }
  }

  processCall(meta, call_name, call_id, params, return_url, session_token, force_from = false) {
    if (force_from && params.txn_object)
    {
      params.txn_object.from = this.state.ethAddress
    }
    let info = meta.info
    let title = "Transaction pending"
    let description = "Do you approve of this transaction?"
    if (info)
    {
      title = info.action + " pending"
      description = "Do you wish to " + info.action + " " + info.name + "?"

      if (info.type == "Listing")
      {
          this.fetchListing(info.address)
      }
    }
    if (call_name == "signTransaction")
    {
      if (params.txn_object.from.toLowerCase() == this.state.ethAddress.toLowerCase())
      {
        this.fireEvent(Events.PROMPT_TRANSACTION, {action:"sign", meta, call_name, call_id, params, return_url, session_token})
      }
    }
    else if (call_name == "processTransaction")
    {
      if (params.txn_object.from.toLowerCase() == this.state.ethAddress.toLowerCase())
      {
        this.fireEvent(Events.PROMPT_TRANSACTION, {action:"send", meta, call_name, call_id, params, return_url, session_token})
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
      this.checkDoLink()
    }
  }


  promptForLink(linkCode) {
    console.log("link code is:" + linkCode)
    if (this.linking_code != linkCode)
    {
      this.linking_code = linkCode
      this.fireEvent(Events.PROMPT_LINK, {linkCode})
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
    saveWallet()
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
