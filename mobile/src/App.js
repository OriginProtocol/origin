import React, { Component, Fragment } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  PushNotificationIOS,
  StyleSheet,
  View,
  YellowBox
} from 'react-native'
import { connect, Provider } from 'react-redux'

import NavigationService from './NavigationService'
import originWallet from './OriginWallet'
import Store from './Store'
import {
  storeNotificationsPermissions,
  updateBackupWarningStatus,
  updateCarouselStatus
} from 'actions/Activation'
import { add as addNotification } from 'actions/Notification'
import { init, updateAccounts } from 'actions/Wallet'
import {
  newEvent,
  updateEvent,
  processedEvent,
  setActiveEvent
} from 'actions/WalletEvents'
import Onboarding from 'components/onboarding'
import { loadData } from './tools'
import { OriginNavigator, OnboardingStack } from './Navigation'
import { EVENTS } from './constants'

const IMAGES_PATH = '../assets/images/'

YellowBox.ignoreWarnings([
  // https://github.com/facebook/react-native/issues/18868
  'Warning: isMounted(...) is deprecated',
  // https://github.com/facebook/react-native/issues/17504
  'Module RCTImageLoader requires main queue setup'
])

class OriginNavWrapper extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.checkPermissions(permissions => {
        this.props.storeNotificationsPermissions(permissions)
      })
    }

    originWallet.events.on(EVENTS.LOADED, () => {
      console.log('Loaded')
      this.setState({ loading: false })
    })

    originWallet.events.on(EVENTS.AVAILABLE_ACCOUNTS, ({ accounts }) => {
      console.log('Updating accounts')
      this.props.updateAccounts(accounts)
    })

    originWallet.events.on(EVENTS.CURRENT_ACCOUNT, ({ address }) => {
      console.log('Initialising accounts')
      this.props.initWallet(address)
    })

    originWallet.open()
  }

  componentDidUpdate() {
    const { activation, wallet } = this.props

    // Prompt with private key backup warning if funds are detected
    if (!activation.backupWarningDismissed && Number(wallet.balances.eth) > 0) {
      NavigationService.navigate('Home', {
        backupWarning: true,
        walletExpanded: true
      })
    }
  }

  componentWillUnmount() {
    originWallet.closeWallet()
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )
    }

    return this.props.wallet.address ? (
      <OriginNavigator
        ref={navigatorRef =>
          NavigationService.setTopLevelNavigator(navigatorRef)
        }
      />
    ) : (
      <OnboardingStack screenProps={{ smallScreen: this.props.smallScreen }} />
    )
  }
}

class OriginWrapper extends Component {
  constructor(props) {
    super(props)

    this.handleNotifications = this.handleNotifications.bind(this)
    this.state = { loading: true }
  }

  async componentDidMount() {
    const completed = await loadData('carouselCompleted')
    const dismissed = await loadData('backupWarningDismissed')

    this.props.updateBackupWarningStatus(!!dismissed)
    this.props.updateCarouselStatus(!!completed)

    this.setState({ loading: false })
  }

  async handleNotifications() {
    try {
      const permissions = await originWallet.requestNotifications()

      this.props.storeNotificationsPermissions(permissions)

      this.props.updateCarouselStatus(true)
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  render() {
    const { activation } = this.props
    const { loading } = this.state
    const { carouselCompleted } = activation
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812

    return loading ? (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="white" />
      </View>
    ) : (
      <Fragment>
        {!carouselCompleted && (
          <Onboarding
            onCompletion={() => this.props.updateCarouselStatus(true)}
            onEnable={this.handleNotifications}
            pages={[
              {
                image: (
                  <Image
                    resizeMethod={'scale'}
                    resizeMode={'contain'}
                    source={require(IMAGES_PATH + 'carousel-1.png')}
                    style={[styles.image, smallScreen ? { height: '33%' } : {}]}
                  />
                ),
                title: 'Store & Use Crypto',
                subtitle:
                  'Origin Wallet allows you to store cryptocurrency to buy and sell on the Origin platform.'
              },
              {
                image: (
                  <Image
                    resizeMethod={'scale'}
                    resizeMode={'contain'}
                    source={require(IMAGES_PATH + 'carousel-2.png')}
                    style={[styles.image, smallScreen ? { height: '33%' } : {}]}
                  />
                ),
                title: 'Message Buyers & Sellers',
                subtitle:
                  'You can communicate with other users of the Origin platform in a secure and decentralized way.'
              },
              {
                image: (
                  <Image
                    resizeMethod={'scale'}
                    resizeMode={'contain'}
                    source={require(IMAGES_PATH + 'carousel-3.png')}
                    style={[styles.image, smallScreen ? { height: '33%' } : {}]}
                  />
                ),
                title: 'Stay Up-To-Date',
                subtitle:
                  'Get timely updates about new messages or activity on your listings and purchases.'
              }
            ]}
          />
        )}
        {carouselCompleted && (
          <OriginNavWrapper {...this.props} smallScreen={smallScreen} />
        )}
      </Fragment>
    )
  }
}

const mapStateToProps = ({ activation, wallet }) => {
  return {
    activation,
    wallet
  }
}

const mapDispatchToProps = dispatch => ({
  addNotification: notification => dispatch(addNotification(notification)),
  initWallet: address => dispatch(init(address)),
  newEvent: (matcher, event) => dispatch(newEvent(matcher, event)),
  processedEvent: (matcher, update, newEvent) =>
    dispatch(processedEvent(matcher, update, newEvent)),
  setActiveEvent: event => dispatch(setActiveEvent(event)),
  storeNotificationsPermissions: permissions =>
    dispatch(storeNotificationsPermissions(permissions)),
  updateAccounts: accounts => dispatch(updateAccounts(accounts)),
  updateBackupWarningStatus: bool => dispatch(updateBackupWarningStatus(bool)),
  updateCarouselStatus: bool => dispatch(updateCarouselStatus(bool)),
  updateEvent: (matcher, update) => dispatch(updateEvent(matcher, update))
})

const OriginWallet = connect(
  mapStateToProps,
  mapDispatchToProps
)(OriginWrapper)

const styles = StyleSheet.create({
  image: {
    marginBottom: '10%'
  },
  loading: {
    backgroundColor: '#293f55',
    flex: 1,
    justifyContent: 'space-around'
  }
})

export default class OriginApp extends Component {
  render() {
    return (
      <Provider store={Store}>
        <OriginWallet />
      </Provider>
    )
  }
}
