'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import { setPin } from 'actions/Settings'
import PinInput from 'components/pin-input'

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
          this.props.navigation.navigate('Ready')
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
      ? 'Re-enter Pin Code'
      : 'Create a Pin Code'

    return (
      <SafeAreaView style={styles.container}>
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
        </View>
        <View style={styles.legalContainer}>
          <Text style={styles.legal}>
            <fbt desc="PinScreen.disclaimer">
              Your Pin Code will be used to login to the app.
            </fbt>
          </Text>
        </View>
      </SafeAreaView>
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
)(PinScreen)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    paddingTop: 0
  },
  legalContainer: {
    paddingTop: 20,
    paddingBottom: 30,
    width: '80%'
  },
  legal: {
    textAlign: 'center',
    color: '#98a7b4'
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
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
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000'
  }
})
