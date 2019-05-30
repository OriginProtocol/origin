'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'
import get from 'lodash.get'

import { setPhoneAttestation } from 'actions/Onboarding'
import OriginButton from 'components/origin-button'
import PinInput from 'components/pin-input'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import withConfig from 'hoc/withConfig'
import OnboardingStyles from 'styles/onboarding'

class PhoneScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      phoneValue: '',
      phoneError: '',
      loading: false,
      verify: false,
      verifyError: '',
      verificationCode: ''
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmitPhone = this.handleSubmitPhone.bind(this)
    this.handleSubmitVerification = this.handleSubmitVerification.bind(this)
  }

  handleChange(phoneValue) {
    this.setState({ phoneError: '', phoneValue })
  }

  async handleSubmitPhone() {
    this.setState({ loading: true })
    const url = `${
      this.props.configs.mainnet.bridge
    }/api/attestations/phone/generate-code`
    const response = await fetch(url, {
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify({ phone: this.state.phoneValue })
    })
    if (response.ok) {
      this.setState({ loading: false, verify: true })
    } else {
      const data = await response.json()
      this.setState({
        loading: false,
        phoneError: get(data, 'errors[0]', '')
      })
    }
  }

  async handleSubmitVerification() {
    this.setState({ loading: true })
    const url = `${
      this.props.configs.mainnet.bridge
    }/api/attestations/phone/verify`
    const response = await fetch(url, {
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify({
        code: this.state.verificationCode,
        identity: this.props.wallet.activeAccount.address,
        phone: this.state.phoneValue
      })
    })

    const data = await response.json()
    this.setState({ loading: false })
    if (!response.ok) {
      this.setState({ verifyError: get(data, 'errors[0]', '') })
    } else {
      this.props.setPhoneAttestation(data)
      this.props.navigation.navigate(this.props.nextOnboardingStep)
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {!this.state.verify ? this.renderInput() : this.renderVerify()}
      </SafeAreaView>
    )
  }

  renderInput() {
    return (
      <>
        <View style={styles.content}>
          <Text style={styles.title}>
            <fbt desc="PhoneScreen.inputTitle">Enter phone number</fbt>
          </Text>
          <Text style={styles.subtitle}>
            <fbt desc="PhoneScreen.inputSubtitle">
              Enter a valid 10-digit phone number
            </fbt>
          </Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            multiline={true}
            onChangeText={this.handleChange}
            onSubmitEditing={this.handleSubmit}
            value={this.state.phoneValue}
            style={[styles.input, this.state.phoneError ? styles.invalid : {}]}
            autofocus={true}
          />
          {this.state.phoneError.length > 0 && (
            <Text style={styles.invalid}>{this.state.phoneError}</Text>
          )}
          <View style={styles.legalContainer}>
            <Text style={styles.legal}>
              <fbt desc="PhoneScreen.inputHelpText">
                By verifying your phone number, you give Origin permission to
                send you occasional messages such as notifications about your
                transactions.
              </fbt>
            </Text>
          </View>
        </View>
        {this.renderVisibilityWarning()}
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Continue', 'PhoneScreen.continueButton')}
            disabled={
              !this.state.phoneValue.length ||
              this.state.phoneError ||
              this.state.loading
            }
            onPress={this.handleSubmitPhone}
            loading={this.state.loading}
          />
        </View>
      </>
    )
  }

  renderVerify() {
    return (
      <>
        <View style={styles.content}>
          <Text style={styles.title}>
            <fbt desc="PhoneScreen.verifyTitle">Verify your phone</fbt>
          </Text>
          <Text style={styles.subtitle}>
            <fbt desc="PhoneScreen.verifySubtitle">Enter code</fbt>
          </Text>
          <PinInput
            value={this.state.verificationCode}
            pinLength={6}
            onChangeText={value =>
              this.setState({
                verificationCode: value.substr(0, 6),
                verifyError: ''
              })
            }
          />
          {this.state.verifyError.length > 0 && (
            <Text style={styles.invalid}>{this.state.verifyError}</Text>
          )}
          <View style={styles.legalContainer}>
            <Text style={styles.legal}>
              <fbt desc="PhoneScreen.verifyHelpText">
                We sent you a code to the phone address you provided. Please
                enter it above.
              </fbt>
            </Text>
          </View>
        </View>
        {this.renderVisibilityWarning()}
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Verify', 'PhoneScreen.verifyButton')}
            disabled={
              this.state.verificationCode.length < 6 ||
              this.state.verifyError ||
              this.state.loading
            }
            onPress={this.handleSubmitVerification}
            loading={this.state.loading}
          />
        </View>
      </>
    )
  }

  renderVisibilityWarning() {
    return (
      <View style={styles.visibilityWarning}>
        <Text style={styles.visibilityWarningHeader}>
          What will be visible on the blockchain?
        </Text>
        <Text>
          That you have a verified phone, but NOT your actual phone number.
        </Text>
      </View>
    )
  }
}

const mapStateToProps = ({ onboarding, wallet }) => {
  return { onboarding, wallet }
}

const mapDispatchToProps = dispatch => ({
  setPhoneAttestation: phoneAttestation =>
    dispatch(setPhoneAttestation(phoneAttestation))
})

export default withConfig(
  withOnboardingSteps(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(PhoneScreen)
  )
)

const styles = StyleSheet.create({
  ...OnboardingStyles
})
