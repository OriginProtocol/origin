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
import { importAccountFromPrivateKey } from 'actions/Wallet'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'
import OnboardingStyles from 'styles/onboarding'

class ImportAccountScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
      error: ''
    }
  }

  componentDidUpdate() {
    const { value, error } = this.state
    // Remove the error if no value
    if (error && !value) {
      this.setState({ error: '' })
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
      account = this.props.importAccountFromPrivateKey(this.state.value)
    } catch (error) {
      let errorMessage = error.message
      if (error.code === 'INVALID_ARGUMENT') {
        errorMessage = fbt(
          'That is not a valid private key.',
          'ImportScreen.invalidPrivateKeyError'
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
      error: '',
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
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset="10"
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={styles.onboardingModal}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps={'always'}
          >
            <View style={styles.container}>
              <Text style={styles.title}>
                <fbt desc="ImportPrivateKeyScreen.privateKeyTitle">
                  Enter Private Key
                </fbt>
              </Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
                multiline={true}
                returnKeyType="done"
                blurOnSubmit={true}
                onChangeText={value => this.setState({ value })}
                onSubmitEditing={this.handleSubmit}
                style={[styles.input, this.state.error ? styles.invalid : {}]}
              />
              {this.state.error.length > 0 && (
                <Text style={styles.invalid}>{this.state.error}</Text>
              )}
            </View>
            <View style={{ ...styles.container, justifyContent: 'flex-end' }}>
              <OriginButton
                size="large"
                type="primary"
                style={styles.button}
                textStyle={{ fontSize: 18, fontWeight: '900' }}
                title={fbt('Continue', 'ImportPrivateKeyScreen.continueButton')}
                onPress={this.handleSubmit}
                loading={this.state.loading}
                disabled={this.state.loading}
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
  importAccountFromPrivateKey: privateKey =>
    dispatch(importAccountFromPrivateKey(privateKey)),
  setBackupWarningStatus: address => dispatch(setBackupWarningStatus(address))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportAccountScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...OnboardingStyles,
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
    height: 100
  },
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000',
    marginBottom: 10
  }
})
