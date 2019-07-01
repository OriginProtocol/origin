'use strict'

import React, { Component } from 'react'
import { Alert, Image, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import { setGrowth } from 'actions/Onboarding'
import OriginButton from 'components/origin-button'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import CommonStyles from 'styles/common'
import OnboardingStyles from 'styles/onboarding'

const IMAGES_PATH = '../../../assets/images/'

class GrowthScreen extends Component {
  displayConfirm() {
    Alert.alert(
      String(
        fbt(
          "Are you sure you don't want Origin Rewards?",
          'GrowthScreen.alertTitle'
        )
      ),
      String(
        fbt(
          'You will not be able to earn OGN on Origin, but you can still verify your profile.',
          'GrowthScreen.alertMessage'
        )
      ),
      [
        {
          text: String(fbt('No, wait', 'GrowthScreen.alertCancel')),
          onPress: () => console.log('Cancel'),
          style: 'cancel'
        },
        {
          text: String(fbt("I'm, sure", 'GrowthScreen.alertConfirm')),
          onPress: () => {
            this.props.setGrowth(false)
            this.props.navigation.navigate(this.props.nextOnboardingStep)
          }
        }
      ]
    )
  }

  render() {
    return (
      <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>
        <Image
          resizeMethod={'scale'}
          resizeMode={'cover'}
          style={{ ...styles.image, width: '100%' }}
          source={require(IMAGES_PATH + 'ogn-image.png')}
        />
        <View style={{ ...styles.container, marginTop: 10 }}>
          <Image
            style={styles.image}
            source={require(IMAGES_PATH + 'rewards-logo.png')}
          />
          <Text style={styles.subtitle}>
            Earn Origin Tokens (OGN) by strengthening your profile and
            completing tasks in the Origin Marketplace.
          </Text>
        </View>
        <View style={{ ...styles.container, justifyContent: 'flex-end' }}>
          <OriginButton
            size="large"
            type="primary"
            title={fbt('Yes! Sign me up', 'GrowthScreen.signUpButton')}
            onPress={() => this.props.navigation.navigate('GrowthTerms')}
          />
          <OriginButton
            size="large"
            type="link"
            title={fbt('No, thanks', 'GrowthScreen.rejectButton')}
            onPress={() => this.displayConfirm()}
          />
        </View>
      </SafeAreaView>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  setGrowth: value => dispatch(setGrowth(value))
})

export default withOnboardingSteps(
  connect(
    null,
    mapDispatchToProps
  )(GrowthScreen)
)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...OnboardingStyles
})
