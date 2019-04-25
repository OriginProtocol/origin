'use strict'

/* This is a React component that provides web3 account function such as account
 * storage, transaction processing and message signing. It also deals with
 * requests and storage of notification permissions.
 *
 * It uses DeviceEventEmitter to communicate with other React components in the
 * wallet app. This is something of an anti-pattern and should probably be
 * refactored to use a HOC or the React context API. It is this way for legacy
 * reasons. Using events in this way is awkward due to other components needing
 * to also listen to events to get return values.
 */

import { Component } from 'react'
import { DeviceEventEmitter, Platform, PushNotificationIOS } from 'react-native'
import PushNotification from 'react-native-push-notification'
import Web3 from 'web3'
import { connect } from 'react-redux'
import CryptoJS from 'crypto-js'

import graphqlContext, {
  setNetwork as setGraphqlNetwork
} from '@origin/graphql/src/contracts'

import { addNotification } from 'actions/Notification'
import { setDeviceToken, setNetwork } from 'actions/Settings'
import {
  addAccount,
  removeAccount,
  setAccountActive,
  setAccountBalances,
  setAccountName,
  setMessagingKeys
} from 'actions/Wallet'
import {
  BALANCE_POLL_INTERVAL,
  DEFAULT_NOTIFICATION_PERMISSIONS,
  ETH_NOTIFICATION_TYPES,
  NETWORKS,
  PROMPT_MESSAGE,
  PROMPT_PUB_KEY
} from './constants'
import { loadData, deleteData } from './tools'

class OriginWallet extends Component {
  constructor(props) {
    super(props)

    this.web3 = new Web3()

    DeviceEventEmitter.addListener('addAccount', this.addAccount.bind(this))
    DeviceEventEmitter.addListener(
      'createAccount',
      this.createAccount.bind(this)
    )
    DeviceEventEmitter.addListener(
      'setAccountName',
      this.props.setAccountName.bind(this)
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
    DeviceEventEmitter.addListener(
      'requestNotificationPermissions',
      this.requestNotificationPermissions.bind(this)
    )
  }

  async componentDidMount() {
    this._migrateLegacyAccounts()
    this.initWeb3()
    this.initAccounts()
    this.initNotifications()
    this.balancePoller = setInterval(
      () => this.getBalances(),
      BALANCE_POLL_INTERVAL
    )
  }

  componentWillUnmount() {
    clearInterval(this.balancePoller)
  }

  componentDidUpdate(prevProps) {
    // Reinit web3 if the network we are using changes, this will cause a change
    // of provider to match
    if (prevProps.settings.network.name !== this.props.settings.network.name) {
      this.initWeb3()
      this.updateBalancesNow()
    }
  }

  /* Update balances now annd restart the balance poller in BALANCE_POLL_INTERVAL
   */
  updateBalancesNow() {
    clearInterval(this.balancePoller)
    this.getBalances()
    // Restart poller
    this.balancePoller = setInterval(
      () => this.getBalances(),
      BALANCE_POLL_INTERVAL
    )
  }

  /* Move accounts from the old method of storing them into the new redux store
   */
  async _migrateLegacyAccounts() {
    loadData('WALLET_STORE').then(async walletData => {
      if (walletData) {
        for (let i = 0; i < walletData.length; i++) {
          const data = walletData[i]
          if (data.crypt == 'aes' && data.enc) {
            let privateKey
            try {
              privateKey = CryptoJS.AES.decrypt(
                data.enc,
                'WALLET_PASSWORD'
              ).toString(CryptoJS.enc.Utf8)
            } catch (error) {
              console.warn('Failed to decrypt private key, malformed UTF-8?')
              // Try without UTF-8
              privateKey = CryptoJS.AES.decrypt(
                data.enc,
                'WALLET_PASSWORD'
              ).toString()
            }
            if (privateKey) {
              this.addAccount(privateKey)
              console.debug('Migrated legacy account')
            }
          }
        }
      }
    })
  }

  async _migrateLegacyDeviceTokens() {
    loadData('WALLET_INFO').then(async walletInfo => {
      if (walletInfo && walletInfo.deviceToken) {
        this.props.setDeviceToken(walletInfo.deviceToken)
        console.debug('Migrated legacy device token')
      }
    })
  }

  /* Set the provider for web3 to the provider for the current network in the
   * graphql configuration for the current network
   */
  initWeb3() {
    // Verify that the saved network is valid
    const networkExists = NETWORKS.find(
      n => n.name === this.props.settings.network.name
    )
    if (!networkExists) {
      // Set to mainnet if for some reason the network doesn't exist
      this.props.setNetwork(NETWORKS.find(n => n.id === 1))
    }
    setGraphqlNetwork(this.props.settings.network.name.toLowerCase())
    const provider = graphqlContext.config.provider
    console.debug(`Setting provider to ${provider}`)
    this.web3.setProvider(new Web3.providers.HttpProvider(provider, 20000))
  }

  /* Configure web3 using the accounts persisted in redux
   */
  initAccounts() {
    const { wallet, settings } = this.props
    // Clear the web3 wallet to make sure we only have the accounts loaded
    // from the data store
    this.web3.eth.accounts.wallet.clear()
    // Load the accounts from the saved redux state into web3
    for (let i = 0; i < wallet.accounts.length; i++) {
      this.web3.eth.accounts.wallet.add(wallet.accounts[i])
    }
    const { length } = wallet.accounts
    console.debug(`Loaded Origin Wallet with ${length} accounts`)
    // Verify there is a valid active account, and if not set one
    let hasValidActiveAccount = false
    if (wallet.activeAccount) {
      hasValidActiveAccount = wallet.accounts.find(
        a => a.address === wallet.activeAccount.address
      )
    }

    // Setup the active account
    if (length) {
      const activeAccount = hasValidActiveAccount ? wallet.activeAccount : wallet.accounts[0]
      this.setAccountActive(activeAccount)
    }
  }

  /* Generate the signatures required for activating messaging
   */
  async generateMessagingKeys() {
    const { wallet } = this.props
    // Check if messaging keys need updaitng
    if (
      !wallet.messagingKeys ||
      wallet.messagingKeys.address !== wallet.activeAccount.address
    ) {
      // Messaging keys address is different to the active account address,
      // update messaging keys
      const privateKey = wallet.activeAccount.privateKey
      if (!privateKey.startsWith('0x') && /^[0-9a-fA-F]+$/.test(privateKey)) {
        privateKey = '0x' + privateKey
      }
      const signatureKey = await this.web3.eth.accounts
        .sign(PROMPT_MESSAGE, privateKey)
        .signature.substring(0, 66)
      const msgAccount = this.web3.eth.accounts.privateKeyToAccount(
        signatureKey
      )
      const pubMessage = PROMPT_PUB_KEY + msgAccount.address
      const pubSignature = await this.web3.eth.accounts.sign(
        pubMessage,
        privateKey
      ).signature
      const messagingKeys = {
        address: wallet.activeAccount.address,
        signatureKey,
        pubMessage,
        pubSignature
      }
      this.props.setMessagingKeys(messagingKeys)
      DeviceEventEmitter.emit('messagingKeys', messagingKeys)
    }
  }

  /* Create new account
   */
  async createAccount() {
    const wallet = this.web3.eth.accounts.wallet.create(1)
    const account = wallet[wallet.length - 1]
    this.props.addAccount(account)
    this.setAccountActive(account)
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
    this.setAccountActive(account)
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
      this.setAccountActive(newActiveAccount)
    }
    return result
  }

