import { Platform, PushNotificationIOS } from 'react-native'
import PushNotification from 'react-native-push-notification'
import EventEmitter from 'events'
import CryptoJS from 'crypto-js'

import { storeData, loadData } from './tools'
import { EthNotificationTypes } from './enums'
import {
  DEFAULT_NOTIFICATION_PERMISSIONS,
  EVENTS,
  WALLET_STORE,
  WALLET_PASSWORD
} from './constants'

// Environment variables
import { GCM_SENDER_ID } from 'react-native-dotenv'

class OriginWallet {
  constructor() {
    this.state = {
      ethAddress: null
    }

    this.events = new EventEmitter()
  }

  /* Fire event.
   *
   */
  async fireEvent(eventType, event) {
    this.events.emit(eventType, event)
  }

  /* Configure push notifications.
   *
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

  /*
   *
   */
  getNotificationType() {
    if (Platform.OS === 'ios') {
      return EthNotificationTypes.APN
    } else if (Platform.OS === 'android') {
      return EthNotificationTypes.FCM
    }
  }

  /* Request permissions to send push notifications.
   *
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

  /* Opens the save wallet data and loads the private keys for the saved wallets
   * into web3.
   *
   */
  open() {
    loadData(WALLET_STORE)
      .then(async walletData => {
        if (walletData) {

          // Clear the web3 wallet to make sure we only have the accounts loaded
          // from tbe data store
          web3.eth.accounts.wallet.clear()

          for (let i = 0; i < walletData.length; i++) {
            const data = walletData[i]
            if (data.crypt == 'aes' && data.enc) {
              // Decrypt the private key for the wallet
              const privKey = CryptoJS.AES.decrypt(
                data.enc,
                WALLET_PASSWORD
              ).toString(CryptoJS.enc.Utf8)
              if (privKey) {
                // Add the wallet to web3
                web3.eth.accounts.wallet.add(privKey)
              }
            }
          }

          const { length } = web3.eth.accounts.wallet

          console.debug(`Loaded Origin Wallet with ${length} accounts`)

          if (length) {
            const accounts = this.getAccountAddresses()
            const active = accounts.find(({ active }) => active) || {}

            // Set the active address to either the one that is flagged as
            // active or as the first address
            this.setEthAddress(active.address || accounts[0].address)
          }
        }

        this.fireEvent(EVENTS.LOADED)
      })
      .catch(error => {
        console.error(`Could not load Origin Wallet: ${error}`)
      })
  }

  /* Save the wallet to data store, encrypting private keys.
   *
   */
  async save() {
    const encryptedAccounts = []
    const addresses = this.getAccountAddresses()

    addresses.forEach(address => {
      const account = web3.eth.accounts.wallet[address]
      encryptedAccounts.push({
        crypt: 'aes',
        enc: CryptoJS.AES.encrypt(
          account.privateKey,
          WALLET_PASSWORD
        ).toString()
      })
    })

    try {
      await storeData(WALLET_STORE, encryptedAccounts)
      console.debug(`Saved Origin Wallet`)
    } catch (error) {
      console.error(`Could not save Origin Wallet: ${error}`)
    }
  }

  /* Get account addresses available on the wallet
   *
   */
  getAccountAddresses() {
    return Object.keys(web3.eth.accounts.wallet).filter(k => {
      return web3.utils.isAddress(k) && k === web3.utils.toChecksumAddress(k)
    })
  }

  /* Create new account
   *
   */
  async createAccount() {
    console.debug(`Creating a new account`)
    const wallet = web3.eth.accounts.wallet.create(1)
    const address = wallet[0].address
    this.setEthAddress(address)
    return address
  }

  /* Remove an account
   *
   */
  async removeAccount (address) {
    const result = web3.eth.accounts.wallet.remove(address)
    if (result ) {
      this.save()
    }
    return result
  }

  /* Set the current Ethereum address.
   *
   */
  async setEthAddress(ethAddress) {
    if (ethAddress !== this.state.ethAddress) {
      web3.eth.defaultAccount = ethAddress
      Object.assign(this.state, { ethAddress })
      this.fireEvent(EVENTS.CURRENT_ACCOUNT, {
        address: this.state.ethAddress
      })
      this.save()
    }
  }
}

export default new OriginWallet()
