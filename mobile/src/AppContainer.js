'use strict'

import React from 'react'
import { connect } from 'react-redux'
import { StatusBar } from 'react-native'
import { createAppContainer } from 'react-navigation'
import RNSamsungBKS from 'react-native-samsung-bks'

import { Navigation } from './Navigation'
import { setSamsungBksSupported, setSamsungBksSeedHash } from 'actions/Wallet'
import PushNotifications from './PushNotifications'
import AuthenticationGuard from 'components/authentication-guard'
import UpdatePrompt from 'components/update-prompt'
import BackupPrompt from 'components/backup-prompt'
import NoInternetError from 'components/no-internet-error'

// Extend the main app navigator to render components that prompt as well
// This is to avoid prompts coming up over other screens (i.e. auth guard)
class MarketplaceApp extends React.Component {
  static router = Navigation.router

  async componentDidMount() {
    const hasAccount = this.props.wallet.accounts.length > 0

    const hasAuthentication =
      this.props.settings.biometryType || this.props.settings.pin

    // Redirect to start of onboarding if there are no accounts or authentication
    // has not been configured
    if (!hasAccount || !hasAuthentication) {
      this.props.navigation.navigate('Welcome')
    }
  }

  initSamsungBks = async () => {
    await this.props.setSamsungBksSupported()

    if (this.props.wallet.samsungBksSupported) {
      await this.props.setSamsungBksSeedHash()
      if (this.props.wallet.samsungBksSeedHash !== seedHash) {
        // Samsung Blockchain Keystore seed hash has changed, update accounts
        try {
          result = await RNSamsungBKS.getAddressList(`m/44'/60'/0'/0/0`)
        } catch (error) {
          if (error.message === 'ERROR_NETWORK_NOT_AVAILABLE') {
            // TODO
          }
        }
      }
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
        <Navigation navigation={this.props.navigation} />
      </>
    )
  }
}

const mapStateToProps = ({ marketplace, settings, wallet }) => {
  return { marketplace, settings, wallet }
}

const mapDispatchToProps = dispatch => ({
  setSamsungBksSupported: () => dispatch(setSamsungBksSupported()),
  setSamsungBksSeedHash: () => dispatch(setSamsungBksSeedHash())
})

const App = connect(
  mapStateToProps,
  mapDispatchToProps
)(MarketplaceApp)

export default createAppContainer(App)
