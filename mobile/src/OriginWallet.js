import { Platform, PushNotificationIOS } from 'react-native'
import PushNotification from 'react-native-push-notification'
import EventEmitter from 'events'
import CryptoJS from 'crypto-js'
import UUIDGenerator from 'react-native-uuid-generator'

import { storeData, loadData } from './tools'
import { EthNotificationTypes } from './enums'
import {
  DEFAULT_NOTIFICATION_PERMISSIONS,
  EVENTS,
  WALLET_STORE,
  WALLET_INFO,
  WALLET_PASSWORD
} from './constants'

// Environment variables
import { GCM_SENDER_ID } from 'react-native-dotenv'

class OriginWallet {
  constructor() {
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

  /* Get account addresses.
   *
   */
  getAccountAddresses() {
    return Object.keys(web3.eth.accounts.wallet).filter(k => {
      return web3.utils.isAddress(k) && k === web3.utils.toChecksumAddress(k)
    })
  }

  /* Set web3 address.
   *
   */

  /* Opens the save wallet data and loads the private keys for the saved wallets
   * into web3.
   *
   */
  openWallet() {
    loadData(WALLET_STORE)
      .then(async walletData => {
        let walletInfo = await loadData(WALLET_INFO)
        if (!walletInfo) {
          // Brand new wallet
          walletInfo = { walletToken: await UUIDGenerator.getRandomUUID() }
        }

        if (walletData) {
          web3.eth.accounts.wallet.clear()
          for (let i = 0; i < walletData.length; i++) {
            const data = walletData[i]
            if (data.crypt == 'aes' && data.enc) {
              // Decrypt the private key for the wallet
              const privKey = CryptoJS.AES.decrypt(
                data.enc,
                WALLET_PASSWORD
              ).toString(CryptoJS.enc.Utf8)
              // Add the wallet to web3
              if (privKey) {
                web3.eth.accounts.wallet.add(privKey)
              }
            }
          }
          const { length } = web3.eth.accounts.wallet
          if (length) {
            const accounts = await this.syncAccountMapping()
            const active = accounts.find(({ active }) => active) || {}

            // Set the active address
            this.setWeb3Address(active.address || accounts[0].address)
          }
        }

        this.fireEvent(EVENTS.LOADED)
      })
      .catch(error => {
        console.log(`Could not load wallet data: ${error}`)
      })
  }

  /* Save the wallet to data store, encrypting private keys.
   *
   */
  async saveWallet() {
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
    } catch (error) {
      console.log(`Could not save wallet data: ${error}`)
    }
  }
}

export default new OriginWallet()
