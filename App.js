import React,{Component} from 'react';
import { StyleSheet, Text, View, PushNotificationIOS, TouchableOpacity, NativeModules} from 'react-native';
import PushNotification from 'react-native-push-notification';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { BRIDGE_SERVER_PROTOCOL,  BRIDGE_SERVER_DOMAIN, BRIDGE_SERVER_PORT } from 'react-native-dotenv';

const API_SERVER_IP = BRIDGE_SERVER_DOMAIN ?
    BRIDGE_SERVER_DOMAIN : NativeModules.SourceCode.scriptURL.split('://')[1].split('/')[0].split(':')[0];

const API_SERVER = BRIDGE_SERVER_PORT ?
    API_SERVER_IP + ":" + BRIDGE_SERVER_PORT : API_SERVER_IP;

const API_ETH_NOTIFICATION = BRIDGE_SERVER_PROTOCOL + "://" + API_SERVER + "/api/notifications/eth-endpoint";
const APN_NOTIFICATION_TYPE = "APN";
const ETHEREUM_QR_PREFIX = "ethereum:";


export default class OriginCatcherApp extends Component {
  constructor(props) {
    super(props);
    this.state = {notifyTime:null, notifyMessage:null, deviceToken:undefined, notificationType:undefined, ethAddress:undefined};

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

  registerNotificationAddress(eth_address, device_token, notification_type) {
     fetch(API_ETH_NOTIFICATION, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eth_address: eth_address,
        device_token: device_token,
        type: notification_type
      }),
    }).then((response) => response.json()).
      then((responseJson) => {
        console.log("We got a response from the server:", responseJson);
        alert("We are now subscribed to:" + eth_address);
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

  onNotificationRegistered(deviceToken, notification_type) {
	  // TODO: Send the token to my server so it could send back push notifications...
		console.log("Device Token Received", deviceToken);

    this.setState( previousState => {
        previousState.deviceToken = deviceToken;
        previousState.notificationType = notification_type;
        return previousState;
    });
    this.checkRegisterNotification();
  }

  onNotification(notification) {
    this.setState( previousState => {
        previousState.notifyTime = new Date();
        previousState.notifyMessage = notification.message;
        return previousState;
    });
  }

  onQRScanned(scan) {
    console.log("Eth address scanned:", scan.data);
    this.setState( previousState => {
      if (scan.data.startsWith(ETHEREUM_QR_PREFIX))
      {
        previousState.ethAddress = scan.data.substr(ETHEREUM_QR_PREFIX.length);
      }
      return previousState;
    });

    this.checkRegisterNotification();
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

  render() {
    return (
      <QRCodeScanner
        reactivate={true}
        onRead={this.onQRScanned.bind(this)}
        topContent={
          <View >
            <Text style={styles.centerText}>
                Display the QR code for your wallet and scan it.
            </Text>
            <Text style={styles.centerText}>
                  {this.lastNotify()}
            </Text>
          </View>
        }
        bottomContent={
          <TouchableOpacity style={styles.buttonTouchable}>
            <Text style={styles.buttonText}>Scan Wallet QR!</Text>
          </TouchableOpacity>
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
});
