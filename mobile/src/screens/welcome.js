'use strict'

import React, { Component } from 'react'
import {
  Image,
  ImageBackground,
  Linking,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'
import SafeAreaView from 'react-native-safe-area-view'
import RNSamsungBKS from 'react-native-samsung-bks'

import { createAccount } from 'actions/Wallet'
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
    // Authentication type of null means it has never been set, and false
    // means it was once set but was disabled in settings
    const hasAuthentication = biometryType !== null || pin !== null
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
        this.props.navigation.navigate('AccountCreated')
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
      <ImageBackground
        source={require(IMAGES_PATH + 'video-bg.png')}
        style={{ width: '100%', height: '100%' }}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Image
              resizeMethod={'scale'}
              resizeMode={'contain'}
              source={require(IMAGES_PATH + 'origin-white-logo.png')}
              style={styles.image}
            />
            <Text style={{ ...styles.title, color: 'white' }}>
              <fbt desc="WelcomeScreen.title">
                Buy and sell anything using crypto.
              </fbt>
            </Text>
            <Text style={{ ...styles.title, color: 'white' }}>
              <fbt desc="WelcomeScreen.subtitle">
                Earn rewards and own a stake in the network.
              </fbt>
            </Text>
          </View>
          <View style={styles.buttonContainer}>{action}</View>
        </SafeAreaView>
      </ImageBackground>
    )
  }

  renderSamsungBKSRequiresSetup() {
    return (
      <>
        <Text style={styles.text}>
          Your phone supports Samsung Blockchain Keystore but it needs to be
          configured.
        </Text>
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
          textStyle={{ color: 'white' }}
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
        <Text style={styles.text}>
          Your phone supports Samsung Blockchain Keystore and we&apos;ve
          detected an account.
        </Text>
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
          const isMnemonic =
            this.props.wallet.activeAccount &&
            this.props.wallet.activeAccount.mnemonic !== undefined
          const isUsingSamsungBKS =
            this.props.wallet.activeAccount &&
            this.props.wallet.activeAccount.hdPath
          if (isMnemonic && !isUsingSamsungBKS) {
            // Force backup if account has mnemonic and it is not a Samsung
            // BKS account. Samsung BKS accounts will have gone through the
            // BKS onboarding/backup flow.
            this.props.navigation.navigate('AccountCreated')
          } else {
            this.props.navigation.navigate('Authentication')
          }
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

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeScreen)

const styles = StyleSheet.create({
  ...CommonStyles,
  text: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Lato',
    marginBottom: 20
  }
})
