'use strict'

import React, { Component } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'
import get from 'lodash.get'
import CheckBox from 'react-native-check-box'
import DeviceInfo from 'react-native-device-info'

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
      isAcceptChecked: false,
      isCertifyChecked: false,
      loading: true,
      eligible: null,
      countryName: null
    }
  }

  async componentDidMount() {
    const eligibility = await this.props.getGrowthEligibility()
    const eligible =
      get(eligibility, 'data.isEligible.eligibility', null) === 'Eligible'
    const countryName = get(eligibility, 'data.isEligible.countryName')
    this.setState({ loading: false, eligible, countryName })
  }

  handleAcceptTerms = async () => {
    const agreementMessage =
      'I accept the terms of growth campaign version: 1.0'
    const vars = {
      accountId: this.props.wallet.activeAccount.address,
      agreementMessage,
      signature: global.web3.eth.accounts.sign(
        agreementMessage,
        this.props.wallet.activeAccount.privateKey
      ).signature,
      // DeviceInfo.getUniqueId() can be carefully considered a persistent,
      // cross-install unique ID for mobile:
      // https://github.com/react-native-community/react-native-device-info#getuniqueid
      fingerprintData: JSON.stringify({ mobile_id: DeviceInfo.getUniqueID() })
    }
    const result = await this.props.growthEnroll(vars)
    await this.props.setGrowth(result.data.enroll.authToken)
    this.props.navigation.navigate(this.props.nextOnboardingStep)
  }

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
            <fbt desc="GrowthTermsScreen.ineligibleTitle">
              Oops,{' '}
              <fbt:param name="countryName">{this.state.countryName}</fbt:param>{' '}
              is not eligible
            </fbt>
          </Text>
          <Text style={styles.subtitle}>
            <fbt desc="GrowthTermsScreen.ineligibleSubtitle">
              Unfortunately, it looks like you’re currently in a country where
              government regulations do not allow you to participate in Origin
              Rewards.
            </fbt>
          </Text>
          <Text
            style={{
              fontWeight: '600',
              marginTop: 20,
              marginBottom: 10,
              fontSize: 16
            }}
          >
            <fbt desc="GrowthTermsScreen.ineligibleDetection">
              Did we detect your country incorrectly?
            </fbt>
          </Text>
          <CheckBox
            style={{ padding: 20 }}
            onClick={() => {
              this.setState({
                isChecked: !this.state.isCertifyChecked
              })
            }}
            isChecked={this.state.isCertifyChecked}
            checkBoxColor="#455d75"
            uncheckedCheckBoxColor="#455d75"
            rightTextView={
              <Text style={{ fontSize: 16, marginLeft: 5, fontWeight: '300' }}>
                <fbt desc="GrowthTermsScreen.nonResidentCertification">
                  I certify that I am not a citizen or resident of
                  <fbt:param name="countryName">
                    {this.state.countryName}
                  </fbt:param>
                </fbt>
              </Text>
            }
          />
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            disabled={!this.state.isCertifyChecked}
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
              this.props.navigation.navigate(this.props.nextOnboardingStep)
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
            <fbt desc="GrowthTermsScreen.termsHeader">
              Join Origin’s reward program to earn Origin tokens (OGN). Terms &
              conditions apply.
            </fbt>
          </Text>
          <Text style={styles.termsText}>
            <fbt desc="GrowthTermsScreen.termsTextOne">
              Earned OGN will be distributed at the end of each campaign. OGN is
              currently locked for usage on the Origin platform and cannot be
              transferred. It is expected that OGN will be unlocked and
              transferrable in the future.
            </fbt>
          </Text>
          <Text style={styles.termsText}>
            <fbt desc="GrowthTermsScreen.termsTextTwo">
              By joining the Origin rewards program, you agree that you will not
              transfer or sell future earned Origin tokens to other for at least
              1 year from the date of earning your tokens.
            </fbt>
          </Text>
          <View style={styles.termsHighlightContainer}>
            <Text style={styles.termsHighlightText}>
              <fbt desc="GrowthTermsScreen.termsHighlightText">
                OGN are being issued in a transaction originally exempt from
                registration under the U.S. Securities Act of 1933, as amended
                (the “Securities Act”), and may not be transferred in the United
                States to, or for the account or benefit of, any U.S. person
                except pursuant to an available exemption from the registration
                requirements of the Securities Act and all applicable state
                securities laws. Terms used above have the meanings given to
                them in Regulation S under the Securities Act and all applicable
                laws and regulations.
              </fbt>
            </Text>
          </View>
          <CheckBox
            style={{ padding: 20 }}
            onClick={() => {
              this.setState({
                isAcceptChecked: !this.state.isAcceptChecked
              })
            }}
            isChecked={this.state.isAcceptChecked}
            checkBoxColor="#455d75"
            uncheckedCheckBoxColor="#455d75"
            rightTextView={
              <Text style={{ fontSize: 16, marginLeft: 5, fontWeight: '300' }}>
                <fbt desc="GrowthTermsScreen.acceptCheckboxText">
                  I accept the terms and conditions
                </fbt>
              </Text>
            }
          />
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Accept Terms', 'GrowthTermsScreen.acceptTermsButton')}
            disabled={!this.state.isAcceptChecked}
            onPress={() => this.handleAcceptTerms()}
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
