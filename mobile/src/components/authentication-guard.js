'use strict'

import React, { Component } from 'react'
import {
  AppState,
  Image,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'
import TouchID from 'react-native-touch-id'
import { fbt } from 'fbt-runtime'

import CommonStyles from 'styles/common'
import PinInput from 'components/pin-input'
import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

class AuthenticationGuard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      appState: AppState.currentState,
      pin: '',
      error: null,
      // If authentication is set displayModal on init
      displayModal: this._hasAuthentication()
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange)

    // Only pop the touch authentication if biometryType is set and the app is
    // in the active state. Sometimes this component can be mounted when the app
    // is backgrounded by authentication redirect on backgrounding. See
    // the MarketplaceApp component in src/Navigation.js.
    if (this.props.settings.biometryType && this.state.appState === 'active') {
      this.touchAuthenticate()
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _hasAuthentication = () => {
    return this.props.settings.biometryType || this.props.settings.pin
  }

  _handleAppStateChange = nextAppState => {
    if (nextAppState === 'background') {
      this.setState({ displayModal: this._hasAuthentication() })
    }
    // If we are coming from a backgrounded state pop the touch authentication
    if (this.props.settings.biometryType) {
      if (this.state.appState === 'background' && nextAppState === 'active') {
        this.touchAuthenticate()
      }
    }
    this.setState({ appState: nextAppState })
  }

  touchAuthenticate = () => {
    TouchID.authenticate('Access Origin Marketplace App')
      .then(() => {
        this.setState({ error: null })
        this.onSuccess()
      })
      .catch(e => {
        console.log(e)
        this.setState({
          error: String(
            fbt(
              'Authentication failed',
              'AuthenticationGuard.biometryFailedError'
            )
          )
        })
      })
  }

  onSuccess = () => {
    this.setState({ displayModal: false })
  }

  handleChange = async pin => {
    await this.setState({ pin })
    if (this.state.pin === this.props.settings.pin) {
      // Reset the state of component
      this.setState({
        pin: '',
        error: null
      })
      this.onSuccess()
    } else if (this.state.pin.length === this.props.settings.pin.length) {
      this.setState({
        error: String(
          fbt('Incorrect pin code', 'AuthenticationGuard.incorrectPinError')
        ),
        pin: ''
      })
    } else {
      // On any other input remove the error
      this.setState({
        error: null
      })
    }
  }

  render() {
    return this.state.displayModal ? this.renderModal() : null
  }

  renderModal() {
    const { settings } = this.props

    const guard = settings.biometryType
      ? this.renderBiometryGuard()
      : settings.pin
      ? this.renderPinGuard()
      : null

    return (
      <Modal animationType="fade" transparent={true} visible={true}>
        <KeyboardAvoidingView style={styles.container} behavior="padding">
          <View style={{ ...styles.container, backgroundColor: 'white' }}>
            <Image
              resizeMethod={'scale'}
              resizeMode={'contain'}
              source={require(IMAGES_PATH + 'lock-icon.png')}
              style={styles.image}
            />
            {guard}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    )
  }

  renderBiometryGuard() {
    return (
      <>
        <TouchableOpacity onPress={this.touchAuthenticate}>
          <Text style={styles.title}>
            <fbt desc="AuthenticationGuard.biometryTitle">
              Authentication Required
            </fbt>
          </Text>
        </TouchableOpacity>
        {this.state.error && (
          <>
            <Text style={styles.invalid}>{this.state.error}</Text>
            <OriginButton
              size="large"
              type="primary"
              style={{ marginTop: 40 }}
              title={fbt('Retry', 'AuthenticationGuard.retryButton')}
              onPress={() => {
                this.touchAuthenticate()
              }}
            />
          </>
        )}
      </>
    )
  }

  renderPinGuard() {
    const { settings } = this.props
    return (
      <>
        <Text style={styles.title}>
          <fbt desc="AuthenticationGuard.pinTitle">Pin Required</fbt>
        </Text>
        {this.state.error && (
          <Text style={styles.invalid}>{this.state.error}</Text>
        )}
        <PinInput
          value={this.state.pin}
          pinLength={settings.pin.length}
          onChangeText={this.handleChange}
        />
      </>
    )
  }
}

const mapStateToProps = ({ settings }) => {
  return { settings }
}

export default connect(mapStateToProps)(AuthenticationGuard)

const styles = StyleSheet.create({
  ...CommonStyles
})
