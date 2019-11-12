'use strict'

import React, { Component } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'

import { setPin } from 'actions/Settings'
import PinInput from 'components/pin-input'
import CommonStyles from 'styles/common'
import OnboardingStyles from 'styles/onboarding'

class ChangePinScreen extends Component {
  static navigationOptions = () => {
    return {
      title: String('Change PIN', 'ChangePinScreen.headerTitle'),
      headerTitleStyle: {
        fontFamily: 'Poppins',
        fontSize: 17,
        fontWeight: 'normal'
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      pin: '',
      enteredPin: false,
      isRetry: false
    }
    this.pinLength = 6
  }

  handleInput = async pin => {
    // Validate that the pin is numeric
    if (pin.length && isNaN(pin)) return

    await this.setState({ pin, isRetry: false })

    if (this.state.pin.length === this.pinLength) {
      if (this.state.enteredPin) {
        if (this.state.pin === this.state.enteredPin) {
          // Correct confirmation of PIN, update and navigate back
          this.props.setPin(this.state.pin)
          this.props.navigation.goBack()
        } else {
          // Confirm failure, start of scratch
          this.setState({
            pin: '',
            enteredPin: '',
            isRetry: true
          })
        }
      } else {
        this.setState({
          pin: '',
          enteredPin: this.state.pin,
          isRetry: false
        })
      }
    }
  }

  render() {
    let titleElement
    if (this.state.enteredPin) {
      titleElement = <fbt desc="PinScreen.confirmPinTitle">Confirm New PIN</fbt>
    } else {
      titleElement = <fbt desc="PinScreen.newPinTitle">Enter New PIN</fbt>
    }

    return (
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <Text style={styles.subtitle}>{titleElement}</Text>
        {this.state.isRetry === true && (
          <Text style={styles.invalid}>
            <fbt desc="PinScreen.pinMatchFailure">Incorrect PIN</fbt>
          </Text>
        )}
        <PinInput
          value={this.state.pin}
          pinLength={this.pinLength}
          onChangeText={this.handleInput}
        />
      </KeyboardAvoidingView>
    )
  }
}

const mapStateToProps = ({ settings }) => {
  return { settings }
}

const mapDispatchToProps = dispatch => ({
  setPin: pin => dispatch(setPin(pin))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangePinScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...OnboardingStyles
})
