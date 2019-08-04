'use strict'

import React from 'react'
import { connect } from 'react-redux'
import { Image, Modal } from 'react-native'

import {
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator
} from 'react-navigation'

import PushNotifications from './PushNotifications'

// Utility components
import AuthenticationGuard from 'components/authentication-guard'
import UpdatePrompt from 'components/update-prompt'
import BackupPrompt from 'components/backup-prompt'
import Loading from 'components/loading'
import NoInternetError from 'components/no-internet-error'
import { setComplete } from 'actions/Onboarding'

// Onboarding
import WelcomeScreen from 'screens/onboarding/welcome'
import ImportAccountScreen from 'screens/import'
import ImportMnemonicScreen from 'screens/importMnemonic'
import ImportPrivateKeyScreen from 'screens/importPrivateKey'
import ImportWarningScreen from 'screens/importWarning'
import ImportedScreen from 'screens/onboarding/imported'
import EmailScreen from 'screens/onboarding/email'
import PhoneScreen from 'screens/onboarding/phone'
import NameScreen from 'screens/onboarding/name'
import AvatarScreen from 'screens/onboarding/avatar'
import GrowthScreen from 'screens/onboarding/growth'
import GrowthTermsScreen from 'screens/onboarding/growth-terms'
import Authentication from 'screens/onboarding/authentication'
import PinScreen from 'screens/onboarding/pin'
import ReadyScreen from 'screens/onboarding/ready'

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
        navigateOnSuccess: 'Imported'
      }
    },
    ImportPrivateKey: {
      screen: ImportPrivateKeyScreen,
      params: {
        navigateOnSuccess: 'Imported'
      }
    },
    Imported: ImportedScreen,
    ImportWarning: ImportWarningScreen,
    Email: EmailScreen,
    Phone: PhoneScreen,
    Name: NameScreen,
    Avatar: AvatarScreen,
    Growth: GrowthScreen,
    GrowthTerms: GrowthTermsScreen,
    Authentication: Authentication,
    Pin: PinScreen,
    Ready: ReadyScreen
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

const _MarketplaceApp = createStackNavigator(
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
    // Initial route must be main to force loading of WebView so that onboarding
    // can use it for GraphQL queries via `window.gql`
    initialRouteName: 'Main',
    defaultNavigationOptions: {
      header: null
    },
    // Remove the transition on the stack navigator as it makes it clearer
    // that the DApp WebView loads first
    transitionConfig: () => ({
      transitionSpec: {
        duration: 0 // Set the animation duration time as 0
      }
    })
  }
)

// Extend the main app navigator to render components that prompt as well
// This is to avoid prompts coming up over other screens (i.e. auth guard)
class MarketplaceApp extends React.Component {
  static router = _MarketplaceApp.router

  componentDidUpdate(prevProps) {
    // Wait for marketplace to become available
    if (!prevProps.marketplace.ready && this.props.marketplace.ready) {
      // Onboarding complete, nothing to do here
      if (!this.props.onboarding.complete) {
        // Some onboarding still to do, start with onboarding welcome
        this.props.navigation.navigate('Onboarding')
      }
    }
  }

  render() {
    const { navigation } = this.props
    let loadingText = 'Loading marketplace...'
    let activityIndicator = true
    let errorComponent = false

    if (this.props.marketplace.error) {
      errorComponent = (
        <NoInternetError
          errorTextStyle={{ color: 'white' }}
          buttonType="white"
        />
      )
      loadingText = false
      activityIndicator = false
    }

    return (
      <>
        <AuthenticationGuard />
        <PushNotifications />
        <UpdatePrompt />
        <BackupPrompt />

        <_MarketplaceApp navigation={navigation} />

        <Modal visible={!this.props.marketplace.ready}>
          <Loading
            loadingText={loadingText}
            activityIndicator={activityIndicator}
            errorComponent={errorComponent}
          />
        </Modal>
      </>
    )
  }
}

const mapStateToProps = ({ onboarding, marketplace, settings }) => {
  return { onboarding, marketplace, settings }
}

const mapDispatchToProps = dispatch => ({
  setOnboardingComplete: complete => dispatch(setComplete(complete))
})

const App = connect(
  mapStateToProps,
  mapDispatchToProps
)(MarketplaceApp)

export default createAppContainer(App)
