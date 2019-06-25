'use strict'

import React, { Component } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'
import get from 'lodash.get'
import CheckBox from 'react-native-check-box'

import OriginButton from 'components/origin-button'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import withOriginGraphql from 'hoc/withOriginGraphql'
import OnboardingStyles from 'styles/onboarding'
import { setGrowth } from 'actions/Onboarding'

const IMAGES_PATH = '../../../assets/images/'

class GrowthTermsScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isChecked: false,
      loading: true,
      eligible: null,
      countryName: null
    }
  }

  async componentDidMount() {
    const eligibility = await this.props.getGrowthEligibility()
    const eligible =
      get(eligibility, 'data.isEligible.eligibility', null) === 'Eligibled'
    const countryName = get(eligibility, 'data.isEligible.countryName')
    this.setState({ loading: false, eligible, countryName })
  }

  growthEnroll() {}

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.state.loading
          ? this.renderLoading()
          : this.state.eligible
          ? this.renderTerms()
          : this.renderIneligible()}
      </SafeAreaView>
    )
  }

  renderLoading() {
    return (
      <View style={styles.content}>
        <Text style={styles.title}>
          <fbt desc="GrowthTermsScreen.loadingTitle">Checking eligibility</fbt>
        </Text>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  renderIneligible() {
    return (
      <>
        <View style={styles.content}>
          <Image
            style={{ marginBottom: 40 }}
            source={require(IMAGES_PATH + 'not-eligible-graphic.png')}
          />
          <Text style={styles.title}>
            Oops, {this.state.countryName} is not eligible
          </Text>
          <Text style={styles.subtitle}>
            Unfortunately, it looks like you’re currently in a country where
            government regulations do not allow you to participate in Origin
            Rewards.
          </Text>
          <Text style={{ fontWeight: '600', marginTop: 20, marginBottom: 10, fontSize: 16 }}>
            Did we detect your country incorrectly?
          </Text>
          <CheckBox
            style={{ padding: 20 }}
            onClick={()=>{
              this.setState({
                isChecked: !this.state.isChecked
              })
            }}
            isChecked={this.state.isChecked}
            checkBoxColor='#455d75'
            uncheckedCheckBoxColor='#455d75'
            rightTextView={
              <Text style={{ fontSize: 16, marginLeft: 5, fontWeight: '300' }}>
                I certify that I am not a citizen or resident of {this.state.countryName}
              </Text>
            }
          />
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            disabled={!this.state.isChecked}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Continue', 'GrowthTermsScreen.continueButton')}
            onPress={() => this.setState({ eligible: true })}
          />
          <OriginButton
            size="large"
            type="link"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Cancel', 'GrowthTermsScreen.skipButton')}
            onPress={() => {
              this.props.setGrowth(false)
              this.props.navigation.navigate(
                this.props.nextOnboardingStep
              )
            }}
          />
        </View>
      </>
    )
  }

  renderTerms() {
    return (
      <>
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
            onPress={() => this.growthEnroll()}
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
      </>
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
  withOnboardingSteps(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(GrowthTermsScreen)
  )
)

const styles = StyleSheet.create({
  ...OnboardingStyles
})
