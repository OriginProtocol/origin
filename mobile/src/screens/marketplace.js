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
import { CURRENCIES } from '../constants'
import { decodeTransaction } from 'utils/contractDecoder'
import { updateExchangeRate } from 'utils/price'
import { webViewToBrowserUserAgent } from 'utils'
import { findBestAvailableLanguage } from 'utils/language'
import { setMarketplaceReady } from 'actions/Marketplace'
import { setIdentity } from 'actions/Wallet'
import { identity } from 'graphql/queries'

class MarketplaceScreen extends Component {
  static navigationOptions = () => {
    return {
      header: null
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      modals: [],
      fiatCurrency: null
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

    DeviceEventEmitter.addListener(
      'graphqlQuery',
      this.injectGraphqlQuery.bind(this)
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

  componentDidMount() {
    console.debug(
      `Opening marketplace DApp at ${this.props.settings.network.dappUrl}`
    )
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('transactionHash')
    DeviceEventEmitter.removeListener('messageSigned')
    DeviceEventEmitter.removeListener('messagingKeys')
    DeviceEventEmitter.removeListener('graphqlQuery')
  }

  componentDidUpdate(prevProps) {
    if (prevProps.settings.language !== this.props.settings.language) {
      // Language has changed, need to reload the DApp
      if (this.dappWebView) {
        // Reinject the language
        this.injectLanguage()
      }
    }
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
          !__DEV__ &&
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
    let accounts
    if (wallet.activeAccount) {
      const filteredAccounts = wallet.accounts.filter(
        a => a.address !== wallet.activeAccount.address
      )
      accounts = [
        wallet.activeAccount.address,
        ...filteredAccounts.map(a => a.address)
      ]
    } else {
      accounts = wallet.accounts
    }
    return accounts
  }

  loadIdentities() {
    const { wallet } = this.props

    wallet.accounts.forEach(account => {
      console.log('Loading identiity')
      DeviceEventEmitter.emit('graphqlQuery', 'handleIdentity', identity, {
        id: account.address
      })
    })
  }

  handleIdentity(response) {
    if (response.data.identity) {
      this.props.setIdentity(response.data.identity)
    }
    DeviceEventEmitter.emit('identityResponse', response)
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
      if (this.dappWebView) {
        console.debug('Injecting messaging keys')
        this.dappWebView.injectJavaScript(keyInjection)
      }
    }
  }

  /* Inject the language setting in from redux into the DApp
   */
  injectLanguage() {
    const language = this.props.settings.language
      ? this.props.settings.language
      : findBestAvailableLanguage()
    const languageInjection = `
      (function() {
        if (window && window.appComponent) {
          window.appComponent.onLocale('${language}');
        }
      })()
    `
    if (this.dappWebView) {
      console.debug('Injecting language setting')
      this.dappWebView.injectJavaScript(languageInjection)
    }
  }

  /* Inject Javascript that causes the page to refresh when it hits the top
   */
  injectScrollHandler() {
    const injectedJavaScript = `
      (function() {
        window.onscroll = function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            targetFunc: 'handleScrollHandlerResponse',
            data: document.documentElement.scrollTop || document.body.scrollTop
          }));
        }
      })();
    `
    if (this.dappWebView) {
      console.debug('Injecting scroll handler')
      this.dappWebView.injectJavaScript(injectedJavaScript)
    }
  }

  /* Handle the response from window.onScroll
   */
  handleScrollHandlerResponse(scrollTop) {
    if (scrollTop < -60) {
      this.dappWebView.injectJavaScript(`document.location.reload()`)
    }
  }

  injectGraphqlQuery(targetFunc, query, variables = {}) {
    const injectedJavaScript = `
      (function() {
        window.gql.query({
          query: ${JSON.stringify(query)},
          variables: ${JSON.stringify(variables)}
        }).then((response) => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            targetFunc: '${targetFunc}',
            data: response
          }));
        });
      })();
    `
    if (this.dappWebView) {
      console.debug('Injecting graphql query')
      this.dappWebView.injectJavaScript(injectedJavaScript)
    }
  }

  /* Get the uiState from DApp localStorage via a webview bridge request.
   */
  injectUiStateRequest() {
    const injectedJavaScript = `
      (function() {
        if (window && window.localStorage && window.webViewBridge) {
          const uiState = window.localStorage['uiState'];
          window.webViewBridge.send('handleUiStateResponse', uiState);
        }
      })();
    `
    if (this.dappWebView) {
      console.debug('Injecting uiState request')
      this.dappWebView.injectJavaScript(injectedJavaScript)
    }
  }

  /* Handle the response from the uiState request. The uiState localStorage object
   * can include information about the currency the DApp is set to.
   */
  handleUiStateResponse(uiStateJson) {
    let uiState
    let fiatCurrencyCode = 'fiat-USD'
    if (
      uiStateJson.constructor === Object &&
      Object.keys(uiStateJson).length === 0
    ) {
      // Empty uiState key, nothiing to do here
      return
    }
    try {
      uiState = JSON.parse(uiStateJson)
      if (uiState['currency']) {
        fiatCurrencyCode = uiState['currency']
      }
    } catch (error) {
      console.debug('Failed to parse uiState')
    }
    const fiatCurrency = CURRENCIES.find(c => c[0] === fiatCurrencyCode)
    this.setState({ fiatCurrency })
    // TODO: this will need to be adjusted if multiple non stablecoin support
    // is added to the DApp (or when OGN has a market price)
    updateExchangeRate(fiatCurrency[1], 'ETH')
    updateExchangeRate(fiatCurrency[1], 'DAI')
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

    return (
      <SafeAreaView style={styles.sav} {...this._panResponder.panHandlers}>
        <WebView
          ref={webview => {
            this.dappWebView = webview
          }}
          source={{ uri: marketplaceUrl }}
          onMessage={this.onWebViewMessage}
          onLoad={() => {
            this.injectLanguage()
            this.injectScrollHandler()
            this.injectMessagingKeys()
            this.loadIdentities()
            this.props.setMarketplaceReady(true)
            setInterval(() => {
              this.injectUiStateRequest()
            }, 5000)
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
                fiatCurrency={this.state.fiatCurrency}
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

const mapStateToProps = ({ activation, wallet, settings }) => {
  return { activation, wallet, settings }
}

const mapDispatchToProps = dispatch => ({
  setMarketplaceReady: ready => dispatch(setMarketplaceReady(ready)),
  setIdentity: identity => dispatch(setIdentity(identity))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MarketplaceScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  sav: {
    flex: 1
  },
  transparent: {
    flex: 1
  },
  loading: {
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: 'white'
  }
})
