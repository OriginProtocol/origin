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
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../../assets/images/'

class WelcomeScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false
    }
  }

  render() {
    const { wallet } = this.props
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812
    const onboardingStep = this.props.navigation.getParam('onboardingStep')

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image
            resizeMethod={'scale'}
            resizeMode={'contain'}
            source={require(IMAGES_PATH + 'origin-dark-logo.png')}
            style={[styles.image, smallScreen ? { height: '33%' } : {}]}
          />
          <Text style={styles.title}>
            <fbt desc="WelcomeScreen.title">
              Buy and sell stuff with crypto.
            </fbt>
          </Text>
          <Text style={styles.title}>
            <fbt desc="WelcomeScreen.subtitle">Earn rewards.</fbt>
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          {!onboardingStep && (
            <>
              <OriginButton
                size="large"
                type="primary"
                style={styles.button}
                textStyle={{ fontSize: 18, fontWeight: '900' }}
                title={fbt(
                  'Create a wallet',
                  'WelcomeScreen.createWalletButton'
                )}
                loading={this.state.loading}
                disabled={this.state.loading}
                onPress={() => {
                  this.setState({ loading: true }, () => {
                    setTimeout(() => {
                      DeviceEventEmitter.emit('createAccount')
                      this.props.navigation.navigate('Authentication')
                    })
                  })
                }}
              />
              <OriginButton
                size="large"
                type="link"
                style={styles.button}
                textStyle={{ fontSize: 18, fontWeight: '900' }}
                title={fbt(
                  'I already have a wallet',
                  'WelcomeScreen.importWalletButton'
                )}
                disabled={this.state.loading}
                onPress={() => {
                  this.props.navigation.navigate('ImportAccount')
                }}
              />
            </>
          )}
          {onboardingStep && (
            <OriginButton
              size="large"
              type="primary"
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={fbt('Next', 'WelcomeScreen.nextButton')}
              onPress={() => {
                this.props.navigation.navigate(onboardingStep)
              }}
            />
          )}
        </View>
        <View style={styles.legalContainer}>
          <Text style={styles.legal}>
            <fbt desc="WelcomeScreen.disclaimer">
              By signing up you agree to the Terms of Use and Privacy Policy
            </fbt>
          </Text>
        </View>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(WelcomeScreen)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 0
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  buttonsContainer: {
    width: '100%'
  },
  button: {
    marginBottom: 20,
    marginHorizontal: 50
  },
  legalContainer: {
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
    fontSize: 30,
    fontWeight: '600',
    marginHorizontal: 50,
    paddingBottom: 30,
    textAlign: 'center'
  }
})
