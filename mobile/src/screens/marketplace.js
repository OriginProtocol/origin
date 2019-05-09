'use strict'

import React, { Component } from 'react'
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  View
} from 'react-native'
import PushNotification from 'react-native-push-notification'
import { WebView } from 'react-native-webview'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'

import NotificationCard from 'components/notification-card'
import SignatureCard from 'components/signature-card'
import TransactionCard from 'components/transaction-card'
import { decodeTransaction } from 'utils/contractDecoder'
import { webViewToBrowserUserAgent } from 'utils'

class MarketplaceScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modals: []
    }

    DeviceEventEmitter.addListener(
      'transactionHash',
      this.handleTransactionHash.bind(this)
    )

    DeviceEventEmitter.addListener(
      'messageSigned',
      this.handleSignedMessage.bind(this)
    )

    DeviceEventEmitter.addListener(
      'messagingKeys',
      this.injectMessagingKeys.bind(this)
    )

    this.onWebViewMessage = this.onWebViewMessage.bind(this)
    this.toggleModal = this.toggleModal.bind(this)

    const swipeDistance = 200
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return (
          Math.abs(gestureState.dx) > swipeDistance &&
          Math.abs(gestureState.dy) < 50
        )
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.moveX > swipeDistance) {
          this.dappWebView.goBack()
        } else if (gestureState.moveX < swipeDistance) {
          this.dappWebView.goForward()
        }
      }
    })
  }

  static navigationOptions = () => {
    return {
      header: null
    }
  }

  componentDidMount() {
    console.debug(
      `Opening marketplace DApp at ${this.props.settings.network.dappUrl}`
    )
    this.props.navigation.setParams({ toggleModal: this.toggleModal })
  }

  onWebViewMessage(event) {
    let msgData
    try {
      msgData = JSON.parse(event.nativeEvent.data)
    } catch (err) {
      console.warn(err)
      return
    }

    if (this[msgData.targetFunc]) {
      // Function handler exists, use that
      const response = this[msgData.targetFunc].apply(this, [msgData.data])
      this.handleBridgeResponse(msgData, response)
    } else {
      PushNotification.checkPermissions(permissions => {
        const newModals = []
        // Check if we lack notification permissions, and we are processing a
        // web3 transactiotn that isn't updating our identitty. If we are then
        // display a modal requesting notifications be enabled
        if (
          !permissions.alert &&
          msgData.targetFunc === 'processTransaction' &&
          decodeTransaction(msgData.data.data).functionName !==
            'emitIdentityUpdated'
        ) {
          newModals.push({ type: 'enableNotifications' })
        }
        // Transaction/signature modal
        const web3Modal = { type: msgData.targetFunc, msgData: msgData }
        // Modals render in different ordering on Android/iOS so use a different
        // method of adding the modal to the array to get the notifications modal
        // to display on top of the web3 modal
        if (Platform.OS === 'ios') {
          newModals.push(web3Modal)
        } else {
          newModals.unshift(web3Modal)
        }
        // Update the state with the new modals
        this.setState(prevState => ({
          modals: [...prevState.modals, ...newModals]
        }))
      })
    }
  }

  getAccounts() {
    const { wallet } = this.props
    const filteredAccounts = wallet.accounts.filter(
      a => a.address !== wallet.activeAccount.address
    )
    const accounts = [
      wallet.activeAccount.address,
      ...filteredAccounts.map(a => a.address)
    ]
    return accounts
  }

  /* Inject the cookies required for messaging to allow preenabling of messaging
   * for accounts
   */
  injectMessagingKeys() {
    const { wallet } = this.props
    const keys = wallet.messagingKeys
    if (keys) {
      const keyInjection = `
        (function() {
          if (window && window.context && window.context.messaging) {
            window.context.messaging.onPreGenKeys({
              address: '${keys.address}',
              signatureKey: '${keys.signatureKey}',
              pubMessage: '${keys.pubMessage}',
              pubSignature: '${keys.pubSignature}'
            });
          }
        })()
      `
      this.dappWebView.injectJavaScript(keyInjection)
    }
  }

  /* Send a response back to the DApp using postMessage in the webview
   */
  handleBridgeResponse(msgData, result) {
    msgData.isSuccessful = Boolean(result)
    msgData.args = [result]
    this.dappWebView.postMessage(JSON.stringify(msgData))
  }

  /* Handle a transaction hash event from the Origin Wallet
   */
  handleTransactionHash({ transaction, hash }) {
    // Close matching modal
    const modal = this.state.modals.find(
      m => m.msgData && m.msgData.data === transaction
    )
    // Toggle the matching modal and return the hash
    this.toggleModal(modal, hash)
  }

  /* Handle a signed message event from the Origin Wallet
   */
  handleSignedMessage({ data, signedMessage }) {
    // Close matching modal
    const modal = this.state.modals.find(
      m => m.msgData && m.msgData.data === data
    )
    // Toggle the matching modal and return the hash
    this.toggleModal(modal, signedMessage.signature)
  }

  /* Remove a modal and return the given result to the DApp
   */
  toggleModal(modal, result) {
    if (!modal) {
      return
    }
    if (modal.msgData) {
      // Send the response to the webview
      this.handleBridgeResponse(modal.msgData, result)
    }
    this.setState(prevState => {
      return {
        ...prevState,
        modals: [...prevState.modals.filter(m => m !== modal)]
      }
    })
  }

  render() {
    const { modals } = this.state
    const { navigation } = this.props
    const marketplaceUrl = navigation.getParam(
      'marketplaceUrl',
      this.props.settings.network.dappUrl
    )

    // Use key of network id on safeareaview to force a remount of component on
    // network changes
    return (
      <SafeAreaView
        key={this.props.settings.network.id}
        style={styles.sav}
        forceInset={{ top: 'always' }}
        {...this._panResponder.panHandlers}
      >
        <WebView
          ref={webview => {
            this.dappWebView = webview
          }}
          source={{ uri: marketplaceUrl }}
          onMessage={this.onWebViewMessage}
          onLoad={() => {
            this.injectMessagingKeys()
          }}
          startInLoadingState={true}
          renderLoading={() => {
            return (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="black" />
              </View>
            )
          }}
          decelerationRate="normal"
          userAgent={webViewToBrowserUserAgent()}
        />
        {modals.map((modal, index) => {
          let card
          if (modal.type === 'enableNotifications') {
            card = (
              <NotificationCard
                onRequestClose={() => this.toggleModal(modal)}
              />
            )
          } else if (modal.type === 'processTransaction') {
            card = (
              <TransactionCard
                msgData={modal.msgData}
                onConfirm={() => {
                  DeviceEventEmitter.emit('sendTransaction', modal.msgData.data)
                }}
                onRequestClose={() =>
                  this.toggleModal(modal, {
                    message: 'User denied transaction signature'
                  })
                }
              />
            )
          } else if (modal.type === 'signMessage') {
            card = (
              <SignatureCard
                msgData={modal.msgData}
                onConfirm={() => {
                  DeviceEventEmitter.emit('signMessage', modal.msgData.data)
                }}
                onRequestClose={() =>
                  this.toggleModal(modal, {
                    message: 'User denied transaction signature'
                  })
                }
              />
            )
          }

          return (
            <Modal
              key={index}
              animationType="fade"
              transparent={true}
              visible={true}
              onRequestClose={() => {
                this.toggleModal(modal)
              }}
            >
              <SafeAreaView style={styles.container}>{card}</SafeAreaView>
            </Modal>
          )
        })}
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B18234C',
    flex: 1
  },
  sav: {
    backgroundColor: 'white',
    flex: 1
  },
  transparent: {
    flex: 1
  },
  loading: {
    flex: 1,
    justifyContent: 'space-around'
  }
})

const mapStateToProps = ({ activation, wallet, settings }) => {
  return { activation, wallet, settings }
}

export default connect(mapStateToProps)(MarketplaceScreen)
