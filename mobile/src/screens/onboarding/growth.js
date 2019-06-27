'use strict'

import React, { Component } from 'react'
import { Alert, Image, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import OnboardingStyles from 'styles/onboarding'
import { setGrowth } from 'actions/Onboarding'

const IMAGES_PATH = '../../../assets/images/'

class GrowthScreen extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>
        <Image
          resizeMethod={'scale'}
          resizeMode={'cover'}
          style={{ width: '100%' }}
          source={require(IMAGES_PATH + 'ogn-image.png')}
        />
        <View style={styles.content}>
          <Image
            style={{ marginBottom: 40 }}
            source={require(IMAGES_PATH + 'rewards-logo.png')}
          />
          <Text style={styles.subtitle}>
            Earn Origin Tokens (OGN) by strengthening your profile and
            completing tasks in the Origin Marketplace.
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Yes! Sign me up', 'GrowthScreen.signUpButton')}
            onPress={() => this.props.navigation.navigate('GrowthTerms')}
          />
          <OriginButton
            size="large"
            type="link"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('No, thanks', 'GrowthScreen.rejectButton')}
            onPress={() =>
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
                      this.props.navigation.navigate(
                        this.props.nextOnboardingStep
                      )
                    }
                  }
                ]
              )
            }
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
    mapDispatchToProps
  )(GrowthScreen)
)

const styles = StyleSheet.create({
  ...OnboardingStyles
})
