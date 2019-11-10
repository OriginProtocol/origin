'use strict'

import React, { Component } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
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
      if (this.props.settings.pin) {
        // Changing an old PIN
        if (this.state.enteredPin) {
          // Setting of new PIN
          this.props.setPin(this.state.pin)
          this.props.navigation.goBack()
        } else if (this.state.pin === this.props.settings.pin) {
          // Correct entry of old PIN, move to confirm
          this.setState({
            pin: '',
            enteredPin: this.state.pin,
            isRetry: false
          })
        } else {
          // Incorrect entry of old PIN
          this.setState({ pin: '', isRetry: true })
        }
      } else {
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
  }

  render() {
    let titleElement
    if (this.props.settings.pin) {
      if (this.state.enteredPin) {
        titleElement = <fbt desc="PinScreen.newPinTitle">Enter New PIN</fbt>
      } else {
        titleElement = <fbt desc="PinScreen.oldPinTitle">Enter Old PIN</fbt>
      }
    } else {
      if (this.state.enteredPin) {
        titleElement = (
          <fbt desc="PinScreen.confirmPinTitle">Confirm New PIN</fbt>
        )
      } else {
        titleElement = <fbt desc="PinScreen.newPinTitle">Enter New PIN</fbt>
      }
    }

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 40 : 0}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[styles.content, styles.greyBackground]}
            keyboardShouldPersistTaps={'always'}
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
          </ScrollView>
        </SafeAreaView>
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

export default connect(mapStateToProps, mapDispatchToProps)(ChangePinScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...OnboardingStyles
})