  /* Set the account that should be used for web3 interactions and ensure it is
   * configured for messaging and notifications
   */
  async setAccountActive(account) {
    await this.props.setAccountActive(account)
    // Make sure device token is registered with server for this eth address
    this.registerDeviceToken()
    // Generate messaging keys
    this.generateMessagingKeys()
  }

  /* Get ETH balances and balances of all tokens configured in the graphql
   * configuration for the currently set network
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
          let balance = await token.contractExec.methods
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
        eth: this.web3.utils.fromWei(ethBalance),
        ...tokenBalances
      })
    }
  }

  /* Sign a transaction using web3
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

  /* Sign a message using web3
   */
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

  /* Send a transaction using web3
   */
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
    const { wallet } = this.props
    PushNotification.configure({
      // Called when Token is generated (iOS and Android) (optional)
      onRegister: function(deviceToken) {
        if (wallet.activeAccount && wallet.activeAccount.address) {
          this.registerDeviceToken(deviceToken['token'])
          // Save the device token into redux for later use with other accounts
          this.props.setDeviceToken(deviceToken['token'])
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
      senderID: process.env.GCM_SENDER_ID,
      // iOS only
      permissions: DEFAULT_NOTIFICATION_PERMISSIONS,
      // Should the initial notification be popped automatically
      popInitialNotification: true,
      requestPermissions: Platform.OS !== 'ios'
    })
  }

  /*
   */
  onNotification(notification) {
    this.props.addNotification({
      id: notification.data.notificationId,
      message: notification.message.body,
      url: notification.data.url
    })
  }

  /* Register the Ethereum address and device token for notifications with the
   * notification server
   */
  registerDeviceToken(deviceToken) {
    const activeAddress = this.props.wallet.activeAccount.address
    if (!activeAddress) {
      return
    }
    const notificationType = this.getNotificationType()
    return fetch(
      process.env.NOTIFICATION_REGISTER_ENDPOINT ||
        'https://notifications.originprotocol.com/mobile/register',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activeAddress, deviceToken, notificationType })
      }
    ).catch(error => {
      console.debug(
        'Failed to register notification address with notifications server',
        error
      )
      // Don't hard fail because this maybe deployed in advance of the
      // notificationn server being completed
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
  addAccount: account => dispatch(addAccount(account)),
  removeAccount: account => dispatch(removeAccount(account)),
  setAccountName: payload => dispatch(setAccountName(payload)),
  setAccountActive: payload => dispatch(setAccountActive(payload)),
  setAccountBalances: balances => dispatch(setAccountBalances(balances)),
  setAccountServerNotifications: payload =>
    dispatch(setAccountServerNotifications(payload)),
  setMessagingKeys: payload => dispatch(setMessagingKeys(payload)),
  setDeviceToken: payload => dispatch(setDeviceToken(payload)),
  setNetwork: network => dispatch(setNetwork(network)),
  addNotification: notification => dispatch(addNotification(notification))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OriginWallet)
