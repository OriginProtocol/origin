'use strict'

import React from 'react'
import { connect } from 'react-redux'
import { Image, StatusBar } from 'react-native'

import {
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator
} from 'react-navigation'

import PushNotifications from './PushNotifications'

// Utility components
import AuthenticationGuard from 'components/authentication-guard'
import UpdatePrompt from 'components/update-prompt'
import BackupPrompt from 'components/backup-prompt'
import NoInternetError from 'components/no-internet-error'

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
import MarketplaceScreen from 'screens/marketplace'
import SettingsScreen from 'screens/settings'
import WalletScreen from 'screens/wallet'

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
    Settings: SettingsScreen
  },
  {
    initialRouteName: 'Settings'
  }
)

const _MarketplaceApp = createSwitchNavigator(
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
    initialRouteName: 'Main',
    defaultNavigationOptions: {
      header: null
    }
  }
)

// Extend the main app navigator to render components that prompt as well
// This is to avoid prompts coming up over other screens (i.e. auth guard)
class MarketplaceApp extends React.Component {
  static router = _MarketplaceApp.router

  componentDidMount() {
    const hasAccount = this.props.wallet.accounts.length > 0
    const hasAuthentication =
      this.props.settings.biometryType || this.props.settings.pin

    if (!hasAccount || !hasAuthentication) {
      this.props.navigation.navigate('Welcome')
    }
  }

  render() {
    if (this.props.marketplace.error) {
      return <NoInternetError />
    }

    return (
      <>
        <StatusBar />
        <AuthenticationGuard />
        <PushNotifications />
        <UpdatePrompt />
        <BackupPrompt />
        <_MarketplaceApp navigation={this.props.navigation} />
      </>
    )
  }
}

const mapStateToProps = ({ marketplace, settings, wallet }) => {
  return { marketplace, settings, wallet }
}

const App = connect(
  mapStateToProps,
  null
)(MarketplaceApp)

export default createAppContainer(App)
