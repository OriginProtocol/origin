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
import { fbt } from 'fbt-runtime'
import { ShareDialog } from 'react-native-fbsdk'
import SafeAreaView from 'react-native-safe-area-view'
import get from 'lodash.get'

import OriginButton from 'components/origin-button'
import OriginWeb3View from 'components/origin-web3view'

import { DEFAULT_ANDROID_UA, DEFAULT_IOS_UA } from '../constants'
import { findBestAvailableLanguage } from 'utils/language'
import { findBestAvailableCurrency } from 'utils/currencies'
import {
  setMarketplaceReady,
  setMarketplaceWebViewError
} from 'actions/Marketplace'
import withOriginGraphql from 'hoc/withOriginGraphql'
import { PROMPT_MESSAGE, PROMPT_PUB_KEY } from '../constants'

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
      webViewRef: React.createRef(),
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
      )
    ]
  }

  componentWillUnmount = () => {
    if (this.subscriptions) {
      this.subscriptions.map(s => s.remove())
    }
  }

  componentDidUpdate = prevProps => {
    if (prevProps.settings.language !== this.props.settings.language) {
      // Language has changed, need to reload the DApp
      this.injectLanguage()
    }

    if (prevProps.settings.currency !== this.props.settings.currency) {
      this.injectCurrency()
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
  }

  injectJavaScript = (script, name) => {
    const injectedJavaScript = `
      (function() {
        ${script}
      })();
    `
    if (this.state.webViewRef.current) {
      console.debug(`Injecting ${name}`)
      this.state.webViewRef.current.injectJavaScript(injectedJavaScript)
    } else {
      console.debug(`Could not inject ${name}`)
    }
  }

  injectInviteCode = async () => {
    const INVITE_CODE_PREFIX = 'origin:growth_invite_code:'
    const content = await Clipboard.getString()
    if (content && content.startsWith(INVITE_CODE_PREFIX)) {
      const inviteCode = content.substr(INVITE_CODE_PREFIX.length)
      // Inject invite code
      this.injectJavaScript(
        `
          if (window && window.localStorage) {
            window.localStorage.growth_invite_code = '${inviteCode}';
          }
        `,
        'invite code'
      )
      // Clear clipboard
      Clipboard.setString('')
    }
  }

  /* Inject the cookies required for messaging to allow preenabling of messaging
   * for accounts
   */
  injectMessagingKeys = () => {
    const { wallet } = this.props
    let { privateKey } = wallet.activeAccount

    // No active account or no private key (Samsung BKS account), can't generate
    // messaging keys
    if (!wallet.activeAccount || !privateKey) return

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

  /* Enables left and right swiping to go forward/back in the WebView on Android.
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
        if (this.state.webViewRef.current) {
          if (gestureState.moveX > swipeDistance) {
            this.state.webViewRef.current.goBack()
          } else if (gestureState.moveX < swipeDistance) {
            this.state.webViewRef.current.goForward()
          }
        }
      }
    })
  }

  /* Attempt to open a native deep link URL on this phone. If the relevant
   * app is installed this will open it, otherwise returns false.
   */
  openNativeDeepLink = async (url, timeControlVariableName) => {
    if (Linking.canOpenURL(url)) {
      this.goBackToDapp()
      // Preventing multiple subsequent shares
      if (
        !this[timeControlVariableName] ||
        new Date() - this[timeControlVariableName] > 3000
      ) {
        this[timeControlVariableName] = new Date()
        return await Linking.openURL(url)
      }
    } else {
      // Can not open deep link url
      return false
    }
  }

  /* Monitor the state of the WebView and if attempting to open a URL from
   * Twitter or Facebook for sharing for Origin Rewards, attempt to open the
   * link using the native app on the phone.
   */
  checkForShareNativeDialogInterception = async url => {
    // Handle Twitter links on Android (iOS handles them automatically)
    if (Platform.OS === 'android') {
      if (url.hostname === 'twitter.com') {
        if (url.pathname === '/intent/tweet') {
          // Natively Tweet on Android
          this.openNativeDeepLink(
            `twitter://post?message=${encodeURIComponent(
              url.searchParams.get('text')
            )}`,
            'lastTweetAttemptTime'
          )
        } else if (url.pathname === '/intent/follow') {
          // Natively open Twitter profile on Android
          this.openNativeDeepLink(
            `twitter://user?screen_name=${url.searchParams.get('screen_name')}`,
            'lastOpenTwitterProfileTime'
          )
        }
      }
    }

    if (
      url.hostname.includes('facebook.com') &&
      url.pathname.toLowerCase() === '/originprotocol'
    ) {
      // Open facebook profile natively if possible and IOS and Android
      this.openNativeDeepLink(
        `fb://${Platform.OS === 'ios' ? 'profile' : 'page'}/120151672018856`,
        'lastOpenFacebookProfileTime'
      )
    }

    if (url.hostname.includes('facebook.com')) {
      const shareHasBeenTriggeredRecently =
        this.facebookShareShowTime &&
        new Date() - this.facebookShareShowTime < 5000

      if (url.pathname === '/dialog/share' && !shareHasBeenTriggeredRecently) {
        const shareLinkContent = {
          contentType: 'link',
          contentUrl: url.searchParams.get('href')
        }
        const canShowFbShare = await ShareDialog.canShow(shareLinkContent)

        if (!canShowFbShare) return

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

  onWebViewMessage = msg => {
    console.log(msg)
  }

  onWebViewNavigationStateChange = async state => {
    let url
    try {
      url = new URL(state.url)
    } catch (error) {
      console.warn(`Browser reporting malformed url: ${state.url}`)
    }

    const dappUrl = new URL(this.props.settings.network.dappUrl)
    if (dappUrl.hostname === url.hostname) {
      this.setState({ lastDappUrl: url })
    }

    await this.checkForShareNativeDialogInterception(url)
  }

  onWebViewLoad = () => {
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
    // Check if a growth invie code needs to be set
    this.injectInviteCode()
    // Set state to ready in redux
    this.props.setMarketplaceReady(true)
    // Make sure any error state is cleared
    this.props.setMarketplaceWebViewError(false)
  }

  /* Handle refresh requests, e.g. from the RefreshControl component.
   */
  onRefresh = () => {
    if (Platform.OS === 'android') {
      // Workaround for broken refreshing in Android, insert a
      // time string alongside the # to force a reload
      this.injectJavaScript(
        'location.href = `/?${+ new Date()}${location.hash}`',
        'reload'
      )
    } else {
      this.injectJavaScript('document.location.reload()', 'reload')
    }
    setTimeout(() => this.setState({ refreshing: false }), 1000)
  }

  /* Handle reload requests, e.g. from the no internet error display.
   */
  onReload = () => {
    if (this.state.webViewRef.current) {
      this.state.webViewRef.current.reload()
    }
    return true
  }

  /* Handle back requests, e.g. from Android back buttons.
   */
  onBack = () => {
    if (this.state.webViewRef.current) {
      this.state.webViewRef.current.goBack()
    }
    return true
  }

  /* Handle an error loading the WebView
   */
  onWebViewError = syntheticEvent => {
    const { nativeEvent } = syntheticEvent
    this.props.setMarketplaceWebViewError(nativeEvent.description)
  }

  getUserAgent = () => {
    return Platform.OS === 'ios' ? DEFAULT_IOS_UA : DEFAULT_ANDROID_UA
  }

  render() {
    const refreshControl = (
      <RefreshControl
        enabled={this.state.enablePullToRefresh}
        refreshing={this.state.refreshing}
        onRefresh={this.onRefresh}
        {...(Platform.OS === 'android' ? this._panResponder.panHandlers : [])}
      />
    )

    return (
      <AndroidBackHandler onBackPress={this.onBack}>
        <SafeAreaView style={styles.safeAreaView}>
          <ScrollView
            contentContainerStyle={{ flex: 1 }}
            refreshControl={refreshControl}
          >
            {this.renderWebView()}
          </ScrollView>
        </SafeAreaView>
      </AndroidBackHandler>
    )
  }

  renderWebView() {
    return (
      <OriginWeb3View
        ref={this.state.webViewRef}
        onWebViewMessage={this.onWebViewMessage}
        allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
        useWebKit={Platform.OS === 'ios'}
        source={{ uri: this.state.webViewUrlTrigger }}
        onLoad={this.onWebViewLoad}
        onError={this.onWebViewError}
        onNavigationStateChange={this.onWebViewNavigationStateChange}
        renderLoading={this.renderWebViewLoading}
        decelerationRate="normal"
        userAgent={this.getUserAgent}
        startInLoadingState={true}
        renderError={this.renderWebViewError}
      />
    )
  }

  renderWebViewLoading() {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="black" />
      </View>
    )
  }

  renderWebViewError() {
    return (
      <Modal animationType="fade" transparent={true} visible={true}>
        <SafeAreaView style={styles.modalSafeAreaView}>
          <View style={styles.card}>
            <Text style={styles.cardHeading}>
              <fbt desc="MarketplaceScreen.heading">Connection Error</fbt>
            </Text>
            <Text style={styles.cardContent}>
              <fbt desc="NoInternetError.errorText">
                An error occurred loading the Origin Marketplace. Please check
                your internet connection.
              </fbt>
            </Text>
            <View style={styles.buttonContainer}>
              <OriginButton
                size="large"
                type="primary"
                title={fbt('Retry', 'MarketplaceScreen.retryButton')}
                onPress={this.onReload}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    )
  }
}

const mapStateToProps = ({ wallet, settings }) => {
  return { wallet, settings }
}

const mapDispatchToProps = dispatch => ({
  setMarketplaceReady: ready => dispatch(setMarketplaceReady(ready)),
  setMarketplaceWebViewError: error =>
    dispatch(setMarketplaceWebViewError(error))
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
  }
})
