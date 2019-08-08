'use strict'

import React, { Component } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import { createAccount } from 'actions/Wallet'
import Disclaimer from 'components/disclaimer'
import OriginButton from 'components/origin-button'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import CommonStyles from 'styles/common'
import OnboardingStyles from 'styles/onboarding'

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

    return (
      <SafeAreaView style={styles.content}>
        <View style={{ ...styles.container, flexGrow: 2 }}>
          <Image
            resizeMethod={'scale'}
            resizeMode={'contain'}
            source={require(IMAGES_PATH + 'origin-dark-logo.png')}
            style={styles.image}
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
        <View style={styles.container}>
          {wallet.accounts.length === 0 && (
            <>
              <OriginButton
                size="large"
                type="primary"
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
                      this.setState({ loading: false })
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
                title={fbt(
                  'I already have a wallet',
                  'WelcomeScreen.importWalletButton'
                )}
                disabled={this.state.loading}
                onPress={() => {
                  this.setState({ loading: false })
                  this.props.navigation.navigate('ImportAccount')
                }}
              />
            </>
          )}
          {wallet.accounts.length > 0 && (
            <OriginButton
              size="large"
              type="primary"
              title={fbt('Continue', 'WelcomeScreen.continueButton')}
              onPress={() => {
                this.props.navigation.navigate(this.props.nextOnboardingStep)
              }}
            />
          )}
          <Disclaimer>
            <fbt desc="WelcomeScreen.disclaimer">
              By signing up you agree to the Terms of Use and Privacy Policy
            </fbt>
          </Disclaimer>
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
  ...CommonStyles,
  ...OnboardingStyles
})
