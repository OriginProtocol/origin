'use strict'

/* Component to encapsulate the logic required by Samsung BKS integration.
 * Handles checking for required updates and watching for changes of seed hash.
 */

import React from 'react'
import { Text, View } from 'react-native'
import { connect } from 'react-redux'
import { AppState } from 'react-native'
import { fbt } from 'fbt-runtime'
import RNSamsungBKS from 'react-native-samsung-bks'

import { SamsungBKSConstants, getSeedHash } from 'actions/SamsungBKS'
import { setAccounts } from 'actions/Wallet'
import { generateHdPath } from 'utils'
import NavigationService from '../NavigationService'
import CommonStyles from 'styles/common'

class SamsungBKS extends React.Component {
  state = {
    samsungBKSError: null,
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

  /* Update the account list according to the Samsung BKS seed hash.
   */
  _updateAccounts = async seedHash => {
    console.debug('Updating account list from Samsung BKS')
    const hdPath = generateHdPath(0)

    let address
    try {
      address = await RNSamsungBKS.getAddressList(hdPath)
    } catch (error) {
      this.setState({ samsungBKSError: error })
      return
    }

    await this.props.setAccounts([
      {
        address,
        hdPath,
        // Store the seed hash alongside accounts so we can remove these
        // accounts if the seed hash changes (i.e. Keystore was reset and
        // reinitialized while the app was closed)
        seedHash
      }
    ])
  }

  /* Check for changes to the Samsung BKS seed hash and update the account list
   * if it has changed
   */
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
          await this._updateAccounts(seedHash.payload)
        }
      } else {
        // User reset Samsung BKS, send to start of onboarding
        NavigationService.navigate('Welcome')
      }
    }
  }

  render() {
    if (this.state.samsungBKSError) {
      return (
        <View style={styles.error}>
          <Text style={styles.title}>
            <fbt desc="SamsungBKSScreen.heading">Keystore Error</fbt>
          </Text>
          <Text style={styles.subtitle}>
            <fbt desc="SamsungBKSScreen.errorText">
              An error occurred accessing Samsung Blockchain Keystore.
            </fbt>
          </Text>
          <Text>{this.state.samsungBKSError}</Text>
        </View>
      )
    }
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

const styles = StyleSheet.create({
  ...CommonStyles,
  error: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'white'
  }
})
