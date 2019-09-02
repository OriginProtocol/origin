'use strict'

import React from 'react'
import { connect } from 'react-redux'
import { StatusBar } from 'react-native'
import { createAppContainer } from 'react-navigation'

import { Navigation } from './Navigation'
import PushNotifications from './PushNotifications'
import AuthenticationGuard from 'components/authentication-guard'
import UpdatePrompt from 'components/update-prompt'
import BackupPrompt from 'components/backup-prompt'

class MarketplaceApp extends React.Component {
  static router = Navigation.router

  async componentDidMount() {
    const { biometryType, pin } = this.props.settings
    const hasAuthentication = biometryType || pin
    const hasAccount = this.props.wallet.accounts.length > 0
    // Redirect to start of onboarding if there are no accounts or authentication
    // has not been configured
    if (!hasAccount || !hasAuthentication) {
      this.props.navigation.navigate('Welcome')
    }
  }

  render() {
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

const mapStateToProps = ({ settings, wallet }) => {
  return { settings, wallet }
}

const App = connect(
  mapStateToProps,
  null
)(MarketplaceApp)

export default createAppContainer(App)
