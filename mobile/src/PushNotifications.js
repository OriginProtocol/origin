'use strict'

import { Component } from 'react'
import { Alert, AppState, Platform } from 'react-native'
import PushNotification from 'react-native-push-notification'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import * as Sentry from '@sentry/react-native'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { ethers } from 'ethers'
import stringify from 'json-stable-stringify'

import { addNotification } from 'actions/Notification'
import { setDeviceToken, setNetwork } from 'actions/Settings'
import {
  DEFAULT_NOTIFICATION_PERMISSIONS,
  ETH_NOTIFICATION_TYPES,
  NETWORKS,
  AUTH_MESSAGE
} from './constants'
import NavigationService from './NavigationService'
import withConfig from 'hoc/withConfig'

import AuthClient from '@origin/auth-client/src/auth-client'

import RNSamsungBKS from 'react-native-samsung-bks'

class PushNotifications extends Component {
  constructor(props) {
    super(props)
    this.state = {
      backgroundNotification: null
    }
  }

  async componentDidMount() {
    // Add an event listener to log registration errors in development
    if (__DEV__) {
      PushNotificationIOS.addEventListener('registrationError', error =>
        console.warn(error)
      )
    }

    PushNotification.configure({
      // Called when Token is generated (iOS and Android) (optional)
      onRegister: deviceToken => {
        // Save the device token into redux for later use with other accounts
        this.props.setDeviceToken(deviceToken['token'])
      },
      // Called when a remote or local notification is opened or received
      onNotification: notification => {
        this.onNotification(notification)
        // https://facebook.github.io/react-native/docs/pushnotificationios.html
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData)
        }
      },
      // Android only
      senderID: '162663374736',
      // iOS only
      permissions: DEFAULT_NOTIFICATION_PERMISSIONS,
      // Should the initial notification be popped automatically
      popInitialNotification: true,
      requestPermissions: Platform.OS !== 'ios'
    })

    if (Platform.os === 'ios') {
      // Get notifications that triggered an open of the app when the app was
      // completely closed
      PushNotificationIOS.getInitialNotification().then(notification => {
        if (notification) {
          // backgroundNotification is an instance of PushNotificationIOS, create
          // a notification object from it
          const notificationObj = {
            alert: this.state.backgroundNotification.getAlert(),
            data: this.state.backgroundNotification.getData()
          }
          // Pop the alert with option to redirect to WebView
          this.onNotification(notificationObj)
        }
      })

      // Get notifications that were triggered when the app was backgrounded
      PushNotificationIOS.addEventListener('notification', notification => {
        if (AppState.currentState === 'background') {
          // Save notification to state so it can be dealt with when the user
          // foregrounds the app
          console.debug('Setting background notification')
          this.setState({ backgroundNotification: notification })
        }
      })

      AppState.addEventListener('change', newState => {
        if (
          newState === 'active' &&
          this.state.backgroundNotification !== null
        ) {
          // backgroundNotification is an instance of PushNotificationIOS, create
          // a notification object from it
          const notification = {
            alert: this.state.backgroundNotification.getAlert(),
            data: this.state.backgroundNotification.getData()
          }
          // Pop the alert with option to redirect to WebView
          this.onNotification(notification)
          this.setState({ backgroundNotification: null })
        }
      })
    }

    // Make sure current active account is registered on mount
    await this.register()
  }

  componentWillUnmount() {
    AppState.removeEventListener('change')
  }

  async componentDidUpdate(prevProps) {
    // The following circumstances need to trigger the register function to
    // save the device token and Ethereum address of the active account to
    // the notifications server:
    //  - Change of active account
    //  - Change of device token
    //  - Change of network (due to different notifications server)

    const shouldRegister = [
      // Change of active account
      get(prevProps, 'wallet.activeAccount.address') !==
        get(this.props, 'wallet.activeAccount.address'),
      // Change of device token
      get(prevProps.settings, 'deviceToken') !==
        get(this.props.settings, 'deviceToken'),
      // Change of network
      get(prevProps.config, 'notifications') !==
        get(this.props.config, 'notifications')
    ].some(constraint => constraint)

    // Trigger a register query to notifications server if any of the above
    // conditions are true
    if (shouldRegister) {
      console.debug('Registering with notifications server')
      await this.register()
    }

    // Unregister deleted accounts
    prevProps.wallet.accounts.forEach(oldAccount => {
      const stillExists = this.props.wallet.accounts.find(
        a => a.address === oldAccount.address
      )
      if (!stillExists) {
        this.unregister(oldAccount)
      }
    })
  }

  /* Handles a notification by displaying an alert and saving it to redux
   */
  onNotification(notification) {
    console.debug('Handling notification: ', notification)

    const notificationObj = {}
    if (Platform.OS === 'ios') {
      notificationObj.title = notification.alert.title
      notificationObj.body = notification.alert.body
      notificationObj.url = notification.data.url
    } else {
      notificationObj.title = notification.title
      notificationObj.body = notification.message
      notificationObj.url = notification.url
    }

    // Popup notification in an alert
    if (notificationObj.title && notificationObj.body) {
      Alert.alert(notificationObj.title, notificationObj.body, [
        { text: 'Close' },
        {
          text: 'View',
          onPress: () => {
            // Check that we are on the right network
            const url = new URL(notificationObj.url)
            // Find network, default to Docker if network could not be found
            let network = NETWORKS.find(n => {
              return n.dappUrl === url.origin
            })
            if (!network) {
              network = NETWORKS.find(n => {
                return n.name === 'Mainnet'
              })
            }
            if (
              get(this.props.settings, 'network.name') !== get(network, 'name')
            ) {
              console.debug('Change network for notification to: ', network)
              this.props.setNetwork(network)
            }
            NavigationService.navigate('Marketplace', {
              marketplaceUrl: notificationObj.url
            })
          }
        }
      ])
    } else if (notificationObj.url) {
      // FCM notification received may only have the URL
      NavigationService.navigate('Marketplace', {
        marketplaceUrl: notificationObj.url
      })
    }
    // Save notification to redux in case we want to display them later
    this.props.addNotification(notificationObj)
  }

  /* Register the Ethereum address and device token for notifications with the
   * notification server
   */
  async register() {
    const activeAddress = get(this.props, 'wallet.activeAccount.address')
    if (!activeAddress) {
      console.debug(
        'Could not register with notifications server, no active address'
      )
      return
    }

    console.debug(`Adding ${activeAddress} to mobile registry`)

    PushNotification.checkPermissions(async permissions => {
      const data = {
        eth_address: activeAddress,
        device_type: this.getNotificationType(),
        permissions: permissions
      }

      if (this.props.settings.deviceToken) {
        data['device_token'] = this.props.settings.deviceToken
      }

      fetch(this.getNotificationServerUrl(), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      }).catch(error => {
        Sentry.captureException(error)
        console.warn(
          'Failed to register notification address with notifications server',
          error
        )
      })
    })
  }

  /* Unregister for notifications for deleted accounts
   */
  async unregister(account) {
    console.debug(`Removing ${account.address} from mobile registry`)

    const data = {
      eth_address: account.address
    }

    if (this.props.settings.deviceToken) {
      data['device_token'] = this.props.settings.deviceToken
    }

    return fetch(this.getNotificationServerUrl(), {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await this.getAuthToken()}`
      },
      body: JSON.stringify(data)
    }).catch(error => {
      console.warn(
        'Failed to unregister notification address with notifications server',
        error
      )
    })
  }

  getNotificationServerUrl() {
    const notificationServer =
      this.props.config.notifications ||
      'https://notifications.originprotocol.com'
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

  /**
   * Generates and returns an auth token
   */
  async getAuthToken() {
    const { wallet } = this.props

    // No active account, can't proceed
    if (!wallet || !wallet.activeAccount) {
      console.debug('Cannot generate auth token, no active account')
      return
    }

    const message = AUTH_MESSAGE
    const payload = {
      message,
      timestamp: Date.now()
    }

    let signature

    // No private key (Samsung BKS account), can't proceed
    if (wallet.activeAccount.hdPath) {
      const messageToSign = Buffer.from(payload).toString('base64')
      signature = await RNSamsungBKS.signEthPersonalMessage(
        wallet.activeAccount.hdPath,
        messageToSign
      )
    } else {
      const { privateKey, mnemonic } = wallet.activeAccount

      let ethersWallet
      if (privateKey) {
        ethersWallet = new ethers.Wallet(privateKey)
      } else {
        ethersWallet = new ethers.Wallet.fromMnemonic(mnemonic)
      }

      signature = await ethersWallet.signMessage(stringify(payload))
    }

    const authClient = new AuthClient({
      authServer:
        this.props.config.authServer || 'https://auth.originprotocol.com',
      disablePersistence: true
    })

    try {
      const tokenData = await authClient.getTokenWithSignature(
        wallet.activeAccount.address,
        signature,
        payload
      )

      return tokenData.authToken
    } catch (error) {
      Sentry.captureException(error)
      console.warn('Failed to generate auth token', error)
    }
    return null
  }

  render() {
    return null
  }
}

const mapStateToProps = ({ settings, wallet }) => {
  return { settings, wallet }
}

const mapDispatchToProps = dispatch => ({
  setNetwork: network => dispatch(setNetwork(network)),
  setDeviceToken: payload => dispatch(setDeviceToken(payload)),
  addNotification: notification => dispatch(addNotification(notification))
})

export default withConfig(
  connect(mapStateToProps, mapDispatchToProps)(PushNotifications)
)
