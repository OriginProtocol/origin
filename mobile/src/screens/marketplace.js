'use strict'

import React, { Component } from 'react'
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Clipboard,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  View,
  ScrollView,
  Text,
  RefreshControl,
  Linking
} from 'react-native'
import { AndroidBackHandler } from 'react-navigation-backhandler'
import { connect } from 'react-redux'
import { WebView } from 'react-native-webview'
import PushNotification from 'react-native-push-notification'
import SafeAreaView from 'react-native-safe-area-view'
import get from 'lodash.get'
import { fbt } from 'fbt-runtime'
import { ShareDialog } from 'react-native-fbsdk'
import { Sentry } from 'react-native-sentry'

import OriginButton from 'components/origin-button'
import NotificationCard from 'components/notification-card'
import SignatureCard from 'components/signature-card'
import TransactionCard from 'components/transaction-card'
import { CURRENCIES } from '../constants'
import { decodeTransaction } from 'utils/contractDecoder'
import { updateExchangeRate } from 'utils/price'
import { webViewToBrowserUserAgent } from 'utils'
import { findBestAvailableLanguage } from 'utils/language'
import {
  findBestAvailableCurrency,
  tokenBalanceFromGql
} from 'utils/currencies'
import {
  setMarketplaceReady,
  setMarketplaceWebViewError
} from 'actions/Marketplace'
import { setAccountBalances, setIdentity } from 'actions/Wallet'
import withOriginGraphql from 'hoc/withOriginGraphql'
import { getCurrentRoute } from '../NavigationService'
import { PROMPT_MESSAGE, PROMPT_PUB_KEY } from '../constants'
import CardStyles from 'styles/card'

class MarketplaceScreen extends Component {
  static navigationOptions = () => {
    return {
      header: null
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      enablePullToRefresh: true,
      modals: [],
      fiatCurrency: CURRENCIES.find(c => c[0] === 'fiat-USD'),
      transactionCardLoading: false,
      currentDomain: '',
      lastDappUrl: null,
      // Whenever this change it forces the WebView to go to that source
      webViewUrlTrigger: this.props.settings.network.dappUrl
    }
    if (Platform.OS === 'android') {
      // Configure swipe handler for back forward navigation on Android because
      // it does not support allowsBackForwardNavigationGestures
      this.setSwipeHandler()
    }
    this.subscriptions = [
      DeviceEventEmitter.addListener('graphqlQuery', this.injectGraphqlQuery),
      DeviceEventEmitter.addListener(
        'graphqlMutation',
        this.injectGraphqlMutation
      ),
      DeviceEventEmitter.addListener('reloadMarketplace', () => {
        if (this.dappWebView) {
          this.dappWebView.reload()
        }
      })
    ]
  }

  componentWillUnmount() {
    if (this.subscriptions) {
      this.subscriptions.map(s => s.remove())
    }
  }

  /* Handle back button presses on Android devices so that they work on the
   * WebView */
  onBackButtonPressAndroid = () => {
    if (this.dappWebView) {
      this.dappWebView.goBack()
    }
    return true
  }

  async clipboardInviteCodeCheck() {
    const content = await Clipboard.getString()
    const INVITE_CODE_PREFIX = 'origin:growth_invite_code:'

    if (content && content.startsWith(INVITE_CODE_PREFIX)) {
      const inviteCode = content.substr(INVITE_CODE_PREFIX.length)
      if (this.dappWebView) {
        // Inject invite code
        this.injectInviteCode(inviteCode)
        // Clear clipboard
        Clipboard.setString('')
      }
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.settings.language !== this.props.settings.language) {
      // Language has changed, need to reload the DApp
      this.injectLanguage()
    }

    // Check for default dapp url
    if (
      get(prevProps, 'settings.network.dappUrl') !==
      get(this.props, 'settings.network.dappUrl')
    ) {
      // Default dapp url changed, trigger WebView url change
      this.setState({
        webViewUrlTrigger: get(this.props, 'settings.network.dappUrl')
      })
    }

    // Check for active Ethereum address changing
    if (
      get(prevProps, 'wallet.activeAccount.address') !==
      get(this.props, 'wallet.activeAccount.address')
    ) {
      // Active account changed, update messaging keys
      this.injectMessagingKeys()
    }

    // Check for growth enrollment changing
    if (
      get(prevProps, 'onboarding.growth') !==
      get(this.props, 'onboarding.growth')
    ) {
      this.injectGrowthAuthToken()
    }

    if (prevState.fiatCurrency !== this.state.fiatCurrency) {
      // Currency changed, update exchange rates
      this.updateExchangeRates()
    }
  }

