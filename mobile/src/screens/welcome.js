'use strict'

import React, { Component } from 'react'
import { Image, Linking, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'
import SafeAreaView from 'react-native-safe-area-view'
import RNSamsungBKS from 'react-native-samsung-bks'

import { createAccount } from 'actions/Wallet'
import Disclaimer from 'components/disclaimer'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const IMAGES_PATH = '../../assets/images/'

class WelcomeScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }

  componentDidMount = async () => {
    const { biometryType, pin } = this.props.settings
    const hasAuthentication = biometryType || pin
    const hasAccount = this.props.wallet.accounts.length > 0
    if (hasAuthentication && hasAccount) {
      console.debug('Onboarding is completed')
      this.props.navigation.navigate('Main')
    }
  }

  handleCreateWallet = async () => {
    this.setState({ loading: true }, () => {
      setTimeout(() => {
        this.props.createAccount()
        this.setState({ loading: false })
        this.props.navigation.navigate('Authentication')
      })
    })
  }

  handleImportWallet = async () => {
    this.setState({ loading: false })
    this.props.navigation.navigate('ImportAccount')
  }

  render() {
    let action
    if (this.props.samsungBKS.seedHash === '') {
      action = this.renderSamsungBKSRequiresSetup()
    } else if (
      this.props.samsungBKS.seedHash &&
      this.props.samsungBKS.seedHash.length > 0
    ) {
      action = this.renderSamsungBKSDetectedMessage()
    } else if (this.props.wallet.accounts.length === 0) {
      action = this.renderWalletButtons()
    } else {
      action = this.renderContinueButton()
    }

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
          {action}
          <Disclaimer>
            <fbt desc="WelcomeScreen.disclaimer">
              By signing up you agree to the Terms of Use and Privacy Policy
            </fbt>
          </Disclaimer>
        </View>
      </SafeAreaView>
    )
  }

  renderSamsungBKSRequiresSetup() {
    return (
      <>
        <View style={styles.container}>
          <Text style={styles.text}>
            Your phone supports Samsung Blockchain Keystore but it needs to be
            configured.
          </Text>
        </View>
        <OriginButton
          size="large"
          type="primary"
          title={fbt('Continue', 'WelcomeScreen.continueButton')}
          onPress={async () => {
            const deepLinks = await RNSamsungBKS.getDeepLinks()
            Linking.openURL(deepLinks['MAIN'])
          }}
        />
      </>
    )
  }

  renderWalletButtons() {
    return (
      <>
        <OriginButton
          size="large"
          type="primary"
          title={fbt('Create a wallet', 'WelcomeScreen.createWalletButton')}
          loading={this.state.loading}
          disabled={this.state.loading}
          onPress={this.handleCreateWallet}
        />
        <OriginButton
          size="large"
          type="link"
          title={fbt(
            'I already have a wallet',
            'WelcomeScreen.importWalletButton'
          )}
          disabled={this.state.loading}
          onPress={this.handleImportWallet}
        />
      </>
    )
  }

  renderSamsungBKSDetectedMessage() {
    return (
      <>
        <View style={styles.container}>
          <Text style={styles.text}>
            Your phone supports Samsung Blockchain Keystore and we&apos;ve
            detected an account.
          </Text>
        </View>
        {this.renderContinueButton()}
      </>
    )
  }

  renderContinueButton() {
    return (
      <OriginButton
        size="large"
        type="primary"
        title={fbt('Continue', 'WelcomeScreen.continueButton')}
        onPress={() => {
          this.props.navigation.navigate('Authentication')
        }}
      />
    )
  }
}

const mapStateToProps = ({ samsungBKS, settings, wallet }) => {
  return { samsungBKS, settings, wallet }
}

const mapDispatchToProps = dispatch => ({
  createAccount: () => dispatch(createAccount())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WelcomeScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  text: {
    textAlign: 'center',
    color: '#98a7b4',
    fontFamily: 'Lato'
  }
})
