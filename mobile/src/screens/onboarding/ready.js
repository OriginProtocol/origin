'use strict'

import React, { Component } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'
import { connect } from 'react-redux'

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
      loading: true
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

    try {
      await this.props.publishIdentity(
        this.props.wallet.activeAccount.address,
        profile,
        attestations
      )
    } catch (error) {
      console.warn('Identity publication failed: ', error)
    }

    this.props.setOnboardingComplete(true)

    this.setState({ loading: false })
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
        <Text style={styles.title}>
          <fbt desc="ReadyScreen.loadingTitle">Publishing your account</fbt>
        </Text>
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