  /* Enables left and right swiping to go forward/back in the WebView.
   */
  setSwipeHandler = () => {
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
        if (this.dappWebView) {
          if (gestureState.moveX > swipeDistance) {
            this.dappWebView.goBack()
          } else if (gestureState.moveX < swipeDistance) {
            this.dappWebView.goForward()
          }
        }
      }
    })
  }

  /* Handles messages received from the WebView via window.postMessage.
   */
  onWebViewMessage = event => {
    let msgData
    try {
      msgData = JSON.parse(event.nativeEvent.data)
    } catch (err) {
      console.warn(err)
      return
    }

    const currentRoute = getCurrentRoute()
    const { wallet } = this.props

    if (msgData.targetFunc === 'getAccounts') {
      // Calculated state of accounts by placing activeAccount at the front
      // of the accounts array
      // TODO: handle this with something like reselect so the logic
      // can be moved into a selector as this is just computed from redux state
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
        accounts = wallet.accounts.map(a => a.address)
      }
      this.handleBridgeResponse(msgData, accounts)
    } else if (this[msgData.targetFunc]) {
      // Function handler exists, use that
      const response = this[msgData.targetFunc].apply(this, [msgData.data])
      this.handleBridgeResponse(msgData, response)
    } else if (msgData.targetFunc === 'signPersonalMessage') {
      // Personal sign is for handling meta transaction requests
      const decodedData = JSON.parse(
        global.web3.utils.hexToUtf8(msgData.data.data)
      )
      // Sanity check on addresses
      if (
        decodedData.from.toLowerCase() !==
        wallet.activeAccount.address.toLowerCase()
      ) {
        console.error('Account mismatch')
        return null
      }
      const decodedTransaction = decodeTransaction(decodedData.txData)
      // If the transaction validate the sha3 hash and sign that for the relayer
      if (this.isValidMetaTransaction(decodedTransaction)) {
        const dataToSign = global.web3.utils.soliditySha3(
          { t: 'address', v: decodedData.from },
          { t: 'address', v: decodedData.to },
          { t: 'uint256', v: global.web3.utils.toWei('0', 'ether') },
          { t: 'bytes', v: decodedData.txData },
          { t: 'uint256', v: decodedData.nonce }
        )
        // Sign it
        const { signature } = global.web3.eth.accounts.sign(
          dataToSign,
          wallet.activeAccount.privateKey
        )
        // Send the response back to the webview
        this.handleBridgeResponse(msgData, signature)
        console.debug('Got meta transaction: ', decodedTransaction)
      } else {
        const errorMessage = `Invalid meta transaction ${decodedTransaction.functionName}`
        console.warn(errorMessage)
        Sentry.captureMessage(errorMessage)
      }
    } else if (currentRoute === 'Ready') {
      // Relayer failure fallback, if we are on the onboarding step where identity
      // gets published reject the transaction because we don't want to display a
      // modal, the user most likely can't proceed because the account is new and
      // has no balance
      console.warn('Could not process WebView message: ', msgData)
      this.handleBridgeResponse(msgData, {
        message: 'User denied transaction signature'
      })
    } else {
      const { functionName } = decodeTransaction(msgData.data.data)
      // Bump the gas for swapAndMakeOffer by 10% to handle out of gas failures caused
      // by the proxy contract
      // TODO find a better way to handle this
      // https://github.com/OriginProtocol/origin/issues/2771
      if (functionName === 'swapAndMakeOffer') {
        msgData.data.gas =
          '0x' +
          Math.ceil(
            parseInt(msgData.data.gas) + parseInt(msgData.data.gas) * 0.1
          ).toString(16)
      }
      // Not handled yet, display a modal that deals with the target function
      PushNotification.checkPermissions(permissions => {
        const newModals = []
        // Check if we lack notification permissions, and we are processing a
        // web3 transaction that isn't updating our identity. If so display a
        // modal requesting notifications be enabled
        if (
          !__DEV__ &&
          !permissions.alert &&
          msgData.targetFunc === 'processTransaction' &&
          functionName !== 'emitIdentityUpdate'
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

  isValidMetaTransaction = data => {
    const validFunctions = [
      'acceptOffer',
      'addData',
      'createListing',
      'createProxyWithSenderNonce',
      'emitIdentityUpdated',
      'finalize',
      'makeOffer',
      'marketplaceFinalizeAndPay',
      'updateListing',
      'withdrawListing',
      'withdrawOffer'
    ]
    return validFunctions.includes(data.functionName)
  }

  /* Remove a modal and return the given result to the DApp
   */
  toggleModal = (modal, result) => {
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

  injectJavaScript = (script, name) => {
    const injectedJavaScript = `
      (function() {
        ${script}
      })();
    `
    if (this.dappWebView) {
      console.debug(`Injecting ${name}`)
      this.dappWebView.injectJavaScript(injectedJavaScript)
    }
  }

  injectInviteCode = inviteCode => {
    this.injectJavaScript(
      `
        if (window && window.localStorage) {
          window.localStorage.growth_invite_code = '${inviteCode}';
        }
      `,
      'invite code'
    )
  }

  /* Inject the cookies required for messaging to allow preenabling of messaging
   * for accounts
   */
  injectMessagingKeys = () => {
    const { wallet } = this.props

    if (!wallet.activeAccount) {
      return
    }

    let privateKey = wallet.activeAccount.privateKey
    if (!privateKey.startsWith('0x') && /^[0-9a-fA-F]+$/.test(privateKey)) {
      privateKey = '0x' + privateKey
    }

    // Sign the first message
    const signatureKey = global.web3.eth.accounts
      .sign(PROMPT_MESSAGE, privateKey)
      .signature.substring(0, 66)
    const msgAccount = global.web3.eth.accounts.privateKeyToAccount(
      signatureKey
    )

    // Sign the second message
    const pubMessage = PROMPT_PUB_KEY + msgAccount.address
    const pubSignature = global.web3.eth.accounts.sign(pubMessage, privateKey)
      .signature

    this.injectJavaScript(
      `
        if (window && window.context && window.context.messaging) {
          window.context.messaging.onPreGenKeys({
            address: '${wallet.activeAccount.address}',
            signatureKey: '${signatureKey}',
            pubMessage: '${pubMessage}',
            pubSignature: '${pubSignature}'
          });
        }
      `,
      'messaging keys'
    )
  }

  /* Inject the language setting in from redux into the DApp
   */
  injectLanguage = () => {
    const language = this.props.settings.language
      ? this.props.settings.language
      : findBestAvailableLanguage()

    this.injectJavaScript(
      `
        if (window && window.appComponent && window.appComponent.onLocale) {
          window.appComponent.onLocale('${language}');
        }
      `,
      'language'
    )
  }

  injectCurrency = () => {
    const currency = findBestAvailableCurrency()

    this.injectJavaScript(
      `
        if (window && window.appComponent && window.appComponent.onCurrency) {
          window.appComponent.onCurrency('${currency}');
        }
      `,
      'currency'
    )
  }

  /* Inject Javascript that causes the page to refresh when it hits the top
   */
  injectScrollHandler = () => {
    this.injectJavaScript(
      `
        window.onscroll = function() {
          window.webViewBridge.send('handleScrollHandlerResponse', {
            scrollTop: document.documentElement.scrollTop || document.body.scrollTop
          });
        }
      `,
      'scroll handler'
    )
  }

  /* Handle the response from window.onScroll
   */
  handleScrollHandlerResponse = ({ scrollTop }) => {
    this.setState({ enablePullToRefresh: scrollTop === 0 })
  }

  injectGraphqlQuery = (
    id,
    query,
    variables = {},
    fetchPolicy = 'cache-first'
  ) => {
    this.injectJavaScript(
      `
        if (window && window.gql) {
          window.gql.query({
            query: ${JSON.stringify(query)},
            variables: ${JSON.stringify(variables)},
            fetchPolicy: '${fetchPolicy}'
          }).then((response) => {
            window.webViewBridge.send('handleGraphqlResult', {
              id: '${id}',
              response: response
            });
          }).catch((error) => {
            window.webViewBridge.send('handleGraphqlError', {
              id: '${id}',
              error: error
            });
          });
        }
      `,
      'GraphQL query'
    )
  }

  injectGraphqlMutation = (id, mutation, variables = {}) => {
    this.injectJavaScript(
      `
        if (window && window.gql) {
          window.gql.mutate({
            mutation: ${JSON.stringify(mutation)},
            variables: ${JSON.stringify(variables)}
          }).then((response) => {
            window.webViewBridge.send('handleGraphqlResult', {
              id: '${id}',
              response: response
            });
          }).catch((error) => {
            window.webViewBridge.send('handleGraphqlError', {
              id: '${id}',
              error: error
            });
          });
        }
      `,
      'GraphQL mutation'
    )
  }

  handleGraphqlResult = result => {
    DeviceEventEmitter.emit('graphqlResult', result)
  }

  handleGraphqlError = result => {
    DeviceEventEmitter.emit('graphqlError', result)
  }

  /* Get the uiState from DApp localStorage via a webview bridge request.
   */
  injectUiStateRequest = () => {
    this.injectJavaScript(
      `
        if (window && window.localStorage && window.webViewBridge) {
          const uiState = window.localStorage['uiState'];
          window.webViewBridge.send('handleUiStateMessage', uiState);
        }
      `,
      'uiState request'
    )
  }

  /* Handle the postMessagefrom the uiState request. The uiState localStorage object
   * can include information about the currency the DApp is set to.
   */
  handleUiStateMessage = async uiStateJson => {
    if (
      uiStateJson.constructor === Object &&
      Object.keys(uiStateJson).length === 0
    ) {
      // Empty uiState key, nothiing to do here
    } else {
      let uiState
      // Parse the uiState value
      try {
        uiState = JSON.parse(uiStateJson)
        if (uiState['currency']) {
          const fiatCurrency = CURRENCIES.find(
            c => c[0] === uiState['currency']
          )
          await this.setState({ fiatCurrency })
        }
      } catch (error) {
        // Skip
      }
    }
  }

  injectGrowthAuthToken = () => {
    if (!this.props.onboarding.growth) {
      return
    }

    this.injectJavaScript(
      `
        if (window && window.localStorage && window.webViewBridge) {
          window.localStorage.growth_auth_token = '${this.props.onboarding.growth}';
        }
      `,
      'growth auth token'
    )
  }

  /* Send a response back to the DApp using postMessage in the webview
   */
  handleBridgeResponse = (msgData, result) => {
    msgData.isSuccessful = Boolean(result)
    msgData.args = [result]
    if (this.dappWebView) {
      this.dappWebView.postMessage(JSON.stringify(msgData))
    }
  }

  updateExchangeRates = () => {
    // TODO: this will need to be adjusted if multiple non stablecoin support
    // is added to the DApp (or when OGN has a market price)
    updateExchangeRate(this.state.fiatCurrency[1], 'ETH')
    updateExchangeRate(this.state.fiatCurrency[1], 'DAI')
  }

  _openDeepLinkUrlAttempt = async (
    interceptUrlPredicate,
    makeUrl,
    timeControlVariableName,
    skipForceRefresh
  ) => {
    // non interceptable url
    if (!interceptUrlPredicate()) return

    const url = makeUrl()
    if (await Linking.canOpenURL(url)) {
      if (!skipForceRefresh) {
        this.goBackToDapp()
      }
      // preventing multiple subsequent shares
      if (
        !this[timeControlVariableName] ||
        new Date() - this[timeControlVariableName] > 3000
      ) {
        this[timeControlVariableName] = new Date()
        await Linking.openURL(url)
      }
      return true
    } else {
      // can not open deep link url
      return false
    }
  }

  checkForShareNativeDialogInterception = async url => {
    console.log('Url change: ', url.href)
    // natively tweet if possible on Android
    if (
      await this._openDeepLinkUrlAttempt(
        () =>
          url.hostname === 'twitter.com' &&
          url.pathname === '/intent/tweet' &&
          Platform.OS === 'android',
        () =>
          `twitter://post?message=${encodeURIComponent(
            url.searchParams.get('text')
          )}`,
        'lastTweetAttemptTime'
      )
    ) {
      return true
    }

    //open twitter profile natively if possible on Android
    if (
      await this._openDeepLinkUrlAttempt(
        () =>
          url.hostname === 'twitter.com' &&
          url.pathname === '/intent/follow' &&
          Platform.OS === 'android',
        () =>
          `twitter://user?screen_name=${url.searchParams.get('screen_name')}`,
        'lastOpenTwitterProfileTime'
      )
    ) {
      return true
    }

    // open facebook profile natively if possible on Android
    if (
      await this._openDeepLinkUrlAttempt(
        () =>
          (url.hostname === 'www.facebook.com' ||
            url.hostname === 'm.facebook.com') &&
          url.pathname.toLowerCase() === '/originprotocol/' &&
          Platform.OS === 'android',
        //Facebook on IOS and Android has different deep-linking format
        () => `fb://page/120151672018856`,
        'lastOpenFacebookProfileTime'
      )
    ) {
      return true
    }

    // open facebook profile natively if possible and IOS
    if (
      await this._openDeepLinkUrlAttempt(
        () =>
          (url.hostname === 'www.facebook.com' ||
            url.hostname === 'm.facebook.com') &&
          url.pathname.toLowerCase() === '/originprotocol/' &&
          Platform.OS === 'ios',
        //Facebook on IOS and Android has different deep-linking format
        () => `fb://profile/120151672018856`,
        'lastOpenFacebookProfileTime'
      )
    ) {
      return true
    }

    // Open telegram links on native web browser
    if (
      await this._openDeepLinkUrlAttempt(
        () => url.hostname === 't.me',
        () => url.toString(),
        'lastOpenTelegramProfileTime',
        true
      )
    ) {
      return true
    }

    if (
      url.hostname === 'www.facebook.com' ||
      url.hostname === 'm.facebook.com'
    ) {
      const shareHasBeenTriggeredRecently =
        this.facebookShareShowTime &&
        new Date() - this.facebookShareShowTime < 5000

      if (url.pathname === '/dialog/share' && !shareHasBeenTriggeredRecently) {
        const shareLinkContent = {
          contentType: 'link',
          contentUrl: url.searchParams.get('href')
        }
        const canShowFbShare = await ShareDialog.canShow(shareLinkContent)

        if (!canShowFbShare) {
          return
        }

        this.facebookShareShowTime = new Date()
        const shareResult = await ShareDialog.show(shareLinkContent)
        if (shareResult.isCancelled) {
          console.log('Share cancelled by user')
        } else {
          console.log(`Share success with postId: ${shareResult.postId}`)
        }
      }

      /* After Facebook shows up the share dialog in dapp's WebView and user is not logged
       * in it will redirect to login page. For that reason we return to the last dapp's
       * url instead of triggering back.
       */
      if (shareHasBeenTriggeredRecently) {
        this.goBackToDapp()
      }
    }
  }

  goBackToDapp = () => {
    const url = this.state.lastDappUrl
    // A random is used to force the WebView to navigate.
    url.searchParams.set('returnRandom', Math.floor(Math.random() * 1000))
    this.setState({ webViewUrlTrigger: url.href })
  }

  onWebViewNavigationStateChange = async state => {
    const dappUrl = new URL(this.props.settings.network.dappUrl)

    try {
      const url = new URL(state.url)
      const stateUpdate = { currentDomain: url.hostname }

      if (dappUrl.hostname === url.hostname) {
        stateUpdate.lastDappUrl = url
      }

      this.setState(stateUpdate)

      const intercepted = await this.checkForShareNativeDialogInterception(url)
      if (intercepted) {
        // Stop loading if URL has been intercepted
        this.dappWebView.stopLoading()
        return false
      }
    } catch (error) {
      console.warn(`Browser reporting malformed url: ${state.url}`)
    }

    return true
  }

  onWebViewLoad = async () => {
    // Check if a growth invie code needs to be set
    this.clipboardInviteCodeCheck()
    this.injectGrowthAuthToken()
    // Set the language in the DApp to the same as the mobile app
    this.injectLanguage()
    // Set the currency in the DApp
    this.injectCurrency()
    // Inject scroll handler for pull to refresh function
    if (Platform.OS === 'android') {
      this.injectScrollHandler()
    }
    // Preload messaging keys so user doesn't have to enable messaging
    this.injectMessagingKeys()

    // Periodic exchange rate updating
    if (this.exUpdater) {
      clearInterval(this.exUpdater)
    }
    this.updateExchangeRates()
    this.exUpdater = setInterval(this.updateExchangeRates, 60000)

    // Periodic ui updates
    const uiUpdates = () => {
      this.injectUiStateRequest()
      if (this.props.wallet.activeAccount) {
        // Update account identity and balances
        this.updateIdentity()
        this.updateBalance()
      }
    }
    // Clear existing updater if exists
    if (this.uiUpdater) {
      clearInterval(this.uiUpdater)
    }
    uiUpdates()
    this.uiUpdater = setInterval(uiUpdates, 5000)

    // Set state to ready in redux
    await this.props.setMarketplaceReady(true)
    // Make sure any error state is cleared
    await this.props.setMarketplaceWebViewError(false)
  }

  updateIdentity = async () => {
    let identity
    try {
      const graphqlResponse = await this.props.getIdentity(
        this.props.wallet.activeAccount.address
      )
      identity = get(graphqlResponse, 'data.web3.account.identity')
    } catch (error) {
      // Handle GraphQL errors for things like invalid JSON RPC response or we
      // could crash the app
      console.warn('Could not retrieve identity using GraphQL: ', error)
      return
    }
    this.props.setIdentity({
      address: this.props.wallet.activeAccount.address,
      identity
    })
  }

  updateBalance = async () => {
    const activeAddress = this.props.wallet.activeAccount.address
    try {
      const balances = {}
      // Get ETH balance, decimals don't need modifying
      const ethBalanceResponse = await this.props.getBalance(activeAddress)
      balances['eth'] = Number(
        get(ethBalanceResponse.data, 'web3.account.balance.eth', 0)
      )
      balances['dai'] = tokenBalanceFromGql(
        await this.props.getTokenBalance(activeAddress, 'DAI')
      )
      balances['ogn'] = tokenBalanceFromGql(
        await this.props.getTokenBalance(activeAddress, 'OGN')
      )
      this.props.setAccountBalances(balances)
    } catch (error) {
      console.warn('Could not retrieve balances using GraphQL: ', error)
    }
  }

  render() {
    return (
      <AndroidBackHandler onBackPress={this.onBackButtonPressAndroid}>
        <SafeAreaView style={styles.safeAreaView}>
          <ScrollView
            contentContainerStyle={{ flex: 1 }}
            refreshControl={
              <RefreshControl
                enabled={this.state.enablePullToRefresh}
                refreshing={this.state.refreshing}
                onRefresh={() => {
                  if (Platform.OS === 'android') {
                    // Workaround for broken refreshing in Android, insert a
                    // time string alongside the # to force a reload
                    this.injectJavaScript(
                      'location.href = `/?${+ new Date()}${location.hash}`',
                      'reload'
                    )
                  } else {
                    this.injectJavaScript(
                      'document.location.reload()',
                      'reload'
                    )
                  }
                  setTimeout(() => this.setState({ refreshing: false }), 1000)
                }}
              />
            }
            {...(Platform.OS === 'android'
              ? this._panResponder.panHandlers
              : [])}
          >
            <WebView
              ref={webview => {
                // For an unknown reason webview has null value even when a non
                // null value has already been returned
                if (webview) {
                  this.dappWebView = webview
                }
              }}
              allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
              useWebKit={Platform.OS === 'ios'}
              source={{ uri: this.state.webViewUrlTrigger }}
              onMessage={this.onWebViewMessage}
              onLoad={this.onWebViewLoad}
              onError={syntheticEvent => {
                const { nativeEvent } = syntheticEvent
                this.props.setMarketplaceWebViewError(nativeEvent.description)
              }}
              onNavigationStateChange={this.onWebViewNavigationStateChange}
              onShouldStartLoadWithRequest={this.onWebViewNavigationStateChange}
              renderLoading={() => {
                return (
                  <View style={styles.loading}>
                    <ActivityIndicator size="large" color="black" />
                  </View>
                )
              }}
              decelerationRate="normal"
              // On Android twitter share dialog will not appear with all
              // user agents. For that reason we hardcode one that does work
              userAgent={webViewToBrowserUserAgent(
                this.state.currentDomain === 'twitter.com' &&
                  Platform.OS === 'android'
              )}
              startInLoadingState={true}
              renderError={() => (
                <Modal animationType="fade" transparent={true} visible={true}>
                  <SafeAreaView style={styles.modalSafeAreaView}>
                    <View style={styles.card}>
                      <Text style={styles.cardHeading}>
                        <fbt desc="MarketplaceScreen.heading">
                          Connection Error
                        </fbt>
                      </Text>
                      <Text style={styles.cardContent}>
                        <fbt desc="NoInternetError.errorText">
                          An error occurred loading the Origin Marketplace.
                          Please check your internet connection.
                        </fbt>
                      </Text>
                      <View style={styles.buttonContainer}>
                        <OriginButton
                          size="large"
                          type="primary"
                          title={fbt('Retry', 'MarketplaceScreen.retryButton')}
                          onPress={() => {
                            DeviceEventEmitter.emit('reloadMarketplace')
                          }}
                        />
                      </View>
                    </View>
                  </SafeAreaView>
                </Modal>
              )}
            />

            {this.state.modals.map((modal, index) => {
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
                      this.setState({ transactionCardLoading: true })
                      global.web3.eth
                        .sendTransaction(modal.msgData.data)
                        .on('transactionHash', hash => {
                          this.setState({ transactionCardLoading: false })
                          this.toggleModal(modal, hash)
                        })
                    }}
                    loading={this.state.transactionCardLoading}
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
                      if (
                        modal.msgData.data.from.toLowerCase() !==
                        this.props.wallet.activeAccount.address.toLowerCase()
                      ) {
                        console.error('Account mismatch')
                        return
                      }
                      const { signature } = global.web3.eth.accounts.sign(
                        modal.msgData.data.data,
                        this.props.wallet.activeAccount.privateKey
                      )
                      this.toggleModal(modal, signature)
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
                  <SafeAreaView style={styles.modalSafeAreaView}>
                    {card}
                  </SafeAreaView>
                </Modal>
              )
            })}
          </ScrollView>
        </SafeAreaView>
      </AndroidBackHandler>
    )
  }
}

const mapStateToProps = ({
  activation,
  marketplace,
  onboarding,
  wallet,
  settings
}) => {
  return { activation, marketplace, onboarding, wallet, settings }
}

const mapDispatchToProps = dispatch => ({
  setMarketplaceReady: ready => dispatch(setMarketplaceReady(ready)),
  setMarketplaceWebViewError: error =>
    dispatch(setMarketplaceWebViewError(error)),
  setIdentity: payload => dispatch(setIdentity(payload)),
  setAccountBalances: balance => dispatch(setAccountBalances(balance))
})

export default withOriginGraphql(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MarketplaceScreen)
)

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1
  },
  modalSafeAreaView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  },
  loading: {
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: 'white'
  },
  ...CardStyles
})
