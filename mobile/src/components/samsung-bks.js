'use strict'

/* Component to encapsulate the logic required by Samsung BKS integration.
 * Handles checking for required updates and watching for changes of seed hash.
 */

import React from 'react'
import { Linking, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import { AppState } from 'react-native'
import { fbt } from 'fbt-runtime'
import RNSamsungBKS from 'react-native-samsung-bks'

import {
  SamsungBKSConstants,
  getSeedHash,
  setEnabled as setSamsungBKSEnabled,
  setError as setSamsungBKSError
} from 'actions/SamsungBKS'
import { setAccounts } from 'actions/Wallet'
import { generateHdPath } from 'utils'
import NavigationService from '../NavigationService'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

class SamsungBKS extends React.Component {
  state = {
    appState: AppState.currentState
  }

  componentDidMount = () => {
    this.checkSeedHash()
    AppState.addEventListener('change', this.handleAppStateChange)
  }

  componentWillUnmount = () => {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  handleAppStateChange = nextAppState => {
    // Coming from background
    if (this.state.appState === 'background' && nextAppState === 'active') {
      // Get seed hash to update account list on change
      this.checkSeedHash()
    }
    this.setState({ appState: nextAppState })
  }

  checkForMandatoryUpdate = async () => {
    console.debug('Checking for Samsung BKS update')
    const samsungUpdateUrl = await RNSamsungBKS.checkForMandatoryAppUpdate()
    if (!samsungUpdateUrl) {
      console.debug('No Samsung BKS update required')
    }
  }

  /* Update the account list according to the Samsung BKS seed hash.
   */
  updateAccounts = async seedHash => {
    console.debug('Updating account list from Samsung BKS')
    const hdPath = generateHdPath(0)

    let address
    try {
      address = await RNSamsungBKS.getAddressList(hdPath)
    } catch (error) {
      this.props.setSamsungBKSError(error.message)
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
  checkSeedHash = async () => {
    console.debug('Checking SamsungBKS seed hash')
    const previousSeedHash = this.props.samsungBKS.seedHash
    const seedHash = await this.props.getSeedHash()
    if (seedHash.type === SamsungBKSConstants.GET_SEEDHASH_SUCCESS) {
      if (seedHash.payload.length > 0) {
        if (
          seedHash.payload !== previousSeedHash ||
          this.props.wallet.accounts.length === 0
        ) {
          // Update local account cache if the seed hash has changed or no
          // accounts are in the local cache
          await this.updateAccounts(seedHash.payload)
        }
      } else {
        // User reset Samsung BKS, send to start of onboarding
        NavigationService.navigate('Welcome')
      }
    }
  }

  render() {
    if (this.props.samsungBKS.error) {
      return (
        <View style={styles.error}>
          <View style={styles.content}>
            <Text style={styles.title}>
              <fbt desc="SamsungBKSScreen.heading">
                Samsung Blockchain Keystore Error
              </fbt>
            </Text>
            <Text style={styles.subtitle}>
              <fbt desc="SamsungBKSScreen.errorText">
                An error occurred accessing Samsung Blockchain Keystore.
              </fbt>
            </Text>
          </View>
          {this.renderError()}
        </View>
      )
    }
    return null
  }

  renderError() {
    switch (this.props.samsungBKS.error) {
      case 'ERROR_MANDATORY_APP_UPDATE_NEEDED':
        return this.renderMandatoryAppUpdate()
      case 'ERROR_INVALID_SCW_APP_ID':
        return this.renderInvalidSCWAppId()
      case 'ERROR_CHECK_INTEGRITY_FAILED':
        return this.renderIntegrityCheckFailed()
      case 'ERROR_EXCEED_NUMBER_OF_DEVICES':
        return this.renderDeveloperDevicesExceeded()
      case 'ERROR_NETWORK_FAILED':
        return this.renderNetworkError()
      case 'ERROR_NETWORK_NOT_AVAILABLE':
        return this.renderNetworkError()
      case 'ERROR_SERVER_FAILED':
        return this.renderNetworkError()
      case 'ERROR_TNC_NOT_AGREED':
        return this.renderTermsNotAgreed()
      case 'ERROR_WALLET_NOT_CREATED':
        return this.renderWalletNotCreated()
      case 'ERROR_WALLET_RESET':
        return this.renderWalletReset()
    }
    return null
  }

  renderMandatoryAppUpdate() {
    return (
      <>
        <Text>Samsung Keystore requires an update.</Text>
        {this.renderSamsungBKSSettingsLink()}
      </>
    )
  }

  renderInvalidSCWAppId() {
    return (
      <>
        <Text>
          Samsung Keystore reported an error with this applications ID.
        </Text>
      </>
    )
  }

  renderIntegrityCheckFailed() {
    return (
      <>
        <Text>
          Samsung Keystore Integrity check failed. Contact customer support or
          continue without Keystore.
        </Text>
        {this.renderRetryButton()}
      </>
    )
  }

  renderDeveloperDevicesExceeded() {
    return (
      <Text>You have exceeded the allowed number of developer devices.</Text>
    )
  }

  renderNetworkError() {
    return (
      <>
        <Text>A network error occurred.</Text>
        {this.renderRetryButton()}
      </>
    )
  }

  renderErrorNotSupportedInCountry() {
    return (
      <>
        <Text>
          Samsung Blockchain Keystore is not supported in your country. You can
          continue without Keystore but you will need to import a wallet.
        </Text>
        {this.renderDisableKeystoreButton()}
      </>
    )
  }

  renderTermsNotAgreed() {
    return (
      <>
        <Text>
          Samsung Blockchain Keystore Terms & Conditions have changed. Please
          agree to the new terms.
        </Text>
        {this.renderSamsungBKSSettingsLink()}
      </>
    )
  }

  renderWalletNotCreated() {
    return (
      <>
        <Text>Please create a wallet in Samsung Blockchain Keystore.</Text>
        {this.renderSamsungBKSSettingsLink()}
      </>
    )
  }

  renderWalletReset() {
    return (
      <>
        <Text>Please create a wallet in Samsung Blockchain Keystore.</Text>
        {this.renderSamsungBKSSettingsLink()}
      </>
    )
  }

  renderRetryButton() {
    return (
      <View style={styles.buttonContainer}>
        <OriginButton
          size="large"
          type="primary"
          title={fbt('Retry', 'SamsungBKSScreen.retryButton')}
          onPress={this.checkSeedHash}
        />
      </View>
    )
  }

  renderSamsungBKSSettingsLink() {
    return (
      <View style={styles.buttonContainer}>
        <OriginButton
          size="large"
          type="primary"
          title={fbt('Continue', 'SamsungBKSScreen.continueButton')}
          onPress={async () => {
            const deepLinks = await RNSamsungBKS.getDeepLinks()
            Linking.openURL(deepLinks['MAIN'])
          }}
        />
      </View>
    )
  }

  renderDisableKeystoreButton() {
    return (
      <View style={styles.buttonContainer}>
        <OriginButton
          size="large"
          type="primary"
          title={fbt('Continue', 'SamsungBKSScreen.continueButton')}
          onPress={() => {
            this.props.setSamsungBKSEnabled(false)
            this.props.setSamsungBKSError(null)
          }}
        />
      </View>
    )
  }
}

const mapStateToProps = ({ samsungBKS, wallet }) => {
  return { samsungBKS, wallet }
}

const mapDispatchToProps = dispatch => ({
  getSeedHash: () => dispatch(getSeedHash()),
  setAccounts: payload => dispatch(setAccounts(payload)),
  setSamsungBKSEnabled: payload => dispatch(setSamsungBKSEnabled(payload)),
  setSamsungBKSError: error => dispatch(setSamsungBKSError(error))
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
