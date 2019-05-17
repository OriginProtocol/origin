'use strict'

import React, { Component } from 'react'
import {
  DeviceEventEmitter,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { ethers } from 'ethers'

import { setBackupWarningStatus } from 'actions/Activation'
import OriginButton from 'components/origin-button'

class ImportAccountScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mnemonic: true,
      value: '',
      error: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidUpdate() {
    const { value, error } = this.state
    // Remove the error if no value
    if (error && !value) {
      this.setState({ error: '' })
    }
  }

  handleChange(value) {
    if (this.state.mnemonic) {
      this.setState({ value })
    } else {
      // Private key, trim it
      this.setState({ value: value.trim() })
    }
  }

  handleSubmit() {
    this.setState({ loading: true }, () => {
      setTimeout(() => {
        this.addAccount()
        this.setState({ loading: false })
      })
    })
  }

  /* Add a new account to the wallet
   */
  addAccount() {
    let account
    if (this.state.mnemonic) {
      account = this.addAccountFromMnemonic()
    } else {
      account = this.addAccountFromPrivateKey()
    }
    if (account) {
      // Since this is an imported account disable backup prompts because it
      // is assumed the user already has their mnemonic recorded
      this.props.setBackupWarningStatus(account.address)
      DeviceEventEmitter.emit('addAccount', {
        address: account.address,
        mnemonic: account.mnemonic,
        privateKey: account.privateKey
      })
      // Reset state of component
      this.setState({
        mnemonic: true,
        value: '',
        error: '',
        loading: false
      })
      const onSuccess = this.props.navigation.getParam('navigateOnSuccess')
      if (onSuccess) {
        this.props.navigation.navigate(onSuccess)
      }
    }
  }

  /* Add a new account based on a mnemonic (this.state.value). If the first account
   * in the derivation path is used it will continue to try the next number
   * until an address that is unused is found.
   *
   * This function can be slow.
   *
   * TODO: this logic should be in OriginWallet.js rather than here but to
   * catch errors for invalid mnemonics it needs to be here. This could be
   * improved with a refactor of the OriginWallet <> component communication.
   */
  addAccountFromMnemonic() {
    const existingAddresses = this.props.wallet.accounts.map(a => a.address)
    // Use a loop to try the next account in the derivation path
    for (let i = 0; i < 10; i++) {
      // This is the default path but explicitly stated here for clarity
      const derivePath = `m/44'/60'/0'/0/${i}`
      // Web3js doesn't support wallet creation from a mnemonic, so somewhat
      // redundantly we have to include ethersjs. Perhaps migrate everything
      // away from web3js to ethersjs or the functionality will be added to web3js
      // sometime in the future, see:
      // https://github.com/ethereum/web3.js/issues/1594
      let wallet
      try {
        wallet = ethers.Wallet.fromMnemonic(this.state.value.trim(), derivePath)
      } catch (error) {
        let errorMessage = error.message
        if (errorMessage === 'invalid mnemonic') {
          errorMessage = 'That does not look like a valid recovery phrase.'
        }
        this.setState({ error: errorMessage })
        return false
      }
      if (!existingAddresses.includes(wallet.address)) {
        // Got an account we don't have, use that
        return wallet
      }
    }
    this.setState({
      error: 'Maximum addresses reached'
    })
    return false
  }

  /* Add a new account based on a private key (this.state.value).
   *
   * TODO: as above
   */
  addAccountFromPrivateKey() {
    let wallet
    try {
      let privateKey = this.state.value
      if (!privateKey.startsWith('0x') && /^[0-9a-fA-F]+$/.test(privateKey)) {
        privateKey = '0x' + privateKey
      }
      wallet = new ethers.Wallet(privateKey)
    } catch (error) {
      let errorMessage = error.message
      if (error.code === 'INVALID_ARGUMENT') {
        errorMessage = 'That is not a valid private key.'
      }
      this.setState({ error: errorMessage })
      return false
    }
    return wallet
  }

  render() {
    const { navigation } = this.props
    const cancelRoute = this.props.navigation.getParam('cancelRoute')

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            Enter {this.state.mnemonic ? 'Recovery Phrase' : 'Private Key'}
          </Text>
          {this.state.mnemonic && (
            <Text style={styles.subtitle}>
              Enter the 12 words in the correct order
            </Text>
          )}
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            multiline={true}
            returnKeyType="done"
            blurOnSubmit={true}
            onChangeText={this.handleChange}
            onSubmitEditing={this.handleSubmit}
            style={[styles.input, this.state.error ? styles.invalid : {}]}
          />
          {this.state.error.length > 0 && (
            <Text style={styles.invalid}>{this.state.error}</Text>
          )}
          <TouchableOpacity
            onPress={() =>
              this.setState({
                mnemonic: !this.state.mnemonic,
                value: '',
                error: ''
              })
            }
          >
            <Text style={styles.switchMethod}>
              Use a {this.state.mnemonic ? 'private key' : 'recovery phrase'}{' '}
              instead
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonsContainer}>
          {cancelRoute && (
            <OriginButton
              size="large"
              type="link"
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={'Cancel'}
              onPress={() => navigation.navigate(cancelRoute)}
            />
          )}
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Done'}
            onPress={this.handleSubmit}
            loading={this.state.loading}
            disabled={this.state.loading}
          />
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    paddingTop: 0
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  loading: {
    flex: 1,
    justifyContent: 'space-around'
  },
  buttonsContainer: {
    paddingTop: 10,
    width: '100%'
  },
  button: {
    marginBottom: 20,
    marginHorizontal: 50
  },
  title: {
    fontFamily: 'Lato',
    fontSize: 36,
    fontWeight: '600',
    marginHorizontal: 50,
    paddingBottom: 30,
    textAlign: 'center'
  },
  subtitle: {
    fontFamily: 'Lato',
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 50,
    paddingBottom: 30,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#eaf0f3',
    borderColor: '#c0cbd4',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
    width: 300,
    height: 80
  },
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000'
  },
  switchMethod: {
    fontWeight: '600',
    color: '#1a82ff'
  }
})

const mapStateToProps = ({ activation, settings, wallet }) => {
  return { activation, settings, wallet }
}

const mapDispatchToProps = dispatch => ({
  setBackupWarningStatus: address => dispatch(setBackupWarningStatus(address))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportAccountScreen)
