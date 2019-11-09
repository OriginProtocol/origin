'use strict'

import React, { Component } from 'react'
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import TouchID from 'react-native-touch-id'
import AndroidOpenSettings from 'react-native-android-open-settings'
import { fbt } from 'fbt-runtime'

import { setBiometryType } from 'actions/Settings'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const IMAGES_PATH = '../../assets/images/'

class AuthenticationScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      biometryType: null,
      biometryError: {}
    }
  }

  componentDidMount() {
    TouchID.isSupported()
      .then(biometryType => this.setState({ biometryType }))
      .catch(() => {
        console.debug('No biometry available')
      })
  }

  render() {
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812

    let biometryButtonTitle
    if (this.state.biometryType === 'FaceID') {
      biometryButtonTitle = 'Use Face ID'
    } else if (
      this.state.biometryType === 'TouchID' ||
      this.state.biometryType
    ) {
      biometryButtonTitle = 'Use Touch ID'
    }

    const biometryPermissionDenied = [
      'LAErrorTouchIDNotAvailable',
      'LAErrorTouchIDNotEnrolled'
    ].includes(this.state.biometryError.name)

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {biometryPermissionDenied ? (
            <>
              <Text style={styles.title}>
                <fbt desc="AuthenticationScreen.biometryDisabledTitle">
                  <fbt:param name="biometryType">
                    {this.state.biometryType}
                  </fbt:param>{' '}
                  Unavailable
                </fbt>
              </Text>
              <Text style={styles.subtitle}>
                <fbt desc="AuthenticationScreen.biometryDisabledSubtitle">
                  It looks like you have{' '}
                  <fbt:param name="biometryType">
                    {this.state.biometryType}
                  </fbt:param>{' '}
                  disabled. You will need to enable it in the settings for the
                  Origin Marketplace App.
                </fbt>
              </Text>
              <OriginButton
                size="large"
                type="primary"
                style={{ marginTop: 40 }}
                title={fbt(
                  'Open Settings',
                  'AuthenticationScreen.openSettingsButton'
                )}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:')
                  } else {
                    AndroidOpenSettings.appDetailsSettings()
                  }
                }}
              />
            </>
          ) : (
            <>
              <Image
                resizeMethod={'scale'}
                resizeMode={'contain'}
                source={require(IMAGES_PATH + 'lock-icon.png')}
                style={[styles.image, smallScreen ? { height: '33%' } : {}]}
              />
              <Text style={styles.title}>
                <fbt desc="AuthenticationScreen.title">Protect your wallet</fbt>
              </Text>
              <Text style={styles.subtitle}>
                <fbt desc="AuthenticationScreen.subtitle">
                  Add an extra layer of security to keep your crypto safe.
                </fbt>
              </Text>
            </>
          )}
        </View>
        <View style={styles.buttonContainer}>
          {biometryButtonTitle && (
            <OriginButton
              size="large"
              type="primary"
              title={biometryButtonTitle}
              onPress={() => {
                TouchID.authenticate('Enable access to Origin Marketplace App')
                  .then(() => {
                    this.props.setBiometryType(this.state.biometryType)
                    this.props.navigation.navigate('Main')
                  })
                  .catch(error => {
                    console.warn('Biometry failure: ', error)
                    this.setState({ biometryError: error })
                  })
              }}
            />
          )}
          <OriginButton
            size="large"
            type="link"
            title={fbt(
              'Create a Pin Code',
              'AuthenticationScreen.createPinCode'
            )}
            onPress={() => {
              this.props.navigation.navigate('Pin')
            }}
          />
        </View>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

const mapDispatchToProps = dispatch => ({
  setBiometryType: biometryType => dispatch(setBiometryType(biometryType))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthenticationScreen)

const styles = StyleSheet.create({
  ...CommonStyles
})
