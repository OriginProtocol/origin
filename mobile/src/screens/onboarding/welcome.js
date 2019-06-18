'use strict'

import React, { Component } from 'react'
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import OnboardingStyles from 'styles/onboarding'
import { createAccount } from 'actions/Wallet'

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
          {wallet.accounts.length === 0 && (
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
                      this.props.createAccount()
                      this.props.navigation.navigate(
                        this.props.nextOnboardingStep
                      )
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
          {wallet.accounts.length > 0 && (
            <OriginButton
              size="large"
              type="primary"
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={fbt('Continue', 'WelcomeScreen.continueButton')}
              onPress={() => {
                this.props.navigation.navigate(this.props.nextOnboardingStep)
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

const mapDispatchToProps = dispatch => ({
  createAccount: () => dispatch(createAccount())
})

export default withOnboardingSteps(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(WelcomeScreen)
)

const styles = StyleSheet.create({
  ...OnboardingStyles,
  image: {
    marginBottom: 30
  }
})
