'use strict'

import React from 'react'
import { Image } from 'react-native'
import {
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator
} from 'react-navigation'

import PushNotifications from './PushNotifications'
import StackSelector from './StackSelector'
import UpdatePrompt from 'components/update-prompt'
import AccountsScreen from 'screens/accounts'
import AccountScreen from 'screens/account'
import BackupPrompt from 'components/backup-prompt'
import BackupScreen from 'screens/backup'
import ImportAccountScreen from 'screens/import'
import LanguageScreen from 'screens/language'
import MarketplaceScreen from 'screens/marketplace'
import SettingsScreen from 'screens/settings'
import WalletScreen from 'screens/wallet'
import AuthenticationGuard from 'components/authentication-guard'
// Onboarding
import WelcomeScreen from 'screens/onboarding/welcome'
import Authentication from 'screens/onboarding/authentication'
import PinScreen from 'screens/onboarding/pin'
import EmailScreen from 'screens/onboarding/email'
import NameScreen from 'screens/onboarding/name'
import ProfileImageScreen from 'screens/onboarding/profile-image'
import ReadyScreen from 'screens/onboarding/ready'

const IMAGES_PATH = '../assets/images/'

const OnboardingStack = createSwitchNavigator(
  {
    Welcome: WelcomeScreen,
    ImportAccount: {
      screen: ImportAccountScreen,
      params: {
        navigateOnSuccess: 'Authentication',
        cancelRoute: 'Welcome'
      }
    },
    Email: EmailScreen,
    Name: NameScreen,
    ProfileImage: ProfileImageScreen,
    Authentication: Authentication,
    Pin: PinScreen,
    Ready: ReadyScreen
  },
  {
    initialRouteName: 'Welcome'
  }
)

const BackupStack = createSwitchNavigator(
  {
    Auth: {
      screen: AuthenticationGuard,
      params: {
        navigateOnSuccess: 'Backup'
      }
    },
    Backup: BackupScreen
  },
  {
    initialRouteName: 'Auth'
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
    Account: createSwitchNavigator(
      {
        Auth: {
          screen: AuthenticationGuard,
          params: {
            navigateOnSuccess: 'Account'
          }
        },
        Account: AccountScreen
      },
      {
        initialRouteName: 'Auth'
      }
    ),
    Accounts: AccountsScreen,
    Language: LanguageScreen,
    ImportAccount: {
      screen: ImportAccountScreen,
      params: {
        navigateOnSuccess: 'Accounts'
      }
    },
    Settings: SettingsScreen
  },
  {
    initialRouteName: 'Settings'
  }
)

const _MarketplaceApp = createBottomTabNavigator(
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

// Extend the main app navigator to render components that prompt as well
// This is to avoid prompts coming up over other screens (i.e. auth guard)
class MarketplaceApp extends React.Component {
  static router = _MarketplaceApp.router
  render() {
    const { navigation } = this.props
    return (
      <>
        <PushNotifications />
        <UpdatePrompt />
        <BackupPrompt />
        <_MarketplaceApp navigation={navigation} />
      </>
    )
  }
}

export default createAppContainer(
  createSwitchNavigator(
    {
      StackSelector: StackSelector,
      Welcome: WelcomeScreen,
      Onboarding: OnboardingStack,
      GuardedBackup: BackupStack,
      GuardedApp: createSwitchNavigator(
        {
          Auth: {
            screen: AuthenticationGuard,
            params: {
              navigateOnSuccess: 'App'
            }
          },
          App: MarketplaceApp
        },
        {
          initialRouteName: 'Auth'
        }
      )
    },
    {
      initialRouteName: 'StackSelector'
    }
  )
)
