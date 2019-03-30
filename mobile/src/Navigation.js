import React from 'react'
import { Image } from 'react-native'
import {
  createBottomTabNavigator,
  createStackNavigator
} from 'react-navigation'

import DevicesScreen from 'screens/devices'
import ForkScreen from 'screens/fork'
import HomeScreen from 'screens/home'
import MarketplaceScreen from 'screens/marketplace'
import ProfileScreen from 'screens/profile'
import ScanScreen from 'screens/scan'
import SettingsScreen from 'screens/settings'
import TransactionScreen from 'screens/transaction'
import WalletFundingScreen from 'screens/wallet-funding'
import AccountsScreen from 'screens/accounts'
import AccountScreen from 'screens/account'

const IMAGES_PATH = '../assets/images/'

const navigationOptions = () => ({
  headerBackTitle: ' ',
  headerStyle: {
    backgroundColor: 'white'
  }
})

const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
    Profile: ProfileScreen,
    Transaction: TransactionScreen,
    WalletFunding: WalletFundingScreen
  },
  {
    navigationOptions
  }
)

const MarketplaceStack = createStackNavigator(
  {
    Marketplace: MarketplaceScreen
  },
  {
    navigationOptions
  }
)

const ScanStack = createStackNavigator(
  {
    Scan: ScanScreen
  },
  {
    navigationOptions
  }
)

const SettingsStack = createStackNavigator(
  {
    Account: AccountScreen,
    Accounts: AccountsScreen,
    Devices: DevicesScreen,
    Settings: SettingsScreen
  },
  {
    initialRouteName: 'Settings',
    navigationOptions
  }
)

const OnboardingStack = createStackNavigator(
  {
    Fork: ForkScreen
  },
  {
    initialRouteName: 'Fork',
    navigationOptions: () => ({
      headerBackTitle: ' ',
      headerStyle: {
        backgroundColor: '#293f55',
        borderBottomWidth: 0
      },
      headerTitleStyle: {
        color: 'white',
        fontFamily: 'Poppins',
        fontSize: 17,
        fontWeight: 'normal'
      }
    })
  }
)

const OriginNavigator = createBottomTabNavigator(
  {
    Home: HomeStack,
    Marketplace: MarketplaceStack,
    Scan: ScanStack,
    Settings: SettingsStack
  },
  {
    initialRouteName: 'Home',
    order: ['Home', 'Marketplace', 'Scan', 'Settings'],
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state

        // require expects string literal :(
        if (routeName === 'Home') {
          return focused ? (
            <Image source={require(IMAGES_PATH + 'wallet-active.png')} />
          ) : (
            <Image source={require(IMAGES_PATH + 'wallet-inactive.png')} />
          )
        } else if (routeName === 'Marketplace') {
          return focused ? (
            <Image source={require(IMAGES_PATH + 'market-active.png')} />
          ) : (
            <Image source={require(IMAGES_PATH + 'market-inactive.png')} />
          )
        } else if (routeName === 'Scan') {
          return focused ? (
            <Image source={require(IMAGES_PATH + 'scan-active.png')} />
          ) : (
            <Image source={require(IMAGES_PATH + 'scan-inactive.png')} />
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

export {
  HomeStack,
  MarketplaceStack,
  SettingsStack,
  ScanStack,
  OnboardingStack,
  OriginNavigator
}
