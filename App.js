import React,{Component} from 'react';
import {Alert, StyleSheet, Text, View, PushNotificationIOS, TouchableOpacity, TextInput, NativeModules, AsyncStorage, Linking, Clipboard} from 'react-native';
import PushNotification from 'react-native-push-notification';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { BRIDGE_SERVER_PROTOCOL,  BRIDGE_SERVER_DOMAIN, BRIDGE_SERVER_PORT } from 'react-native-dotenv';
import ethers from 'ethers'

const API_SERVER_IP = BRIDGE_SERVER_DOMAIN ?
    BRIDGE_SERVER_DOMAIN : NativeModules.SourceCode.scriptURL.split('://')[1].split('/')[0].split(':')[0];

const API_SERVER = BRIDGE_SERVER_PORT ?
    API_SERVER_IP + ":" + BRIDGE_SERVER_PORT : API_SERVER_IP;

const API_ETH_NOTIFICATION = BRIDGE_SERVER_PROTOCOL + "://" + API_SERVER + "/api/notifications/eth-endpoint";
const API_WALLET_LINKER = BRIDGE_SERVER_PROTOCOL + "://" + API_SERVER + "/api/wallet-linker";
const API_WALLET_LINKER_LINK = API_WALLET_LINKER + "/link-wallet";
const API_WALLET_LINKER_MESSAGES = API_WALLET_LINKER + "/wallet-messages";
const API_WALLET_LINKER_RETURN_CALL = API_WALLET_LINKER + "/wallet-called";
const APN_NOTIFICATION_TYPE = "APN";
const ETHEREUM_QR_PREFIX = "ethereum:";
const ORIGIN_QR_PREFIX = "orgw:";
const DEFAULT_TEST_BUYER = "0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef";
const RPC_SERVER = "http://localhost:8545";
const INTERNAL_RPC_SERVER = "http://" + API_SERVER_IP + ":8545";
const ORIGIN_PROTOCOL_PREFIX = "http://www.originprotocol.com/mobile/";
const SECURE_ORIGIN_PROTOCOL_PREFIX = "https://www.originprotocol.com/mobile/";
const DEFAULT_MNEMONIC = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
const DEFAULT_MNEMONIC_PATH_INDEX = "4";
const LAST_MESSAGE_IDS = "last_message_ids";


