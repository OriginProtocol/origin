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
  static navigationOptions = () => {
    return {
      title: String(fbt('Change PIN', 'ChangePinScreen.headerTitle')),
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
              <Text style={styles.subtitle}>
                {fbt('Enter your old PIN', 'PinScreen.enterYourOldPin')}
              </Text>
              <PinInput
                value={this.state.pin}
                pinLength={this.pinLength}
                onChangeText={this.handleChange}
              />
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangePinScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...OnboardingStyles
})
