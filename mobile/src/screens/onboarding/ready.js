'use strict'

import React, { Component } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import { fbt } from 'fbt-runtime'
import { connect } from 'react-redux'
import { Sentry } from 'react-native-sentry'
import SafeAreaView from 'react-native-safe-area-view'
import get from 'lodash.get'

import { setComplete } from 'actions/Onboarding'
import withOriginGraphql from 'hoc/withOriginGraphql'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'
import OnboardingStyles from 'styles/onboarding'

const IMAGES_PATH = '../../../assets/images/'

class ReadyScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      transactionId: null,
      error: false
    }
  }

  async componentDidMount() {
    // Only publish identity if something has changed
    if (this.props.onboarding.requirePublish) {
      this.publishIdentity()
    } else {
      // No need to publish, display ready message
      this.setState({ loading: false, transactionId: null })
    }
  }

  publishIdentity = async () => {
    const profile = {
      firstName: this.props.onboarding.firstName || '',
      lastName: this.props.onboarding.lastName || '',
      avatarUrl: this.props.onboarding.avatarUri || ''
    }

    let identityPublication
    try {
      const wallet = await this.props.getWallet()
      const primaryAccount = get(wallet, 'data.web3.primaryAccount')
      const identityId = primaryAccount.proxy.id
        ? primaryAccount.proxy.id
        : primaryAccount.id
      identityPublication = await this.props.publishIdentity(
        identityId,
        profile,
        this.props.onboarding.attestations
      )
    } catch (error) {
      Sentry.captureException(error)
      console.warn('Identity publication failed: ', error)
      this.setState({ loading: false, error: true })
    }

    const transactionId = get(identityPublication, 'data.deployIdentity.id')
    await this.setState({ transactionId })
    // Wait for identity deployment transaction receipt
    this.waitForTransaction()
    // Flag onboarding as complete
    this.props.setOnboardingComplete(true)
  }

  waitForTransaction = async () => {
    let result
    try {
      result = await this.props.getTransactionReceipt(this.state.transactionId)
    } catch (error) {
      Sentry.captureException(error)
      this.setState({ loading: false, error: true })
      return
    }

    const receipt = get(result, 'data.web3.transactionReceipt')
    const currentBlock = get(result, 'data.web3.blockNumber')
    const confirmedBlock = get(
      result,
      'data.web3.transactionReceipt.blockNumber'
    )

    if (!receipt || currentBlock <= confirmedBlock) {
      // Wait for confirmation
      setTimeout(this.waitForTransaction, 1000)
    } else {
      this.setState({ loading: false, transactionId: null })
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.content}>
        {this.state.loading ? this.renderLoading() : this.renderReady()}
      </SafeAreaView>
    )
  }

  renderReady() {
    return (
      <>
        <View style={{ ...styles.container, flexGrow: 2 }}>
          <Image
            resizeMethod={'scale'}
            resizeMode={'contain'}
            source={require(IMAGES_PATH + 'green-checkmark.png')}
            style={styles.image}
          />
          <Text style={styles.title}>
            <fbt desc="ReadyScreen.title">
              You&apos;re ready to start buying and selling on Origin
            </fbt>
          </Text>
          {this.props.error === true && (
            <Text style={styles.subtitle}>
              <fbt desc="ReadyScreen.error">
                Unfortunately we could not publish your identity on your behalf.
              </fbt>
            </Text>
          )}
        </View>
        <View style={{ ...styles.container, ...styles.buttonContainer }}>
          <OriginButton
            size="large"
            type="primary"
            title={fbt('Start Using Origin', 'ReadyScreen.button')}
            onPress={() => {
              // Navigate to subroute to skip authentication requirement
              this.props.navigation.navigate('App')
            }}
          />
        </View>
      </>
    )
  }

  renderLoading() {
    return (
      <View style={styles.container}>
        {this.state.transactionId === null ? (
          <Text style={styles.title}>
            <fbt desc="ReadyScreen.loadingTitle">Publishing your account</fbt>
          </Text>
        ) : (
          <>
            <Text style={styles.title}>
              <fbt desc="ReadyScreen.transactionWaitTitle">
                Waiting for confirmation.
              </fbt>
            </Text>
            <Text style={{ ...styles.subtitle, marginBottom: 20 }}>
              <fbt desc="ReadyScreen.transactionWaitSubtitle">
                This might take a minute.
              </fbt>
            </Text>
          </>
        )}
        <ActivityIndicator size="large" />
      </View>
    )
  }
}

const mapStateToProps = ({ onboarding, wallet }) => {
  return { onboarding, wallet }
}

const mapDispatchToProps = dispatch => ({
  setOnboardingComplete: complete => dispatch(setComplete(complete))
})

export default withOriginGraphql(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ReadyScreen)
)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...OnboardingStyles
})
