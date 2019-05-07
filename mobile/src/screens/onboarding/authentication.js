'use strict'

import React, { Component } from 'react'
import {
  DeviceEventEmitter,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'

import TouchID from 'react-native-touch-id'

import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../../assets/images/'

class AuthenticationScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      biometryType: null
    }
  }

  componentDidMount() {
    TouchID.isSupported().then(biometryType => this.setState({ biometryType }))
      .catch(() => { console.debug('No biometry available')})
  }

  render() {
    let biometryButtonTitle
    if (this.state.biometryType === 'FaceID') {
      biometryButtonTitle = 'Use Face ID'
    } else if (this.state.biometryType === 'TouchID' || this.state.biometryType) {
      biometryButtonTitle = 'Use Touch ID'
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Protect your wallet</Text>
          <Text style={styles.subtitle}>Add an extra layer of security to keep your crypto safe.</Text>
        </View>
        <View style={styles.buttonsContainer}>
          {biometryButtonTitle &&
            <OriginButton
              size="large"
              type="primary"
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={biometryButtonTitle}
              onPress={() => {
                TouchID.authenticate('Test')
                  .then(success => {
                    this.setBiometryType(this.state.biometryType)
                  })
                  .catch(error => {
                    console.error('Biometry failure: ', error)
                  })
              }}
            />
          }
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

export default connect(mapStateToProps)(AuthenticationScreen)

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
