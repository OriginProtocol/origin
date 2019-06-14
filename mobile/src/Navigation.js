'use strict'

import React from 'react'
import { connect } from 'react-redux'
import { Image, Modal } from 'react-native'
import {
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator,
  HeaderBackButton
} from 'react-navigation'

import PushNotifications from './PushNotifications'
// Utilities
import AuthenticationGuard from 'components/authentication-guard'
import UpdatePrompt from 'components/update-prompt'
import BackupPrompt from 'components/backup-prompt'
import Loading from 'components/loading'
import { setComplete } from 'actions/Onboarding'
// Onboarding
import WelcomeScreen from 'screens/onboarding/welcome'
import ImportAccountScreen from 'screens/import'
import ImportMnemonicScreen from 'screens/importMnemonic'
import ImportPrivateKeyScreen from 'screens/importPrivateKey'
import ImportWarningScreen from 'screens/importWarning'
import ImportedScreen from 'screens/onboarding/imported'
import Authentication from 'screens/onboarding/authentication'
import PinScreen from 'screens/onboarding/pin'
import EmailScreen from 'screens/onboarding/email'
import PhoneScreen from 'screens/onboarding/phone'
import NameScreen from 'screens/onboarding/name'
import AvatarScreen from 'screens/onboarding/avatar'
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
import { getNextOnboardingStep } from 'utils/user'

const IMAGES_PATH = '../assets/images/'

const OnboardingStack = createStackNavigator(
  {
    Welcome: {
      screen: WelcomeScreen,
      navigationOptions: () => ({
        header: null
      })
    },
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
    Authentication: Authentication,
    Pin: PinScreen,
    Ready: ReadyScreen
  },
  {
    defaultNavigationOptions: ({ navigation }) => {
      const { params = {} } = navigation.state
      return {
        headerStyle: {
          borderBottomWidth: 0
        },
        headerBackTitle: null,
        // Allow components to override the back button function by setting a
        // handleBack function as a navigation param e.g:
        // this.props.navigation.setParams({ handleBack: this.handleBack.bind(this) })
        headerLeft: (
          <HeaderBackButton
            onPress={() => {
              params.handleBack ? params.handleBack() : navigation.goBack(null)
            }}
          />
        )
      }
    }
  }
)

const BackupStack = createSwitchNavigator(
  {
    BackupAuth: {
      screen: AuthenticationGuard,
      params: {
        navigateOnSuccess: 'Backup'
      }
    },
    Backup: BackupScreen
  },
  {
    initialRouteName: !__DEV__ ? 'BackupAuth' : 'Backup'
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
    Account: createSwitchNavigator(
      {
        AccountAuth: {
          screen: AuthenticationGuard,
          params: {
            navigateOnSuccess: 'Account'
          }
        },
        Account: AccountScreen
      },
      {
        initialRouteName: !__DEV__ ? 'AccountAuth' : 'Account'
      }
    ),
    Accounts: AccountsScreen,
    Language: LanguageScreen,
    ImportAccount: ImportAccountScreen,
    ImportMnemonic: {
      screen: ImportMnemonicScreen,
      params: {
        navigateOnSuccess: 'Accounts'
      }
    },
    ImportPrivateKey: {
      screen: ImportPrivateKeyScreen,
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

  componentDidUpdate(prevProps) {
    if (!prevProps.marketplace.ready && this.props.marketplace.ready) {
      // We can't use the withOnboardingSteps HOC here because it isn't
      // compatible with react-navigation navigators
      const nextOnboardingStep = getNextOnboardingStep(
        this.props.onboarding,
        this.props.settings
      )
      if (
        nextOnboardingStep &&
        !this.props.onboarding.complete &&
        nextOnboardingStep !== 'Ready'
      ) {
        this.props.navigation.navigate('Welcome')
      } else if (
        ((this.props.settings.pin && this.props.settings.pin.length > 0) ||
          this.props.settings.biometryType) &&
        !__DEV__
      ) {
        this.props.setOnboardingComplete(true)
        this.props.navigation.navigate('Auth')
      }
    }
  }

  render() {
    const { navigation } = this.props
    let loadingText = 'Loading marketplace...'
    let activityIndicator = true
    let errorText = false
    if (this.props.marketplace.error) {
      errorText =
        'An error occurred loading the Origin Marketplace. Please check your internet connection.'
      loadingText = false
      activityIndicator = false
    }
    return (
      <>
        <PushNotifications />
        <UpdatePrompt />
        <BackupPrompt />
        <_MarketplaceApp navigation={navigation} />
        <Modal visible={!this.props.marketplace.ready}>
          <Loading
            loadingText={loadingText}
            activityIndicator={activityIndicator}
            errorText={errorText}
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

export default createAppContainer(
  createStackNavigator(
    {
      Auth: {
        screen: AuthenticationGuard,
        params: {
          navigateOnSuccess: 'App'
        }
      },
      App: connect(
        mapStateToProps,
        mapDispatchToProps
      )(MarketplaceApp),
      GuardedBackup: BackupStack,
      Onboarding: OnboardingStack
    },
    {
      initialRouteName: 'App',
      defaultNavigationOptions: {
        header: null
      },
      // Remove the transition on the switch navigator as it makes it clearer
      // that the DApp webview loads first
      transitionConfig: () => ({
        transitionSpec: {
          duration: 0 // Set the animation duration time as 0
        }
      })
    }
  )
)
