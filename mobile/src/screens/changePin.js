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
import PinInput from 'components/pin-input'
import CommonStyles from 'styles/common'
import OnboardingStyles from 'styles/onboarding'

class ChangePinScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const title = navigation.getParam('new') ? 'Create PIN' : 'Change PIN'
    return {
      title: String(title, 'ChangePinScreen.headerTitle'),
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
      oldPin: null,
      isRetry: false,
      action: ''
    }
    this.pinLength = 6
    this.handleChange = this.handleChange.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
  }

  componentDidMount() {
    const action = this.props.navigation.getParam('action')
    this.setState({
      action: action
    })
  }

  async handleChange(pin) {
    // Validate that the pin is numeric
    if (pin.length && isNaN(pin)) return

    await this.setState({ pin, isRetry: false })

    if (this.state.pin.length === this.pinLength) {
      if (!this.state.oldPin && this.props.settings.pin === this.state.pin) {
        // Proceed to verify step, copy value to oldPin
        this.setState({
          pin: '',
          oldPin: this.state.pin,
          isRetry: false
        })
      } else {
        if (this.props.settings.pin === this.state.oldPin) {
          // Pin was verified
          this.props.setPin(this.state.pin)
          this.props.navigation.goBack()
        } else {
          // Pin was incorrect, reset state and try again
          this.setState({
            isRetry: true,
            pin: '',
            oldPin: null
          })
        }
      }
    }
  }

  async handleCreate(pin) {
    // Validate that the pin is numeric
    if (pin.length && isNaN(pin)) return

    await this.setState({ pin, isRetry: false })

    if (this.state.pin.length === this.pinLength) {
      if (!this.state.oldPin) {
        // Proceed to verify step, copy value to oldPin
        this.setState({
          pin: '',
          oldPin: this.state.pin,
          isRetry: false
        })
      } else {
        if (this.state.pin === this.state.oldPin) {
          // Pin was verified
          this.props.setPin(this.state.pin)
          this.props.navigation.goBack()
        } else {
          // Pin was incorrect, reset state and try again
          this.setState({
            isRetry: true,
            pin: '',
            oldPin: null
          })
        }
      }
    }
  }

  async handleConfirm(pin) {
    // Validate that the pin is numeric
    if (pin.length && isNaN(pin)) return

    await this.setState({ pin, isRetry: false })

    if (this.state.pin.length === this.pinLength) {
      if (!this.state.oldPin && this.props.settings.pin === this.state.pin) {
        // Proceed to verify step, copy value to oldPin
        this.props.setPin(null)
        this.props.navigation.goBack()
      } else {
        this.setState({
          isRetry: true,
          pin: '',
          oldPin: null
        })
      }
    }
  }

  render() {
    let title = this.state.oldPin
      ? fbt('Enter your new PIN', 'PinScreen.enterNewPinCode')
      : fbt('Enter your old PIN', 'PinScreen.enterOldPinCode')

    if (this.state.action === 'new') {
      title = this.state.oldPin
        ? fbt('Re-enter Pin Code', 'PinScreen.reenterPinCode')
        : fbt('Create a Pin Code', 'PinScreen.createPinCode')
    }

    if (this.state.action === 'confirm') {
      title = fbt('Enter your PIN', 'PinScreen.confirmPinCode')
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
            <View style={styles.container}>
              <Text style={styles.subtitle}>{title}</Text>
              {this.state.isRetry === true && (
                <Text style={styles.invalid}>
                  <fbt desc="PinScreen.pinMatchFailure">Incorrect PIN</fbt>
                </Text>
              )}
              <PinInput
                value={this.state.pin}
                pinLength={this.pinLength}
                onChangeText={
                  this.state.action === 'new'
                    ? this.handleCreate
                    : this.state.action === 'confirm'
                    ? this.handleConfirm
                    : this.handleChange
                }
              />
            </View>
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
