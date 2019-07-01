'use strict'

import React, { Component } from 'react'
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import TouchID from 'react-native-touch-id'
import { fbt } from 'fbt-runtime'

import PinInput from 'components/pin-input'
import CommonStyles from 'styles/common'

const IMAGES_PATH = '../../assets/images/'

class AuthenticationGuard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pin: '',
      error: null
    }
    if (!this.props.settings.biometryType && !this.props.settings.pin) {
      // User has an authentication method set, proceed
      this.onSuccess()
    }
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount() {
    if (this.props.settings.biometryType) {
      this.touchAuthenticate()
    }
  }

  touchAuthenticate() {
    TouchID.authenticate('Access Origin Marketplace App')
      .then(() => {
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

  onSuccess() {
    const onSuccess = this.props.navigation.getParam('navigateOnSuccess')
    if (onSuccess) {
      this.props.navigation.navigate(onSuccess)
    }
  }

  async handleChange(pin) {
    await this.setState({ pin })
    if (this.state.pin === this.props.settings.pin) {
      this.onSuccess()
    } else if (this.state.pin.length === this.props.settings.pin.length) {
      this.setState({
        error: String(
          fbt('Incorrect pin code', 'AuthenticationGuard.incorrectPinError')
        ),
        pin: ''
      })
    } else {
      this.setState({
        error: null
      })
    }
  }

  render() {
    const { settings } = this.props
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812
    const guard = settings.biometryType
      ? this.renderBiometryGuard()
      : this.renderPinGuard()

    return (
      <KeyboardAvoidingView style={styles.keyboardWrapper} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          style={styles.container}
        >
          <View style={styles.content}>
            <Image
              resizeMethod={'scale'}
              resizeMode={'contain'}
              source={require(IMAGES_PATH + 'lock-icon.png')}
              style={[styles.image, smallScreen ? { height: '33%' } : {}]}
            />
            {guard}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  renderBiometryGuard() {
    return (
      <>
        <Text style={styles.title}>
          <fbt desc="AuthenticationGuard.biometryTitle">
            Authentication required
          </fbt>
        </Text>
        {this.state.error && (
          <Text
            style={styles.invalid}
            onPress={() => this.state.error && this.touchAuthenticate()}
          >
            {this.state.error}
          </Text>
        )}
      </>
    )
  }

  renderPinGuard() {
    const { settings } = this.props
    return (
      <>
        <Text style={styles.title}>
          <fbt desc="AuthenticationGuard.pinTitle">Pin required</fbt>
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
  ...CommonStyles,
  keyboardWrapper: {
    flex: 1
  },
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  invalid: {
    borderColor: '#ff0000',
    color: '#ff0000'
  }
})
