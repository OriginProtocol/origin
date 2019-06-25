'use strict'

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import withConfig from 'hoc/withConfig'
import withOriginGraphql from 'hoc/withOriginGraphql'
import OnboardingStyles from 'styles/onboarding'
import { setGrowth } from 'actions/Onboarding'

class GrowthTermsScreen extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.termsHeader}>
            Join Origin’s reward program to earn Origin tokens (OGN). Terms &
            conditions apply.
          </Text>
          <Text style={styles.termsText}>
            Earned OGN will be distributed at the end of each campaign. OGN is
            currently locked for usage on the Origin platform and cannot be
            transferred. It is expected that OGN will be unlocked and
            transferrable in the future.
          </Text>
          <Text style={styles.termsText}>
            By joining the Origin rewards program, you agree that you will not
            transfer or sell future earned Origin tokens to other for at least 1
            year from the date of earning your tokens.
          </Text>
          <View style={styles.termsHighlightContainer}>
            <Text style={styles.termsHighlightText}>
              OGN are being issued in a transaction originally exempt from
              registration under the U.S. Securities Act of 1933, as amended
              (the “Securities Act”), and may not be transferred in the United
              States to, or for the account or benefit of, any U.S. person
              except pursuant to an available exemption from the registration
              requirements of the Securities Act and all applicable state
              securities laws. Terms used above have the meanings given to them
              in Regulation S under the Securities Act and all applicable laws
              and regulations.
            </Text>
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Accept Terms', 'GrowthTermsScreen.acceptTermsButton')}
          />
          <OriginButton
            size="large"
            type="link"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Cancel', 'GrowthTermsScreen.cancelButton')}
            onPress={() => this.props.navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = ({ marketplace, wallet }) => {
  return { marketplace, wallet }
}

const mapDispatchToProps = dispatch => ({
  setGrowth: value => dispatch(setGrowth(value))
})

export default withOriginGraphql(
  withConfig(
    withOnboardingSteps(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(GrowthTermsScreen)
    )
  )
)

const styles = StyleSheet.create({
  ...OnboardingStyles
})
