'use strict'

import React from 'react'
import { Image } from 'react-native'

import {
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator
} from 'react-navigation'

// Onboarding
import WelcomeScreen from 'screens/welcome'
import ImportAccountScreen from 'screens/import'
import ImportMnemonicScreen from 'screens/importMnemonic'
import ImportPrivateKeyScreen from 'screens/importPrivateKey'
import Authentication from 'screens/authentication'
import PinScreen from 'screens/pin'

// Main screens
import AccountsScreen from 'screens/accounts'
import AccountScreen from 'screens/account'
import LanguageScreen from 'screens/language'
import CurrencyScreen from 'screens/currency'
import MarketplaceScreen from 'screens/marketplace'
import SettingsScreen from 'screens/settings'
import WalletScreen from 'screens/wallet'
import ChangePinScreen from 'screens/changePin'

// Backup screen
import BackupScreen from 'screens/backup'

const IMAGES_PATH = '../assets/images/'

const OnboardingStack = createStackNavigator(
  {
    Welcome: WelcomeScreen,
    ImportAccount: ImportAccountScreen,
    ImportMnemonic: {
      screen: ImportMnemonicScreen,
      params: {
        navigateOnSuccess: 'Authentication'
      }
    },
    ImportPrivateKey: {
      screen: ImportPrivateKeyScreen,
      params: {
        navigateOnSuccess: 'Authentication'
      }
    },
    Authentication: Authentication,
    Pin: PinScreen
  },
  {
    initialRouteName: 'Welcome',
    defaultNavigationOptions: () => {
      return {
        header: null
      }
    }
  }
)

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
    Currency: CurrencyScreen,
    Language: LanguageScreen,
    ImportAccount: ImportAccountScreen,
    ImportMnemonic: {
      screen: ImportMnemonicScreen,
      params: {
        navigateOnSuccess: 'Accounts'
      },
      navigationOptions: () => {
        return {
          header: null
        }
      }
    },
    ImportPrivateKey: {
      screen: ImportPrivateKeyScreen,
      params: {
        navigateOnSuccess: 'Accounts'
      },
      navigationOptions: () => {
        return {
          header: null
        }
      }
    },
    ChangePin: ChangePinScreen,
    Settings: SettingsScreen
  },
  {
    initialRouteName: 'Settings',
    defaultNavigationOptions: {
      headerBackTitle: null
    }
  }
)

export const Navigation = createSwitchNavigator(
  {
    Onboarding: OnboardingStack,
    Backup: BackupScreen,
    Main: createBottomTabNavigator(
      {
        Marketplace: MarketplaceScreen,
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
                <Image
                  source={require(IMAGES_PATH + 'settings-inactive.png')}
                />
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
  },
  {
    initialRouteName: 'Onboarding',
    defaultNavigationOptions: {
      header: null
    }
  }
)
