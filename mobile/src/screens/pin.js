'use strict'

import React, { Component } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import { setPin } from 'actions/Settings'
import BackArrow from 'components/back-arrow'
import PinInput from 'components/pin-input'
import CommonStyles from 'styles/common'
import OnboardingStyles from 'styles/onboarding'

class PinScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pin: '',
      verifyPin: null,
      isRetry: false
    }
    this.pinLength = 6
    this.handleChange = this.handleChange.bind(this)
  }

  async handleChange(pin) {
    // Validate that the pin is numeric
    if (pin.length && isNaN(pin)) return

    await this.setState({ pin, isRetry: false })

    if (this.state.pin.length === this.pinLength) {
      if (!this.state.verifyPin) {
        // Proceed to verify step, copy value to verifyPin
        this.setState({
          pin: '',
          verifyPin: this.state.pin
        })
      } else {
        if (this.state.pin === this.state.verifyPin) {
          // Pin was verified
          this.props.setPin(this.state.pin)
          this.props.navigation.navigate('Main')
        } else {
          // Pin was incorrect, reset state and try again
          this.setState({
            isRetry: true,
            pin: '',
            verifyPin: null
          })
        }
      }
    }
  }

  render() {
    const title = this.state.verifyPin
      ? fbt('Re-enter Pin Code', 'PinScreen.reenterPinCode')
      : fbt('Create a Pin Code', 'PinScreen.createPinCode')

    return (
      <KeyboardAvoidingView
        style={styles.darkOverlay}
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 40 : 10}
      >
        <SafeAreaView style={styles.container}>
          <ScrollView
            style={styles.onboardingModal}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps={'always'}
          >
            <BackArrow onClick={() => this.props.navigation.goBack(null)} />
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              {this.state.isRetry === true && (
                <Text style={styles.invalid}>
                  <fbt desc="PinScreen.pinMatchFailure">
                    Pins did not match, try again
                  </fbt>
                </Text>
              )}
              <PinInput
                value={this.state.pin}
                pinLength={this.pinLength}
                onChangeText={this.handleChange}
              />
              <Text style={styles.legal}>
                <fbt desc="PinScreen.disclaimer">
                  Your Pin Code will be used to login to the app.
                </fbt>
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    )
  }
}

const mapStateToProps = ({ settings, wallet }) => {
  return { settings, wallet }
}

const mapDispatchToProps = dispatch => ({
  setPin: pin => dispatch(setPin(pin))
})

export default connect(mapStateToProps, mapDispatchToProps)(PinScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...OnboardingStyles
})
