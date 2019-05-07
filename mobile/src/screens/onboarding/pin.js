'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'

import { setPin } from 'actions/Settings'

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
    const placeholder = []
    for (let i = 0; i < this.pinLength; i++) {
      placeholder.push(this.renderPlaceholder(i))
    }

    const title = this.state.verifyPin
      ? 'Re-enter Pin Code'
      : 'Create a Pin Code'

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {this.state.isRetry === true && (
            <Text style={[styles.retry, styles.invalid]}>
              Pins did not match, try again
            </Text>
          )}
          <View style={styles.pinCode}>{placeholder}</View>
          <TextInput
            autoFocus={true}
            blurOnSubmit={false}
            value={this.state.pin}
            enablesReturnKeyAutomatically={false}
            keyboardType="numeric"
            pinLength={this.pinLength}
            onChangeText={this.handleChange}
            style={styles.input}
          />
        </View>
        <View style={styles.legalContainer}>
          <Text style={styles.legal}>
            Your Pin Code will be used to login to the app.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  renderPlaceholder(i) {
    const value = this.state.pin[i] ? this.state.pin[i] : '-'
    return (
      <Text style={styles.pinCodeText} key={i}>
        {value}
      </Text>
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
  pinCode: {
    flex: -1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    width: 250
  },
  pinCodeText: {
    fontSize: 40
  },
  input: {
    right: -400
  },
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000'
  }
})
