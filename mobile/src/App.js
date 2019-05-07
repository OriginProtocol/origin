'use strict'

import React, { Component } from 'react'
import { Image, YellowBox } from 'react-native'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import {
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator
} from 'react-navigation'

import OriginWallet from './OriginWallet'
import PushNotifications from './PushNotifications'
import Store, { persistor } from './Store'
import StackSelector from './StackSelector'
import AccountsScreen from 'screens/accounts'
import AccountScreen from 'screens/account'
import MarketplaceScreen from 'screens/marketplace'
import SettingsScreen from 'screens/settings'
import WalletScreen from 'screens/wallet'
// Onboarding
import WelcomeScreen from 'screens/onboarding/welcome'
import EmailScreen from 'screens/onboarding/email'
import Authentication from 'screens/onboarding/authentication'
import PinScreen from 'screens/onboarding/pin'
import Loading from 'components/loading'

const IMAGES_PATH = '../assets/images/'

YellowBox.ignoreWarnings([
  // https://github.com/facebook/react-native/issues/18868
  'Warning: isMounted(...) is deprecated',
  // https://github.com/facebook/react-native/issues/17504
  'Module RCTImageLoader requires main queue setup'
])

const OnboardingStack = createSwitchNavigator(
  {
    Welcome: WelcomeScreen,
    Email: EmailScreen,
    Authentication: Authentication,
    Pin: PinScreen
  },
  {
    initialRouteName: 'Welcome'
  }
)

const MarketplaceStack = createStackNavigator({
  Marketplace: MarketplaceScreen
})

const WalletStack = createStackNavigator(
  {
    Wallet: WalletScreen
  },
  {
    cardStyle: {
      backgroundColor: '#f7f8f8'
    }
  }
)

const SettingsStack = createStackNavigator(
  {
    Account: AccountScreen,
    Accounts: AccountsScreen,
    Settings: SettingsScreen
  },
  {
    initialRouteName: 'Settings'
  }
)

const OriginMarketplaceApp = createBottomTabNavigator(
  {
    Marketplace: MarketplaceStack,
    Wallet: WalletStack,
    Settings: SettingsStack
  },
  {
    initialRouteName: 'Marketplace',
    order: ['Marketplace', 'Wallet', 'Settings'],
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state

        // require expects string literal :(
        if (routeName === 'Marketplace') {
          return focused ? (
            <Image source={require(IMAGES_PATH + 'market-active.png')} />
          ) : (
            <Image source={require(IMAGES_PATH + 'market-inactive.png')} />
          )
        } else if (routeName === 'Wallet') {
          return focused ? (
            <Image source={require(IMAGES_PATH + 'wallet-active.png')} />
          ) : (
            <Image source={require(IMAGES_PATH + 'wallet-inactive.png')} />
          )
        } else if (routeName === 'Settings') {
          return focused ? (
            <Image source={require(IMAGES_PATH + 'settings-active.png')} />
          ) : (
            <Image source={require(IMAGES_PATH + 'settings-inactive.png')} />
          )
        }
      }
    }),
    tabBarOptions: {
      activeTintColor: '#007fff',
      iconStyle: {
        marginTop: 10
      },
      inactiveTintColor: '#c0cbd4',
      showLabel: false,
      style: {
        backgroundColor: 'white'
      },
      tabStyle: {
        justifyContent: 'space-around'
      }
    }
  }
)

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      StackSelector: StackSelector,
      Welcome: WelcomeScreen,
      Onboarding: OnboardingStack,
      App: OriginMarketplaceApp
    },
    {
      initialRouteName: 'StackSelector'
    }
  )
)

class App extends Component {
  render() {
    return (
      <ReduxProvider store={Store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <OriginWallet />
          <PushNotifications />
          <AppContainer />
        </PersistGate>
      </ReduxProvider>
    )
  }
}

export default App
