'use strict'

import { Component } from 'react'
import {
  Alert,
  DeviceEventEmitter,
  Platform,
  PushNotificationIOS
} from 'react-native'
import PushNotification from 'react-native-push-notification'
import { connect } from 'react-redux'

import graphqlContext from '@origin/graphql/src/contracts'

import { addNotification } from 'actions/Notification'
import { setDeviceToken } from 'actions/Settings'
import {
  DEFAULT_NOTIFICATION_PERMISSIONS,
  ETH_NOTIFICATION_TYPES
} from './constants'

class PushNotifications extends Component {
  constructor(props) {
    super(props)

    DeviceEventEmitter.addListener(
      'requestNotificationPermissions',
      this.requestNotificationPermissions.bind(this)
    )
  }

  componentDidMount() {
    // Initialise
    const { wallet } = this.props

    // Add an event listener to log registration errors in development
    if (__DEV__) {
      PushNotificationIOS.addEventListener('registrationError', error =>
        console.log(error)
      )
    }

    PushNotification.configure({
      // Called when Token is generated (iOS and Android) (optional)
      onRegister: function(deviceToken) {
        if (wallet.activeAccount && wallet.activeAccount.address) {
          // Save the device token into redux for later use with other accounts
          this.props.setDeviceToken(deviceToken['token'])
          // Make sure the device token is registered with the server
          this.registerDeviceToken()
        }
      }.bind(this),
      // Called when a remote or local notification is opened or received
      onNotification: function(notification) {
        this.onNotification(notification)
        // https://facebook.github.io/react-native/docs/pushnotificationios.html
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData)
        }
      }.bind(this),
      // Android only
      senderID: process.env.GCM_SENDER_ID || '1234567',
      // iOS only
      permissions: DEFAULT_NOTIFICATION_PERMISSIONS,
      // Should the initial notification be popped automatically
      popInitialNotification: true,
      requestPermissions: Platform.OS !== 'ios'
    })
  }

  /* Handles a notification by displaying an alert and saving it to redux
   */
  onNotification(notification) {
    Alert.alert(notification.title, notification.message)
    this.props.addNotification(notification)
  }

  /* Register the Ethereum address and device token for notifications with the
   * notification server
   */
  async registerDevice() {
    const permissions =
      Platform.OS === 'ios'
        ? await PushNotificationIOS.requestPermissions()
        : DEFAULT_NOTIFICATION_PERMISSIONS

    const activeAddress = this.props.wallet.activeAccount.address
    const deviceToken = this.props.settings.deviceToken
    if (!activeAddress) {
      console.debug('No active address')
      return
    }
    if (!deviceToken) {
      console.debug('No device token')
      return
    }

    const notificationType = this.getNotificationType()
    const notificationServer =
      graphqlContext.config.notifications ||
      'https://notifications.originprotocol.com'
    const notificationRegisterEndpoint = `${notificationServer}/mobile/register`
    return fetch(notificationRegisterEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eth_address: activeAddress,
        device_token: deviceToken,
        device_type: notificationType,
        permissions: permissions
      })
    }).catch(error => {
      console.error(
        'Failed to register notification address with notifications server',
        error
      )
    })
  }

  /* Unregister for notifications for deleted accounts
   */
  async unregisterDevice() {}

  /* Return the notification type that should be used for the platform
   */
  getNotificationType() {
    if (Platform.OS === 'ios') {
      return ETH_NOTIFICATION_TYPES.APN
    } else if (Platform.OS === 'android') {
      return ETH_NOTIFICATION_TYPES.FCM
    }
  }

  /* Request permissions to send push notifications
   */
  async requestNotificationPermissions() {
    console.debug('Requesting notification permissions')
    if (Platform.OS === 'ios') {
      DeviceEventEmitter.emit(
        'notificationPermission',
        await PushNotificationIOS.requestPermissions()
      )
    } else {
      DeviceEventEmitter.emit(
        'notificationPermission',
        DEFAULT_NOTIFICATION_PERMISSIONS
      )
    }
  }

  /* This is a renderless component
   */
  render() {
    return null
  }
}

const mapStateToProps = ({ settings, wallet }) => {
  return { settings, wallet }
}

const mapDispatchToProps = dispatch => ({
  setDeviceToken: payload => dispatch(setDeviceToken(payload)),
  addNotification: notification => dispatch(addNotification(notification))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PushNotifications)
