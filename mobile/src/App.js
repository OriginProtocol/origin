import React, { Component, Fragment } from 'react'
import { ActivityIndicator, Alert, Dimensions, Image, Platform, PushNotificationIOS, StyleSheet, View, YellowBox } from 'react-native'
import { createBottomTabNavigator, createStackNavigator } from 'react-navigation'
import { connect, Provider } from 'react-redux'

import NavigationService from './NavigationService'
import originWallet, { Events } from './OriginWallet'
import Store from './Store'

import { storeNotificationsPermissions, updateBackupWarningStatus, updateCarouselStatus } from 'actions/Activation'
import { setDevices } from 'actions/Devices'
import { add as addNotification } from 'actions/Notification'
import { fetchUser } from 'actions/User'
import { getBalance, init, updateAccounts } from 'actions/Wallet'
import { newEvent, updateEvent, processedEvent, setActiveEvent } from 'actions/WalletEvents'

import Onboarding from 'components/onboarding'

import DevicesScreen from 'screens/devices'
import ForkScreen from 'screens/fork'
import HomeScreen from 'screens/home'
import MarketplaceScreen from 'screens/marketplace'
import ProfileScreen from 'screens/profile'
import ScanScreen from 'screens/scan'
import SettingsScreen from 'screens/settings'
import TransactionScreen from 'screens/transaction'
import WalletFundingScreen from 'screens/wallet-funding'
import AccountScreen from 'screens/account'
import AccountsScreen from 'screens/accounts'

import { loadData } from './tools'

const IMAGES_PATH = '../assets/images/'

YellowBox.ignoreWarnings([
  // https://github.com/facebook/react-native/issues/18868
  'Warning: isMounted(...) is deprecated',
  // https://github.com/facebook/react-native/issues/17504
  'Module RCTImageLoader requires main queue setup'
])

const navigationOptions = ({ navigation }) => ({
  headerBackTitle: ' ',
  headerStyle: {
    backgroundColor: 'white',
  },
})

const HomeStack = createStackNavigator({
  Home: HomeScreen,
  Profile: ProfileScreen,
  Transaction: TransactionScreen,
  WalletFunding: WalletFundingScreen,
}, {
  navigationOptions,
})

const MarketplaceStack = createStackNavigator({
  Marketplace: MarketplaceScreen,
}, {
  navigationOptions,
})

const ScanStack = createStackNavigator({
  Scan: ScanScreen,
}, {
  navigationOptions,
})

const SettingsStack = createStackNavigator({
  Account: AccountScreen,
  Accounts: AccountsScreen,
  Devices: DevicesScreen,
  Settings: SettingsScreen,
}, {
  initialRouteName: 'Settings',
  navigationOptions,
})

const OnboardingStack = createStackNavigator({
  Fork: ForkScreen,
}, {
  initialRouteName: 'Fork',
  navigationOptions: ({ navigation }) => ({
    headerBackTitle: ' ',
    headerStyle: {
      backgroundColor: '#293f55',
      borderBottomWidth: 0,
    },
    headerTitleStyle: {
      color: 'white',
      fontFamily: 'Poppins',
      fontSize: 17,
      fontWeight: 'normal',
    },
  }),
})

const OriginNavigator = createBottomTabNavigator({
  Home: HomeStack,
  Marketplace: MarketplaceStack,
  Scan: ScanStack,
  Settings: SettingsStack,
}, {
  initialRouteName: 'Home',
  order: ['Home', 'Marketplace', 'Scan', 'Settings'],
  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused, tintColor }) => {
      const { routeName } = navigation.state

      // require expects string literal :(
      if (routeName === 'Home') {
        return focused ?
          <Image source={require(IMAGES_PATH + 'wallet-active.png')} /> :
          <Image source={require(IMAGES_PATH + 'wallet-inactive.png')} />
      } else if (routeName === 'Marketplace') {
        return focused ?
          <Image source={require(IMAGES_PATH + 'market-active.png')} /> :
          <Image source={require(IMAGES_PATH + 'market-inactive.png')} />
      } else if (routeName === 'Scan') {
        return focused ?
          <Image source={require(IMAGES_PATH + 'scan-active.png')} /> :
          <Image source={require(IMAGES_PATH + 'scan-inactive.png')} />
      } else if (routeName === 'Settings') {
        return focused ?
          <Image source={require(IMAGES_PATH + 'settings-active.png')} /> :
          <Image source={require(IMAGES_PATH + 'settings-inactive.png')} />
      }
    },
  }),
  tabBarOptions: {
    activeTintColor: '#007fff',
    iconStyle: {
      marginTop: 10,
    },
    inactiveTintColor: '#c0cbd4',
    showLabel: false,
    style: {
      backgroundColor: 'white',
    },
    tabStyle: {
      justifyContent: 'space-around',
    },
  },
})

// Origin Nav wrapper
class OriginNavWrapper extends Component {
  constructor(props) {
    super(props)

    this.balancePoll = null

    this.state = {
      loading: true,
    }
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.checkPermissions(permissions => {
        this.props.storeNotificationsPermissions(permissions)
      })
    }

    originWallet.initNotifications()
    // skip the prompt
    // originWallet.events.on(Events.PROMPT_LINK, (data, matcher) => {
      // this.props.newEvent(matcher, data)
      // this.props.setActiveEvent(data)
      // NavigationService.navigate('Home')
    // })

    originWallet.events.on(Events.LOADED, () => {
      this.setState({ loading: false })
    })

