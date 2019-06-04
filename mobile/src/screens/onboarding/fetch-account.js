'use strict'

import React, { Component } from 'react'
import {
  ActivityIndicator,
  DeviceEventEmitter,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect, mapDispatchToProps } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import OnboardingStyles from 'styles/onboarding'
import { identity } from 'graphql/queries'

class FetchAccountScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      identity: null
    }

    DeviceEventEmitter.addListener(
      'graphqlQueryResponse',
      this.handleIdentity.bind(this)
    )
  }

  componentDidMount() {
    DeviceEventEmitter.emit('graphqlQuery', identity, {
      id: this.props.wallet.activeAccount.address
    })
  }

  handleIdentity(response) {
    this.setState({ loading: false, identitty: response })
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {this.loading ? this.renderLoading() : this.renderIdentity()}
        </View>
      </SafeAreaView>
    )
  }

  renderLoading() {
    return (
      <>
        <Text>Looking for your account</Text>
        <ActivityIndicator />
      </>
    )
  }

  renderIdentity() {
    return (
      <>
        <Text>Hi {this.identity.firstName}</Text>
        <OriginButton
          size="large"
          type="primary"
          style={styles.button}
          textStyle={{ fontSize: 18, fontWeight: '900' }}
          title={fbt('Continue', 'FetchAccountScreen.continueButton')}
          onPress={console.log}
        />
      </>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default withOnboardingSteps(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(FetchAccountScreen)
)

const styles = StyleSheet.create({
  ...OnboardingStyles
})
