'use strict'

import React, { Component } from 'react'
import { Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import { setNoRewardsDismissed } from 'actions/Onboarding'
import { removeAccount } from 'actions/Wallet'
import BackArrow from 'components/back-arrow'
import OriginButton from 'components/origin-button'
import NoRewardsCard from 'components/no-rewards-card'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import CommonStyles from 'styles/common'
import OnboardingStyles from 'styles/onboarding'

const IMAGES_PATH = '../../assets/images/'

class ImportWarningScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayModal: false,
      loading: false
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={{ ...styles.container, justifyContent: 'flex-start' }}>
            <BackArrow
              onClick={() => this.props.navigation.goBack(null)}
              style={styles.backArrow}
            />
          </View>
          <View
            style={{
              ...styles.container,
              flexGrow: 2
            }}
          >
            <Image
              resizeMethod={'scale'}
              resizeMode={'contain'}
              source={require(IMAGES_PATH + 'other-wallet-graphic.png')}
              style={styles.image}
            />
            <Text style={styles.title}>
              <fbt desc="ImportWarningScreen.title">
                Other Wallet Detected
              </fbt>
            </Text>
            <Text style={{ ...styles.subtitle, fontSize: 14, fontWeight: 'normal' }}>
              <fbt desc="ImportWarningScreen.subtitle">
                We've noticed that you previously signed up for Origin Rewards using this email with a different wallet. Please import your other wallet to continue earning Origin Rewards.
              </fbt>
            </Text>
          </View>
          <View style={{ ...styles.container, ...styles.buttonContainer }}>
            <OriginButton
              size="large"
              type="primary"
              title={fbt(
                'Import other wallet',
                'ImportWarningScreen.continueButton'
              )}
              onPress={() => {
                this.props.removeAccount(this.props.wallet.activeAccount)
                this.props.navigation.navigate('ImportAccount')
              }}
            />
            <OriginButton
              size="large"
              type="link"
              title={fbt(
                `Continue without rewards`,
                'ImportWarningScreen.continueButton'
              )}
              onPress={() => {
                this.setState({ displayModal: true })
              }}
            />
          </View>
          {this.renderModal()}
        </ScrollView>
      </SafeAreaView>
    )
  }

  renderModal() {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.state.displayModal}
        onRequestClose={() => this.setState({ displayModal: false })}
      >
        <SafeAreaView style={styles.darkOverlay}>
          <NoRewardsCard
            onRequestClose={() => this.setState({ displayModal: false })}
            onConfirm={async () => {
              await this.props.setNoRewardsDismissed(true)
              await this.setState({ displayModal: false })
              this.props.navigation.state.params.onGoBack()
              this.props.navigation.goBack()
            }}
          />
        </SafeAreaView>
      </Modal>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

const mapDispatchToProps = dispatch => ({
  removeAccount: account => dispatch(removeAccount(account)),
  setNoRewardsDismissed: dismissed => dispatch(setNoRewardsDismissed(dismissed))
})

export default withOnboardingSteps(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ImportWarningScreen)
)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...OnboardingStyles
})
