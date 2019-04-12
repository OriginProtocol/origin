'cuse strict'

import React, { Component } from 'react'
import { DeviceEventEmitter, Platform, PushNotificationIOS } from 'react-native'
import PushNotification from 'react-native-push-notification'
import Web3 from 'web3'
import { connect } from 'react-redux'
import CryptoJS from 'crypto-js'

import graphqlContext from '@origin/graphql/src/contracts'

import {
  DEFAULT_NOTIFICATION_PERMISSIONS,
  ETH_NOTIFICATION_TYPES
} from './constants'
import {
  addAccount,
  removeAccount,
  setAccountActive,
  setAccountBalances,
  setAccountName
} from 'actions/Wallet'
import { updateNotificationsPermissions } from 'actions/Activation'
import { loadData, deleteData } from './tools'

// Environment variables
import { GCM_SENDER_ID } from 'react-native-dotenv'

const web3 = new Web3()

class OriginWallet extends Component {
  constructor() {
    super()
    DeviceEventEmitter.addListener('addAccount', this.addAccount.bind(this))
    DeviceEventEmitter.addListener(
      'createAccount',
      this.createAccount.bind(this)
    )
    DeviceEventEmitter.addListener(
      'setAccountName',
      this.setAccountName.bind(this)
    )
    DeviceEventEmitter.addListener(
      'setAccountActive',
      this.setAccountActive.bind(this)
    )
    DeviceEventEmitter.addListener(
      'removeAccount',
      this.removeAccount.bind(this)
    )
    DeviceEventEmitter.addListener(
      'signTransaction',
      this.signTransaction.bind(this)
    )
    DeviceEventEmitter.addListener(
      'sendTransaction',
      this.sendTransaction.bind(this)
    )
    DeviceEventEmitter.addListener(
      'getBalances',
      this.getBalances.bind(this)
    )
  }

  componentDidMount() {
    this._migrateLegacyAccounts()
    this.initAccounts()
    this.balancePoller = setInterval(() => this.getBalances(), 5000)
  }

  componentWillUnmount() {
    clearInterval(this.balancePoller)
  }

  async getBalances() {
    const account = this.props.wallet.accounts[0]
    const ethBalance = await web3.eth.getBalance(account.address)

    let tokenBalances = {}
    if (graphqlContext.config.tokens) {
      for (token of graphqlContext.config.tokens) {
        const tokenContract = graphqlContext.tokens.find(t => t.symbol === token.id)
        if (tokenContract) {
          const balance = await tokenContract.methods.balanceOf(account.address).call()
          tokenBalances[t.symbol] = balance
        }
      }
    }

    this.props.setAccountBalances({
      address: account.address,
      balances: {
        eth: web3.utils.fromWei(ethBalance),
        ...tokenBalances
      }
    })
  }

  /* Move accounts from the old data store into the new redux store
   */
  async _migrateLegacyAccounts() {
    loadData('WALLET_STORE').then(async walletData => {
      if (walletData) {
        for (let i = 0; i < walletData.length; i++) {
          const data = walletData[i]
          if (data.crypt == 'aes' && data.enc) {
            const privateKey = CryptoJS.AES.decrypt(
              data.enc,
              'WALLET_PASSWORD'
            ).toString(CryptoJS.enc.Utf8)
            if (privateKey) {
              this.addAccount(privateKey)
            }
          }
        }
        await deleteData('WALLET_STORE')
      }
    })
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
    const provider = graphqlContext.config.provider
    console.debug(`Setting provider to ${provider}`)
    web3.setProvider(new Web3.providers.HttpProvider(provider, 20000))
  }

  /* Create new account
   */
  async createAccount() {
    const wallet = web3.eth.accounts.wallet.create(1)
    const account = wallet[wallet.length - 1]
    this.props.addAccount(account)
    return account.address
  }

  /* Add a new account from a private key
   */
  async addAccount(privateKey) {
    if (!privateKey.startsWith('0x') && /^[0-9a-fA-F]+$/.test(privateKey)) {
      privateKey = '0x' + privateKey
    }
    const account = web3.eth.accounts.wallet.add(privateKey)
    this.props.addAccount(account)
    return account.address
  }

  /* Remove an account
   */
  async removeAccount(account) {
    const result = web3.eth.accounts.wallet.remove(account)
    this.props.removeAccount(account)
    return result
  }

  /* Record a name for an address in the account mapping
   */
  async setAccountName(name, address) {
    this.props.setAccountName(name, address)
  }

  /*
   */
  async setAccountActive(account) {
    this.props.setAccountActive(account)
  }

  /*
   */
  async signTransaction(transaction) {
    const account = this.props.wallet.accounts[0]
    if (transaction.from !== account.address.toLowerCase()) {
      console.error('Account mismatch')
      return null
    }
    const signedTransaction = await web3.eth.accounts.signTransaction(
      transaction,
      account.privateKey
    )
    DeviceEventEmitter.emit('transactionSigned', { transaction, signedTransaction })
    return signedTransaction
  }

  async sendTransaction(transaction) {
    console.log('Sending transaction: ', transaction)
    web3.eth.sendTransaction(transaction).on('transactionHash', (hash) => {
      DeviceEventEmitter.emit('transactionHash', { transaction, hash })
    }).on('receipt', (receipt) => {
      DeviceEventEmitter.emit('transactionReceipt', { transaction, receipt })
    }).on('error', (error, receipt) => {
      console.error(error)
    })
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
  addAccount: account => dispatch(addAccount(account)),
  removeAccount: account => dispatch(removeAccount(account)),
  setAccountName: payload => dispatch(setAccountName(payload)),
  setAccountActive: payload => dispatch(setAccountActive(payload)),
  setAccountBalances: payload => dispatch(setAccountBalances(payload)),
  updateAccounts: accounts => dispatch(updateAccounts(accounts)),
  updateNotificationsPermissions: permissions =>
    dispatch(updateNotificationsPermissions(permissions))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OriginWallet)
