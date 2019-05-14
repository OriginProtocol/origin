'use strict'

import React, { Component } from 'react'
import {
  DeviceEventEmitter,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'

import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../../assets/images/'

class WelcomeScreen extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image
            resizeMethod={'scale'}
            resizeMode={'contain'}
            source={require(IMAGES_PATH + 'origin-dark-logo.png')}
            style={[styles.image, smallScreen ? { height: '33%' } : {}]}
          />
          <Text style={styles.title}>Buy and sell stuff with crypto.</Text>
          <Text style={styles.title}>Earn rewards.</Text>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Create a wallet'}
            onPress={() => {
              DeviceEventEmitter.emit('createAccount')
              this.props.navigation.navigate('Authentication')
            }}
          />
          <OriginButton
            size="large"
            type="link"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'I already have a wallet'}
            onPress={() => {
              this.props.navigation.navigate('ImportAccount')
            }}
          />
        </View>
        <View style={styles.legalContainer}>
          <Text style={styles.legal}>
            By signing up you agree to the Terms of Use and Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    paddingTop: 0
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  buttonsContainer: {
    paddingTop: 10,
    width: '100%'
  },
  button: {
    marginBottom: 20,
    marginHorizontal: 50
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
  }
})

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(WelcomeScreen)
