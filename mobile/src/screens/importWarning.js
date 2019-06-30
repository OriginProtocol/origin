'use strict'

import React, { Component } from 'react'
import { Dimensions, Image, Modal, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'

import OriginButton from 'components/origin-button'
import NoRewardsCard from 'components/no-rewards-card'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import OnboardingStyles from 'styles/onboarding'
import { setNoRewardsDismissed } from 'actions/Onboarding'
import { removeAccount } from 'actions/Wallet'

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
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812

    return (
      <SafeAreaView style={styles.content}>
        <View
          style={{ ...styles.container, justifyContent: 'center', flexGrow: 2 }}
        >
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
        <View style={{ ...styles.container, justifyContent: 'flex-end' }}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Import a wallet', 'ImportWarningScreen.continueButton')}
            onPress={() => {
              this.props.removeAccount(this.props.wallet.activeAccount)
              this.props.navigation.navigate('ImportAccount')
            }}
          />
          <OriginButton
            size="large"
            type="link"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
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
      </SafeAreaView>
    )
  }

  renderModal() {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.state.displayModal}
        onRequestClose={() => this.toggleModal()}
      >
        <SafeAreaView style={styles.modalSafeAreaView}>
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
  ...OnboardingStyles,
  modalSafeAreaView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  },
  image: {
    marginBottom: 30
  }
})
