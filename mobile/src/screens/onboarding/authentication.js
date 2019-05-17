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

import { setBiometryType } from 'actions/Settings'
import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../../assets/images/'

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
                {this.state.biometryType} Unavailable
              </Text>
              <Text style={styles.subtitle}>
                It looks like you have {this.state.biometryType} disabled. You
                will need to enable it in the settings for the Origin
                Marketplace App.
              </Text>
              <OriginButton
                size="large"
                type="primary"
                textStyle={{ fontSize: 18, fontWeight: '900' }}
                title={'Open Settings'}
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
              <Text style={styles.title}>Protect your wallet</Text>
              <Text style={styles.subtitle}>
                Add an extra layer of security to keep your crypto safe.
              </Text>
            </>
          )}
        </View>
        <View style={styles.buttonsContainer}>
          {biometryButtonTitle && (
            <OriginButton
              size="large"
              type="primary"
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={biometryButtonTitle}
              onPress={() => {
                TouchID.authenticate('Enable access to Origin Marketplace App')
                  .then(() => {
                    this.props.setBiometryType(this.state.biometryType)
                    this.props.navigation.navigate('Ready')
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
            style={styles.button}
            textStyle={{ fontSize: 16, fontWeight: '900' }}
            title={'Create a Pin Code'}
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
  button: {
    marginBottom: 20,
    marginHorizontal: 50
  },
  buttonsContainer: {
    paddingTop: 10,
    width: '100%'
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
  }
})
