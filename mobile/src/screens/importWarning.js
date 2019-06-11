'use strict'

import React, { Component } from 'react'
import {
  DeviceEventEmitter,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import withWeb3Accounts from 'hoc/withWeb3Accounts'
import OnboardingStyles from 'styles/onboarding'

const IMAGES_PATH = '../../assets/images/'

class ImportWarningScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }

  render() {
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image
            resizeMethod={'scale'}
            resizeMode={'contain'}
            source={require(IMAGES_PATH + 'earn-more-graphic.png')}
            style={[styles.image, smallScreen ? { height: '33%' } : {}]}
          />
          <Text style={styles.title}>
            <fbt desc="ImportWarningScreen.title">
              Import your wallet to earn more OGN
            </fbt>
          </Text>
          <Text style={styles.subtitle}>
            <fbt desc="ImportWarningScreen.subtitle">
              We’ve detected an existing wallet associated with this email.
              Please import it to continue earning rewards.
            </fbt>
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Import a wallet', 'ImportWarningScreen.continueButton')}
            onPress={() => {
              DeviceEventEmitter.emit(
                'removeAccount',
                this.props.wallet.activeAccount
              )
              this.props.navigation.navigate('ImportAccount')
            }}
          />
        </View>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default withWeb3Accounts(
  withOnboardingSteps(connect(mapStateToProps)(ImportWarningScreen))
)

const styles = StyleSheet.create({
  ...OnboardingStyles,
  image: {
    marginBottom: 30
  }
})
