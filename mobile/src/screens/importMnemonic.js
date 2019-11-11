'use strict'

import React, { Component } from 'react'
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import { setBackupWarningStatus } from 'actions/Activation'
import { importAccountFromMnemonic } from 'actions/Wallet'
import BackArrow from 'components/back-arrow'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'
import OnboardingStyles from 'styles/onboarding'

class ImportAccountScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
      error: '',
      loading: false
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Remove the error if value has changed
    if (prevState.value !== this.state.value) {
      this.setState({ error: null })
    }
  }

  handleSubmit = () => {
    this.setState({ loading: true }, () => {
      setTimeout(() => {
        this.importAccount()
        this.setState({ loading: false })
      })
    })
  }

  /* Add a new account to the wallet
   */
  importAccount() {
    let account

    try {
      const existingAddresses = this.props.wallet.accounts.map(a => a.address)
      account = this.props.importAccountFromMnemonic(
        this.state.value.trim(),
        existingAddresses
      )
    } catch (error) {
      let errorMessage = error.message
      if (errorMessage === 'invalid mnemonic') {
        errorMessage = fbt(
          'That does not look like a valid recovery phrase.',
          'ImportScreen.invalidRecoveryPhraseError'
        )
      }
      this.setState({ error: String(errorMessage) })
      return
    }

    // Since this is an imported account disable backup prompts because it
    // is assumed the user already has their mnemonic recorded
    this.props.setBackupWarningStatus(account.address)

    // Reset state of component
    this.setState({
      value: '',
      error: null,
      loading: false
    })

    const onSuccess = this.props.navigation.getParam('navigateOnSuccess')
    if (onSuccess) {
      this.props.navigation.navigate(onSuccess)
    }
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.darkOverlay}
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 40 : 0}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={styles.onboardingModal}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps={'always'}
          >
            <View style={{ ...styles.container, justifyContent: 'flex-start' }}>
              <BackArrow
                onClick={() => this.props.navigation.goBack(null)}
                style={styles.backArrow}
              />
              <Text style={styles.title}>
                <fbt desc="ImportMnemonicScreen.recoveryPhraseTitle">
                  Enter Phrase
                </fbt>
              </Text>
            </View>
            <View style={styles.container}>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
                multiline={true}
                returnKeyType="done"
                blurOnSubmit={true}
                onChangeText={value => this.setState({ value })}
                value={this.state.value}
                onSubmitEditing={this.handleSubmit}
                style={[styles.input, this.state.error ? styles.invalid : {}]}
              />
              <Text style={styles.invalid}>{this.state.error}</Text>
            </View>
            <View style={{ ...styles.container, ...styles.buttonContainer }}>
              <OriginButton
                size="large"
                type="primary"
                title={fbt('Continue', 'ImportMnemonicScreen.continueButton')}
                onPress={this.handleSubmit}
                loading={this.state.loading}
                disabled={
                  this.state.loading ||
                  this.state.value.length === 0 ||
                  this.state.error
                }
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    )
  }
}

const mapStateToProps = ({ activation, settings, wallet }) => {
  return { activation, settings, wallet }
}

const mapDispatchToProps = dispatch => ({
  importAccountFromMnemonic: (mnemonic, existingAddresses) =>
    dispatch(importAccountFromMnemonic(mnemonic, existingAddresses)),
  setBackupWarningStatus: address => dispatch(setBackupWarningStatus(address))
})

export default connect(mapStateToProps, mapDispatchToProps)(ImportAccountScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...OnboardingStyles,
  input: {
    backgroundColor: '#eaf0f3',
    borderColor: '#c0cbd4',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop: 20,
    padding: 20,
    width: '80%',
    maxWidth: '80%',
    height: 100,
    color: '#000'
  },
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000',
    marginBottom: 10
  }
})