    originWallet.events.on(Events.PROMPT_TRANSACTION, (data, matcher) => {
      this.props.newEvent(matcher, data)
      // this.props.setActiveEvent(data)
      NavigationService.navigate('Home')
    })

    originWallet.events.on(Events.PROMPT_SIGN, (data, matcher) => {
      this.props.newEvent(matcher, data)
      // this.props.setActiveEvent(data)
      NavigationService.navigate('Home')
    })

    originWallet.events.on(Events.CURRENT_ACCOUNT, ({ address }, matcher) => {
      this.props.initWallet(address)
      this.props.fetchUser(address)
      this.props.getBalance()

      if (!this.balancePoll) {
        // get the balance every five seconds
        this.balancePoll = setInterval(() => this.props.getBalance(), 5000)
      }
    })

    originWallet.events.on(Events.AVAILABLE_ACCOUNTS, ({ accounts }, matcher) => {
      this.props.updateAccounts(accounts)
    })

    originWallet.events.on(Events.LINKED, (data, matcher) => {
      this.props.processedEvent(matcher, {}, data)
      NavigationService.navigate('Home')
    })

    originWallet.events.on(Events.TRANSACTED, (data, matcher) => {
      this.props.processedEvent(matcher, { status: 'completed' }, data)
      this.props.getBalance()
      NavigationService.navigate('Home')
    })

    originWallet.events.on(Events.UNLINKED, (data, matcher) => {
      originWallet.getDevices()
      this.props.updateEvent(matcher, { linked: false })
    })

    originWallet.events.on(Events.REJECT, (data, matcher) => {
      this.props.processedEvent(matcher, { status: 'rejected' }, data)
      NavigationService.navigate('Home')
    })

    originWallet.events.on(Events.LINKS, (devices) => {
      this.props.setDevices(devices)
    })

    originWallet.events.on(Events.UPDATE, () => {
      this.props.getBalance()
    })

    originWallet.events.on(Events.NEW_MESSAGE, () => {
      // TODO: show indicator of new message here
    })

    originWallet.events.on(Events.SHOW_MESSAGES, () => {
      NavigationService.navigate('Marketplace')
    })

    originWallet.events.on(Events.NOTIFICATION, notification => {
      this.props.addNotification({
        id: notification.data.notificationId,
        message: notification.message.body,
        url: notification.data.url,
      })
    })

    originWallet.openWallet()
  }

  componentDidUpdate() {
    const { activation, wallet } = this.props

    // prompt with private key backup warning if funds are detected
    if (!activation.backupWarningDismissed && Number(wallet.balances.eth) > 0) {
      NavigationService.navigate('Home', {
        backupWarning: true,
        walletExpanded: true,
      })
    }
  }

  componentWillUnmount() {
    originWallet.closeWallet()

    clearInterval(this.balancePoll)
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )
    }

    return this.props.wallet.address ?
      <OriginNavigator ref={navigatorRef =>
        NavigationService.setTopLevelNavigator(navigatorRef)
      } /> :
      <OnboardingStack screenProps={{ smallScreen: this.props.smallScreen }} />
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
    } catch(e) {
      console.error(e)
      throw e
    }
  }

  render() {
    const { activation, updateCarouselStatus } = this.props
    const { loading } = this.state
    const { carouselCompleted } = activation
    const { height, width } = Dimensions.get('window')
    const smallScreen = height < 812

    return loading ?
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="white" />
      </View> :
      <Fragment>
        {!carouselCompleted &&
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
                subtitle: 'Origin Wallet allows you to store cryptocurrency to buy and sell on the Origin platform.',
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
                subtitle: 'You can communicate with other users of the Origin platform in a secure and decentralized way.',
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
                subtitle: 'Get timely updates about new messages or activity on your listings and purchases.',
              },
            ]}
          />
        }
        {carouselCompleted &&
          <OriginNavWrapper {...this.props} smallScreen={smallScreen} />
        }
      </Fragment>
  }
}

const mapStateToProps = ({ activation, wallet }) => {
  return {
    activation,
    wallet,
  }
}

const mapDispatchToProps = dispatch => ({
  addNotification: notification => dispatch(addNotification(notification)),
  fetchUser: address => dispatch(fetchUser(address)),
  getBalance: () => dispatch(getBalance()),
  initWallet: address => dispatch(init(address)),
  newEvent: (matcher, event) => dispatch(newEvent(matcher, event)),
  processedEvent: (matcher, update, new_event) => dispatch(processedEvent(matcher, update, new_event)),
  setActiveEvent: event => dispatch(setActiveEvent(event)),
  setDevices: devices => dispatch(setDevices(devices)),
  storeNotificationsPermissions: permissions => dispatch(storeNotificationsPermissions(permissions)),
  updateAccounts: accounts => dispatch(updateAccounts(accounts)),
  updateBackupWarningStatus: bool => dispatch(updateBackupWarningStatus(bool)),
  updateCarouselStatus: bool => dispatch(updateCarouselStatus(bool)),
  updateEvent: (matcher, update) => dispatch(updateEvent(matcher, update)),
})

const OriginWallet = connect(mapStateToProps, mapDispatchToProps)(OriginWrapper)

const styles = StyleSheet.create({
  image: {
    marginBottom: '10%',
  },
  loading: {
    backgroundColor: '#293f55',
    flex: 1,
    justifyContent: 'space-around',
  },
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
