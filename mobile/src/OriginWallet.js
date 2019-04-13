'cuse strict'

import React, { Component } from 'react'
import { DeviceEventEmitter, Platform, PushNotificationIOS } from 'react-native'
import PushNotification from 'react-native-push-notification'
import Web3 from 'web3'
import { connect } from 'react-redux'
import CryptoJS from 'crypto-js'

import graphqlContext, { setNetwork } from '@origin/graphql/src/contracts'

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
    DeviceEventEmitter.addListener('signMessage', this.signMessage.bind(this))
    DeviceEventEmitter.addListener('getBalances', this.getBalances.bind(this))
    this.web3 = new Web3()
  }

  componentDidMount() {
    this._migrateLegacyAccounts()
    this.initWeb3()
    this.initAccounts()
    this.balancePoller = setInterval(() => this.getBalances(), 5000)
  }

  componentWillUnmount() {
    clearInterval(this.balancePoller)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.settings.network.id !== this.props.settings.network.id) {
      this.initWeb3()
    }
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

  /*
   */
  initWeb3() {
    setNetwork(this.props.settings.network.name.toLowerCase())
    const provider = graphqlContext.config.provider
    console.debug(`Setting provider to ${provider}`)
    this.web3.setProvider(new Web3.providers.HttpProvider(provider, 20000))
  }

  /* Configure web3 using the accounts persisted in redux
   */
  initAccounts() {
    const { wallet } = this.props

    // Clear the web3 wallet to make sure we only have the accounts loaded
    // from tbe data store
    this.web3.eth.accounts.wallet.clear()
    // Load the accounts from the saved redux state into web3
    for (let i = 0; i < wallet.accounts.length; i++) {
      this.web3.eth.accounts.wallet.add(wallet.accounts[i])
    }

    const { length } = wallet.accounts
    console.debug(`Loaded Origin Wallet with ${length} accounts`)
    let hasValidActiveAccount = false
    if (wallet.activeAccount) {
      hasValidActiveAccount = wallet.accounts.find(
        a => a.address === wallet.activeAccount.address
      )
    }

    if (length && !hasValidActiveAccount) {
      // Set the first account active if none are active
      this.props.setAccountActive(wallet.accounts[0])
    }
  }

  /* Create new account
   */
  async createAccount() {
    const wallet = this.web3.eth.accounts.wallet.create(1)
    const account = wallet[wallet.length - 1]
    this.props.addAccount(account)
    this.props.setAccountActive(account)
    return account.address
  }

  /* Add a new account from a private key
   */
  async addAccount(privateKey) {
    if (!privateKey.startsWith('0x') && /^[0-9a-fA-F]+$/.test(privateKey)) {
      privateKey = '0x' + privateKey
    }
    const account = this.web3.eth.accounts.wallet.add(privateKey)
    this.props.addAccount(account)
    this.props.setAccountActive(account)
    return account.address
  }

  /* Remove an account
   */
  async removeAccount(account) {
    const { wallet } = this.props
    const result = this.web3.eth.accounts.wallet.remove(account.address)
    this.props.removeAccount(account)
    if (wallet.activeAccount.address === account.address) {
      // The removed account was an active account, update the active account
      // to the first account found that is not the removed account
      const newActiveAccount =
        wallet.accounts.find(a => a.address !== account.address) || null
      this.props.setAccountActive(newActiveAccount)
    }
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
  async getBalances() {
    const { wallet } = this.props

    if (wallet.accounts.length && wallet.activeAccount) {
      let ethBalance
      try {
        ethBalance = await this.web3.eth.getBalance(
          wallet.activeAccount.address
        )
      } catch (error) {
        console.debug('web3 connection failed')
        return
      }

      const tokenBalances = {}
      if (graphqlContext.config.tokens) {
        for (const token of graphqlContext.config.tokens) {
          const balance = await token.contractExec.methods
            .balanceOf(wallet.activeAccount.address)
            .call()
          // Divide by number of decimals for token
          balance = Number(
            this.web3.utils
              .toBN(balance)
              .div(this.web3.utils.toBN(10 ** token.decimals))
          )
          tokenBalances[token.symbol.toLowerCase()] = balance
        }
      }

      this.props.setAccountBalances({
        address: wallet.activeAccount.address,
        balances: {
          eth: this.web3.utils.fromWei(ethBalance),
          ...tokenBalances
        }
      })
    }
  }

  /*
   */
  async signTransaction(transaction) {
    const { wallet } = this.props
    if (transaction.from !== wallet.activeAccount.address.toLowerCase()) {
      console.error('Account mismatch')
      return null
    }
    const signedTransaction = await this.web3.eth.accounts.signTransaction(
      transaction,
      wallet.activeAccount.privateKey
    )
    DeviceEventEmitter.emit('transactionSigned', {
      transaction,
      signedTransaction
    })
    return signedTransaction
  }

  async signMessage(data) {
    const { wallet } = this.props
    if (data.from !== wallet.activeAccount.address.toLowerCase()) {
      console.error('Account mismatch')
      return null
    }
    const signedMessage = await this.web3.eth.accounts.sign(
      data.data,
      wallet.activeAccount.privateKey
    )
    DeviceEventEmitter.emit('messageSigned', {
      data,
      signedMessage
    })
  }

  async sendTransaction(transaction) {
    this.web3.eth
      .sendTransaction(transaction)
      .on('transactionHash', hash => {
        console.debug('Transaction hash: ', hash)
        DeviceEventEmitter.emit('transactionHash', { transaction, hash })
      })
      .on('receipt', receipt => {
        console.debug('Transaction receipt: ', receipt)
        DeviceEventEmitter.emit('transactionReceipt', { transaction, receipt })
      })
      .on('error', (error, receipt) => {
        console.error(error, receipt)
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
      return ETH_NOTIFICATION_TYPES.APN
    } else if (Platform.OS === 'android') {
      return ETH_NOTIFICATION_TYPES.FCM
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

const mapStateToProps = ({ activation, settings, wallet }) => {
  return { activation, settings, wallet }
}

const mapDispatchToProps = dispatch => ({
  addAccount: account => dispatch(addAccount(account)),
  removeAccount: account => dispatch(removeAccount(account)),
  setAccountName: payload => dispatch(setAccountName(payload)),
  setAccountActive: payload => dispatch(setAccountActive(payload)),
  setAccountBalances: payload => dispatch(setAccountBalances(payload)),
  updateNotificationsPermissions: permissions =>
    dispatch(updateNotificationsPermissions(permissions))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OriginWallet)
