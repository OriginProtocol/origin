'use strict'

import React from 'react'
import { connect } from 'react-redux'
import { StatusBar } from 'react-native'
import { createAppContainer } from 'react-navigation'
import get from 'lodash.get'

import { Navigation } from './Navigation'
import { updateExchangeRate } from 'utils/price'
import { findBestAvailableCurrency } from 'utils/currencies'
import PushNotifications from './PushNotifications'
import AuthenticationGuard from 'components/authentication-guard'
import UpdatePrompt from 'components/update-prompt'
import BackupPrompt from 'components/backup-prompt'

const EXCHANGE_RATE_POLL_INTERVAL = 60 * 10 * 1000

class MarketplaceApp extends React.Component {
  static router = Navigation.router

  componentDidMount = async () => {
    const { biometryType, pin } = this.props.settings
    const hasAuthentication = biometryType || pin
    const hasAccount = this.props.wallet.accounts.length > 0
    if (!hasAuthentication || !hasAccount) {
      this.props.navigation.navigate('Welcome')
    }

    // Update exchange rates at a regular interval
    this.updateExchangeRates = () => {
      const fiatCurrency =
        this.props.settings.currency || findBestAvailableCurrency()
      console.debug('Updating exchange rates for', fiatCurrency)
      updateExchangeRate(fiatCurrency, 'ETH')
      updateExchangeRate(fiatCurrency, 'DAI')
    }
    this.exchangeRateUpdater = setInterval(
      this.updateExchangeRates,
      EXCHANGE_RATE_POLL_INTERVAL
    )
    this.updateExchangeRates()
  }

  componentWillUnmount = () => {
    // Cleanup exchange rate updater
    if (this.exchangeRateUpdater) {
      clearInterval(this.exchangeRateUpdateR)
    }
  }

  componentWillUpdate = prevProps => {
    // Update exchange rates on currency change
    if (get(prevProps, 'settings.currency') !== this.props.settings.currency) {
      this.updateExchangeRates()
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
