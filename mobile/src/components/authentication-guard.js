'use strict'

import React, { Component } from 'react'
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { connect } from 'react-redux'
import TouchID from 'react-native-touch-id'

import PinInput from 'components/pin-input'

const IMAGES_PATH = '../../assets/images/'

class AuthenticationGuard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pin: '',
      error: null
    }
    if (!this.props.settings.biometryType && !this.props.settings.pin) {
      // User has on authenticatio method set, proceed
      this.onSuccess()
    }
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount() {
    if (__DEV__ && false) {
      console.debug('Bypassing authentication prompt')
      this.onSuccess()
    } else if (this.props.settings.biometryType) {
      this.touchAuthenticate()
    }
  }

  touchAuthenticate() {
    TouchID.authenticate('Access Origin Marketplace App')
      .then(() => {
        this.onSuccess()
      })
      .catch(() => {
        this.setState({ error: 'Authentication failed' })
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
        error: 'Incorrect pin code',
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

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image
            resizeMethod={'scale'}
            resizeMode={'contain'}
            source={require(IMAGES_PATH + 'lock-icon.png')}
            style={[styles.image, smallScreen ? { height: '33%' } : {}]}
          />
          {settings.biometryType && (
            <>
              <Text style={styles.title}>Authentication Required</Text>
              {this.state.error && (
                <Text
                  style={styles.invalid}
                  onPress={() => this.state.error && this.touchAuthenticate()}
                >
                  {this.state.error}
                </Text>
              )}
            </>
          )}
          {settings.pin && (
            <>
              <Text style={styles.title}>Pin Required</Text>
              {this.state.error && (
                <Text style={styles.invalid}>{this.state.error}</Text>
              )}
              <PinInput
                value={this.state.pin}
                pinLength={settings.pin.length}
                onChangeText={this.handleChange}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = ({ settings }) => {
  return { settings }
}

export default connect(mapStateToProps)(AuthenticationGuard)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    paddingTop: 0
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  image: {
    marginBottom: '10%'
  },
  title: {
    fontFamily: 'Lato',
    fontSize: 36,
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
