'use strict'

/* Component to encapsulate the logic required by Samsung BKS integration.
 * Handles checking for required updates and watching for changes of seed hash.
 */

import React from 'react'
import { connect } from 'react-redux'
import { AppState } from 'react-native'
import RNSamsungBKS from 'react-native-samsung-bks'

import NavigationService from '../NavigationService'
import { SamsungBKSConstants, getSeedHash } from 'actions/SamsungBKS'
import { setAccounts } from 'actions/Wallet'
import { generateHdPath } from 'utils/user'

class SamsungBKS extends React.Component {
  state = {
    appState: AppState.currentState
  }

  componentDidMount = async () => {
    await this._checkForMandatoryUpdate()
    await this._checkSeedHash()
    this.props.onReady()
    AppState.addEventListener('change', this._handleAppStateChange)
  }

  componentWillUnmount = () => {
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _handleAppStateChange = nextAppState => {
    // Coming from background
    if (this.state.appState === 'background' && nextAppState === 'active') {
      // Get seed hash to update account list on change
      this._checkSeedHash()
    }
    this.setState({ appState: nextAppState })
  }

  _checkForMandatoryUpdate = async () => {
    const samsungUpdateUrl = await RNSamsungBKS.checkForMandatoryAppUpdate()
    if (!samsungUpdateUrl) {
      console.debug('No Samsung BKS update required')
    }
    // TODO handle required update
  }

  _updateAccounts = async () => {
    console.debug('Updating account list from Samsung BKS')
    const hdPath = generateHdPath(0)
    const address = await RNSamsungBKS.getAddressList(hdPath)
    await this.props.setAccounts([
      {
        address,
        hdPath
      }
    ])
  }

  _checkSeedHash = async () => {
    const previousSeedHash = this.props.samsungBKS.seedHash
    const seedHash = await this.props.getSeedHash()
    if (seedHash.type === SamsungBKSConstants.GET_SEEDHASH_SUCCESS) {
      if (seedHash.payload.length > 0) {
        if (
          seedHash.payload !== previousSeedHash ||
          this.props.wallet.accounts.length === 0
        ) {
          // Update local account cache if the seed hash has changed or no accounts are in the local cache
          await this._updateAccounts()
        }
      } else {
        // User reset Samsung BKS, send to start of onboarding
        NavigationService.navigate('Welcome')
      }
    }
  }

  render() {
    return null
  }
}

const mapStateToProps = ({ samsungBKS, wallet }) => {
  return { samsungBKS, wallet }
}

const mapDispatchToProps = dispatch => ({
  getSeedHash: () => dispatch(getSeedHash()),
  setAccounts: payload => dispatch(setAccounts(payload))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SamsungBKS)
