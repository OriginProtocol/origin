'use strict'

import { Component } from 'react'
import {
  Alert,
  AppState,
  DeviceEventEmitter,
  Platform,
  PushNotificationIOS
} from 'react-native'
import PushNotification from 'react-native-push-notification'
import { connect } from 'react-redux'

import Configs from '@origin/graphql/src/configs'

import { addNotification } from 'actions/Notification'
import { setDeviceToken } from 'actions/Settings'
import {
  DEFAULT_NOTIFICATION_PERMISSIONS,
  ETH_NOTIFICATION_TYPES
} from './constants'
import { get } from 'utils'
import NavigationService from './NavigationService'

class PushNotifications extends Component {
  constructor(props) {
    super(props)

    this.state = {
      backgroundNotification: null
    }

    DeviceEventEmitter.addListener(
      'requestNotificationPermissions',
      this.requestNotificationPermissions.bind(this)
    )

    DeviceEventEmitter.addListener('removeAccount', this.unregister.bind(this))
  }

  componentDidMount() {
    // Initialise push notifications
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
        // Save the device token into redux for later use with other accounts
        this.props.setDeviceToken(deviceToken['token'])
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

    // Get notifications that triggered an open of the app when the app was
    // completely closed
    PushNotificationIOS.getInitialNotification().then(notification => {
      if (notification) {
        // TODO redirect user to relevant page in marketplace
        console.log(notification)
      }
    })

    // Get notifications that were triggered when the app was backgrounded
    PushNotificationIOS.addEventListener('notification', notification => {
      if (AppState.currentState === 'background') {
        // Save notification to state so it can be dealt with when the user
        // foregrounds the app
        this.setState({ backgroundNotification: notification })
      }
    })

    AppState.addEventListener('change', newState => {
      if (newState === 'active' && this.state.backgroundNotification !== null) {
        // TODO redirect user to relevant page in marketplace
        this.setState({ backgroundNotification: null })
      }
    })

    // Make sure current active account is registered on mount
    this.register()
  }

  componentWillUnmount() {
    AppState.removeEventListener('change')
  }

  componentDidUpdate(prevProps) {
    // The following circumstances need to trigger the register function to
    // save the device token and Ethereum address of the active account to
    // the notifications server:
    //  - Change of active account
    //  - Change of device token
    //  - Change of network (due to different notifications server)

    const registerConditions = [
      // Change of active account
      get(prevProps.wallet.activeAccount, 'address') !==
        get(this.props.wallet.activeAccount, 'address'),
      // Change of device token
      get(prevProps.settings, 'deviceToken') !==
        get(this.props.settings, 'deviceToken')
      // Change of network
      /* TODO: Fix register call before server changes
      get(prevProps.settings.network, 'name') !==
        get(this.props.settings.network, 'name')
      */
    ]

    // Trigger a register query to notifications server if any of the above
    // conditions are true
    if (registerConditions.includes(true)) {
      this.register()
    }
  }

  /* Handles a notification by displaying an alert and saving it to redux
   */
  onNotification(notification) {
    // Popup notification in an alert
    Alert.alert(notification.alert.title, notification.alert.body, [
      { text: 'Close' },
      {
        text: 'View',
        onPress: () => {
          NavigationService.navigate('Marketplace', {
            marketplaceUrl: notification.data.url
          })
        }
      }
    ])
    // Save notification to redux in case we want to display them later
    this.props.addNotification(notification)
  }

  /* Register the Ethereum address and device token for notifications with the
   * notification server
   */
  async register() {
    let activeAddress
    if (
      this.props.wallet.activeAccount &&
      this.props.wallet.activeAccount.address
    ) {
      activeAddress = this.props.wallet.activeAccount.address
    }

    const deviceToken = this.props.settings.deviceToken

    if (!activeAddress) {
      console.debug('No active address')
      return
    }

    if (!deviceToken) {
      console.debug('No device token')
      return
    }

    console.debug(
      `Registering ${activeAddress} and device token ${deviceToken}`
    )

    const permissions =
      Platform.OS === 'ios'
        ? await PushNotificationIOS.requestPermissions()
        : DEFAULT_NOTIFICATION_PERMISSIONS

    const notificationType = this.getNotificationType()
    return fetch(this.getNotificationServerUrl(), {
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
      console.warn(
        'Failed to register notification address with notifications server',
        error
      )
    })
  }

  /* Unregister for notifications for deleted accounts
   */
  async unregister(account) {
    const deviceToken = this.props.settings.deviceToken

    if (!deviceToken) {
      console.debug('No device token')
      return
    }

    console.debug(
      `Unregistering ${account.address} and device token ${deviceToken}`
    )

    return fetch(this.getNotificationServerUrl(), {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eth_address: account.address,
        device_token: deviceToken
      })
    }).catch(error => {
      console.warn(
        'Failed to unregister notification address with notifications server',
        error
      )
    })
  }

  getNotificationServerUrl() {
    const config = Configs[this.props.settings.network.name.toLowerCase()]
    const notificationServer =
      config.notifications || 'https://notifications.originprotocol.com'
    return `${notificationServer}/mobile/register`
  }

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