export default class OriginCatcherApp extends Component {
  constructor(props) {
    super(props);
    this.state = {notifyTime:null, notifyMessage:null, deviceToken:undefined, notificationType:undefined, ethAddress:undefined, linkCode:undefined,
      mnemonic:DEFAULT_MNEMONIC, mnemonicIndex:DEFAULT_MNEMONIC_PATH_INDEX
    };
    this.wallet = undefined
    this.new_messages = true;
    this.last_message_ids = {}
    this.check_messages_interval = setInterval(this.checkServerMessages.bind(this), 1000)

    AsyncStorage.getItem(LAST_MESSAGE_IDS).then((ids_str) => { 
      if (ids_str) {
        this.last_message_ids = JSON.parse(ids_str);
      }
    })

    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function(device_token) {
        this.onNotificationRegistered(device_token["token"], APN_NOTIFICATION_TYPE);
      }.bind(this),

      // (required) Called when a remote or local notification is opened or received
      onNotification: function(notification) {
          console.log( 'NOTIFICATION:', notification );
          this.onNotification(notification)

          // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
          notification.finish(PushNotificationIOS.FetchResult.NoData);
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
    });

  }

  syncLastMessages() {
    AsyncStorage.setItem(LAST_MESSAGE_IDS, JSON.stringify(this.last_message_ids));
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
    }).then((response) => response.json());
  }

  registerNotificationAddress(eth_address, device_token, notification_type) {
    return this.doFetch(API_ETH_NOTIFICATION, 'POST', {
        eth_address: eth_address,
        device_token: device_token,
        type: notification_type
      }).then((responseJson) => {
        console.log("We are now subscribed to:" + eth_address);
      }).catch((error) => {
        console.error(error);
      });
  }

  doLink(wallet_token, code, current_rpc, current_accounts) {
    return this.doFetch(API_WALLET_LINKER_LINK, 'POST', {
        wallet_token,
        code,
        current_rpc,
        current_accounts
      }).then((responseJson) => {
        console.log("We are now linked to a remote wallet:", responseJson);
        if (responseJson.pending_call)
        {
          let msg = responseJson.pending_call
          let call = responseJson.pending_call.call
          this.processCall(call[0], msg.call_id, call[1], responseJson.return_url, msg.session_token, true)
        }
        else
        {
          if (responseJson.return_url && this.copied_code == code)
          {
            Linking.openURL(responseJson.return_url)
          }
          else
          {
            alert("We are now linked return url:"+ responseJson.return_url);
          }
        }
      }).catch((error) => {
        console.error(error);
      });
  }

  checkRegisterNotification() {
    let state = this.state;
    if (state.ethAddress && state.notificationType && state.deviceToken)
    {
        this.registerNotificationAddress(state.ethAddress, state.deviceToken, state.notificationType);
    }
  }

  checkDoLink() {
    let state = this.state;
    if (state.linkCode && state.deviceToken && state.ethAddress)
    {
        console.log("linking...");
        let rpc_server = this.copied_code == state.linkCode ? INTERNAL_RPC_SERVER : RPC_SERVER
        this.doLink(state.deviceToken, state.linkCode, rpc_server, [state.ethAddress]);
    }
  }


  onNotificationRegistered(deviceToken, notification_type) {
	  // TODO: Send the token to my server so it could send back push notifications...
		console.log("Device Token Received", deviceToken);

    this.setState({deviceToken, notificationType:notification_type}, () => {
      this.checkRegisterNotification();
    });
  }

  returnCall(wallet_token, call_id, session_token, result) {
    return this.doFetch(API_WALLET_LINKER_RETURN_CALL, 'POST', {
      wallet_token,
        call_id,
      session_token,
      result}).then((responseJson) => {
        console.log("returnCall successful:", responseJson.success);
        return responseJson.success
      }).catch((error) => {
        console.error(error);
      });


  }

  processCall(call_name, call_id, params, return_url, session_token, force_from = false) {

    if (force_from && params.txn_object)
    {
      params.txn_object.from = this.wallet.address
    }
    if (call_name == "signTransaction")
    {
      if (params.txn_object.from.toLowerCase() == this.wallet.address.toLowerCase())
      {

        Alert.alert(
          "Transaction pending",
          "Do you approve this transaction?",
          [
            {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: 'OK', onPress: () => { 
              console.log(params)
              ret = this.wallet.sign(params.txn_object)
              this.returnCall(this.state.deviceToken, call_id, session_token, ret).then(
                (success) => {
                  if (return_url)
                  {
                    console.log("transaction approved returning to:", message.return_url)
                    alert("Please tap the return to safari button up top to complete transaction..")
                    //Linking.openURL(message.return_url)
                  }
                })
            }},
          ],
          { cancelable: false }
        )
      }
    }
    else if (call_name == "processTransaction")
    {
      if (params.txn_object.from.toLowerCase() == this.wallet.address.toLowerCase())
      {

        Alert.alert(
          "Incoming Transaction",
          "Do you approve this transaction?",
          [
            {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {text: 'Yes', onPress: () => { 
              console.log(params)
              this.wallet.sendTransaction(params.txn_object).then((transaction) => {
                console.log("transaction sent:", transaction)
                // TODO: detect purchase assume it's all purchases for now.
                let transactionResult = {hash:transaction.hash, purchase:true}
                this.returnCall(this.state.deviceToken, call_id, session_token, transactionResult).then(
                  (success) => {
                    if (return_url)
                    {
                      console.log("transaction approved returning to:", return_url)
                      Linking.openURL(return_url)
                    }
                  }
                )
              })
            }},
          ],
          { cancelable: false }
        )
      }
    }
  }

  getServerMessages() {
    let last_message_id = this.last_message_ids[this.state.ethAddress]
    console.log("Getting messages for last_message_id:", last_message_id);
    return this.doFetch(API_WALLET_LINKER_MESSAGES, 'POST', {
        wallet_token:this.state.deviceToken,
        last_message_id:last_message_id,
        accounts:[this.state.ethAddress]
      }).then((responseJson) => {
        console.log("we got some messages:", responseJson.messages);

        for (let message of responseJson.messages)
        {
          if (message.type == "CALL")
          {
            this.processCall(message.call[0], message.call_id, message.call[1], message.return_url, message.session_token)  
          }
          last_message_id = message.id
        }

        if (responseJson.messages.length){
          this.last_message_ids[this.state.ethAddress] = last_message_id
          this.syncLastMessages()
          //there's some messages here we might have more
          this.new_messages = true;
        }
      }).catch((error) => {
        console.error(error);
      });
  }

  checkServerMessages() {
    if (this.new_messages && this.state.deviceToken && this.state.ethAddress)
    {
       this.getServerMessages()
       this.new_messages = false
    }
  }

  onNotification(notification) {
    this.setState( previousState => {
        previousState.notifyTime = new Date();
        previousState.notifyMessage = notification.message;
        return previousState;
    }, ()=> {
      console.log("checking server for messages..");
      this.new_messages = true;
    });
  }

  onQRScanned(scan) {
    console.log("Address scanned:", scan.data);
    let key;
    if (scan.data.startsWith(ETHEREUM_QR_PREFIX))
    {
      let ethAddress = scan.data.substr(ETHEREUM_QR_PREFIX.length);
      if (ethAddress != this.state.ethAddress)
      {
        this.setState({ethAddress}, () => {
          this.checkRegisterNotification();
        });
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
    let key = this.checkStripOriginUrl(url);
    if (key)
    {
      this.promptForLink(key)
    }
  }

  setLinkCode(linkCode){
    if (linkCode != this.state.linkCode)
    {
      this.setState({linkCode}, () => {
        this.checkDoLink();
      });
    }
  }

  promptForLink(linkCode) {
    console.log("link code is:" + linkCode);
    if (this.linking_code != linkCode)
    {
      this.linking_code = linkCode
      Alert.alert(
        "Link Wallet",
        "Do you wish to link against:"+ linkCode,
        [
          {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => { 
            this.setLinkCode(linkCode)
          }},
        ],
        { cancelable: false }
      )
    }
  }

  async checkClipboardLink() {
    let content = await Clipboard.getString()

    if (content && content.startsWith(ORIGIN_QR_PREFIX))
    {
      let linkCode = content.substr(ORIGIN_QR_PREFIX.length);
      this.copied_code = linkCode;
      Clipboard.setString("")
      this.promptForLink(linkCode)
    }
  }

  handleOpenFromOut(event) {
    this.checkIncomingUrl(event.url)
    this.checkClipboardLink()
  }


  componentDidMount() {
    this.genWallet();
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial url is: ' + url);
        this.checkIncomingUrl(url);
      }
    }).catch(err => console.error('An error occurred', err));

    //in case it's an initial install
    this.checkClipboardLink()

    this.handleOpenFromOut = this.handleOpenFromOut.bind(this)
    Linking.addEventListener('url', this.handleOpenFromOut)
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenFromOut)
  }

  lastNotify() {
    let state = this.state;

    if (state.notifyTime)
    {
      return <Text>Last Notification@{state.notifyTime.toLocaleString()}:{state.notifyMessage}</Text>
    }
    else
    {
      return <Text>No notifications</Text>
    }
  }

  genWallet() {
    let state = this.state;

    if (state.mnemonic && state.mnemonicIndex)
    {
        this.wallet = ethers.Wallet.fromMnemonic(state.mnemonic, "m/44'/60'/0'/0/"+state.mnemonicIndex);
        this.wallet.provider = new ethers.providers.JsonRpcProvider(INTERNAL_RPC_SERVER)
        let ethAddress = this.wallet.address;
        if (ethAddress != this.state.ethAddress)
        {
          this.setState({ethAddress}, () => {
            this.checkRegisterNotification();
          });
        }
    }
  }

  render() {
    return (
      <QRCodeScanner
        reactivate={true}
        reactivateTimeout={5000}
        onRead={this.onQRScanned.bind(this)}
        topContent={
          <View >
            <Text style={styles.centerText}>
            Account: {this.state.ethAddress}
            </Text>
            <Text style={styles.centerText}>
                  {this.lastNotify()}
            </Text>
          </View>
        }
        bottomContent={
          <View>
          <Text>Token: {this.state.deviceToken} </Text>
          <Text>Mnmonic: {this.state.mnemonic} -- {this.state.mnemonicIndex}</Text>
          <TouchableOpacity style={styles.buttonTouchable} onPress={() => {this.onClearMessages()}}>
            <Text style={styles.buttonText}>Clear Message Ids</Text>
          </TouchableOpacity>
          </View>
        }
      />
    );
  }
}

const styles = StyleSheet.create({
  centerText: {
    fontSize: 18,
    padding: 10,
    color: '#777',
    textAlign:'center',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
  input: {
      margin: 15,
      height: 40,
      color:'black',
      borderColor: 'gray',
      borderWidth: 1
   },
});
