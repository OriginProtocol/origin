'use strict'

import React, { Component } from 'react'
import {
  AppState,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native'
import { connect } from 'react-redux'
import TouchID from 'react-native-touch-id'
import { fbt } from 'fbt-runtime'
import RNRestart from 'react-native-restart'

import CommonStyles from 'styles/common'
import PinInput from 'components/pin-input'
import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

/* The minimum amount of time the app needs to be suspended to trigger a restart when
 * it becomes active again - in seconds.
 *
 * This is a compromise to handle the "white screen of death" bug without sacrificing
 * security. If the app is suspended for a smaller interval a restart is not triggered
 * and the user doesn't need to unlock the app with biometrics / pin code.
 */
const RESTART_SUSPEND_TIME = 60 * 60

class AuthenticationGuard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pin: '',
      error: null,
      // If authentication is set display on init
      display: this._hasAuthentication(),
      suspendTime: null,
      appState: AppState.currentState
    }
  }

  componentDidMount() {
    if (this.props.settings.biometryType) {
      this.touchAuthenticate()
    }

    AppState.addEventListener('change', this._handleAppStateChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _hasAuthentication = () => {
    return this.props.settings.biometryType || this.props.settings.pin
  }

  _handleAppStateChange = nextAppState => {
    // app going to background
    if (nextAppState === 'background') {
      this.setState({
        suspendTime: new Date()
      })
    }

    // app coming from background
    if (this.state.appState === 'background' && nextAppState === 'active') {
      const secondsFromSuspend = (new Date() - this.state.suspendTime) / 1000

      if (secondsFromSuspend > RESTART_SUSPEND_TIME) {
        console.debug('Restart called')
        RNRestart.Restart()
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
      .catch(() => {
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
    this.setState({ display: false })
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
    return this.state.display ? this.renderModal() : null
  }

  renderModal() {
    const { settings } = this.props

    const guard = settings.biometryType
      ? this.renderBiometryGuard()
      : settings.pin
      ? this.renderPinGuard()
      : null

    return (
      <Modal visible={true}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
        >
          <Image
            resizeMethod={'scale'}
            resizeMode={'contain'}
            source={require(IMAGES_PATH + 'lock-icon.png')}
            style={styles.image}
          />
          {guard}
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
