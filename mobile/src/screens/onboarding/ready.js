'use strict'

import React, { Component } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import { fbt } from 'fbt-runtime'
import { connect } from 'react-redux'
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
    this.publishIdentity()
  }

  publishIdentity = async () => {
    const profile = {
      firstName: this.props.onboarding.firstName || '',
      lastName: this.props.onboarding.lastName || '',
      avatarUrl: this.props.onboarding.avatarUri || ''
    }

    const attestations = []
    if (this.props.onboarding.emailAttestation) {
      attestations.push(JSON.stringify(this.props.onboarding.emailAttestation))
    }
    if (this.props.onboarding.phoneAttestation) {
      attestations.push(JSON.stringify(this.props.onboarding.phoneAttestation))
    }

    console.debug('Publishing identity')

    let identityPublication
    try {
      identityPublication = await this.props.publishIdentity(
        this.props.wallet.activeAccount.address,
        profile,
        attestations
      )
    } catch (error) {
      console.warn('Identity publication failed: ', error)
      this.setState({ error: true })
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
            title={fbt('Start using Origin', 'ReadyScreen.button')}
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
