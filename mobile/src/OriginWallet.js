'use strict'

import React, { Component } from 'react'
import { DeviceEventEmitter, Platform, PushNotificationIOS } from 'react-native'
import PushNotification from 'react-native-push-notification'
import Web3 from 'web3'
import { connect } from 'react-redux'

import { DEFAULT_NOTIFICATION_PERMISSIONS, ETH_NOTIFICATION_TYPES } from './constants'
import { init, addAccount, updateAccounts } from 'actions/Wallet'
import { updateNotificationsPermissions } from 'actions/Activation'

// Environment variables
import { GCM_SENDER_ID, PROVIDER_URL } from 'react-native-dotenv'

const web3 = new Web3()

class OriginWallet extends Component {
  constructor() {
    super()
    DeviceEventEmitter.addListener('addAccount', this.addAccount.bind(this))
    DeviceEventEmitter.addListener(
      'createAccount',
      this.createAccount.bind(this)
    )
    DeviceEventEmitter.addListener('nameAccount', this.nameAccount.bind(this))
    DeviceEventEmitter.addListener(
      'removeAccount',
      this.removeAccount.bind(this)
    )
  }

  componentDidMount() {
    this.initAccounts()
  }

  /* Configure web3 using the accounts persisted in redux
   */
  initAccounts() {
    // Clear the web3 wallet to make sure we only have the accounts loaded
    // from tbe data store
    web3.eth.accounts.wallet.clear()
    // Load the accounts from the saved redux state into web3
    for (let i = 0; i < this.props.wallet.accounts.length; i++) {
      web3.eth.accounts.wallet.add(this.props.wallet.accounts[i])
    }

    const { length } = this.props.wallet.accounts
    console.debug(`Loaded Origin Wallet with ${length} accounts`)

    if (this.props.wallet.accounts.length) {
      // Set the active address to either the one that is flagged as
      // active or as the first address
      web3.eth.defaultAccount = this.props.wallet.accounts[0].address
    }

    console.debug(`Setting provider to ${PROVIDER_URL}`)
    web3.setProvider(new Web3.providers.HttpProvider(PROVIDER_URL, 20000))
  }

  /* Create new account
   */
  async createAccount() {
    const wallet = web3.eth.accounts.wallet.create(1)
    const account = wallet[wallet.length - 1]
    web3.eth.defaultAccount = account.address
    this.props.addAccount(account)
    return account.address
  }

  /* Add a new account from a private key
   */
  async addAccount(privateKey) {}

  /* Remove an account
   */
  async removeAccount(account) {
    const result = web3.eth.accounts.wallet.remove(account)
    if (result) {
      this.props.removeAccount(account)
    }
    return result
  }

  /* Record a name for an address in the account mapping
   */
  async nameAccount(name, address) {
    console.log('Name account')
  }

  /* Configure push notifications
   */
  initNotifications() {
    PushNotification.configure({
      // Called when Token is generated (iOS and Android) (optional)
      onRegister: function(deviceToken) {
        this.onNotificationRegistered(
          deviceToken['token'],
          this.getNotifyType()
        )
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
      senderID: GCM_SENDER_ID,

      // iOS only
      permissions: DEFAULT_NOTIFICATION_PERMISSIONS,

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      requestPermissions: Platform.OS !== 'ios'
    })
  }

  /* Return the notification type that should be used for the platform
   */
  getNotificationType() {
    if (Platform.OS === 'ios') {
      return EthNotificationTypes.APN
    } else if (Platform.OS === 'android') {
      return EthNotificationTypes.FCM
    }
  }

  /* Request permissions to send push notifications
   */
  requestNotifications() {
    if (Platform.OS === 'ios') {
      return PushNotificationIOS.requestPermissions()
    } else {
      // Function callers expect a Promise
      return new Promise(resolve => {
        resolve(DEFAULT_NOTIFICATION_PERMISSIONS)
      })
    }
  }

  /* This is a renderless component
   */
  render() {
    return null
  }
}

const mapStateToProps = ({ activation, wallet }) => {
  return { activation, wallet }
}

const mapDispatchToProps = dispatch => ({
  initWallet: address => dispatch(init(address)),
  addAccount: account => dispatch(addAccount(account)),
  removeAccount: account => dispatch(removeAccount(account)),
  updateAccounts: accounts => dispatch(updateAccounts(accounts)),
  updateNotificationsPermissions: permissions =>
    dispatch(updateNotificationsPermissions(permissions))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OriginWallet)
