'use strict'

import React, { Component } from 'react'
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'
import get from 'lodash.get'

import Avatar from 'components/avatar'
import OriginButton from 'components/origin-button'
import LearnCard from 'components/learn-card'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import withConfig from 'hoc/withConfig'
import withOriginGraphql from 'hoc/withOriginGraphql'
import OnboardingStyles from 'styles/onboarding'
import {
  setEmailVerified,
  setPhoneVerified,
  setName,
  setAvatarUri
} from 'actions/Onboarding'
import { setIdentity } from 'actions/Wallet'

const IMAGES_PATH = '../../../assets/images/'

class ImportedScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      identity: {},
      displayModal: false
    }
  }

  async componentDidMount() {
    let response
    try {
      response = await this.props.getIdentity(this.props.wallet.activeAccount.address)
    } catch (error) {
      // Skip, identity couldn't be loaded
      console.warn(error)
    }

    const identity = get(response.data, 'identity')
    if (identity) {
      // Update the onboarding store so we know withOnboardingSteps can correctly
      // calculate the next onboardinig step based on what the user has completed
      this.props.setEmailVerified(identity.emailVerified)
      this.props.setPhoneVerified(identity.phoneVerified)
      this.props.setName({
        firstName: identity.firstName,
        lastName: identity.lastName
      })
      this.props.setAvatarUri(identity.avatarUrl)
      // Save the whole identity in the wallet store
      this.props.setIdentity(identity)
    }
    this.setState({ loading: false, identity: identity })
  }

  toggleModal = () => {
    this.setState({ displayModal: !this.state.displayModal })
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.state.loading
          ? this.renderLoading()
          : this.state.identity
          ? this.renderProfile()
          : this.renderImported()}
      </SafeAreaView>
    )
  }

  /* Render a loading indicator
   */
  renderLoading() {
    return (
      <View style={styles.content}>
        <Text style={styles.title}>
          <fbt desc="ImportedScreen.loadingTitle">Looking for your account</fbt>
        </Text>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  /* Render a screen with the users profile if they have a full or partially
   * complete profile.
   */
  renderProfile() {
    const avatarUrl = get(this.state.identity, 'avatarUrl')
    const name = get(this.state.identity, 'firstName') || 'there'

    return (
      <>
        <View style={styles.content}>
          {avatarUrl && (
            <>
              <Avatar
                source={avatarUrl}
                size={120}
                style={{ marginBottom: 30 }}
              />
            </>
          )}

          <Text style={styles.title}>
            <fbt desc="ImportedScreen.profileTitle">
              Hi <fbt:param name="name">{name}</fbt:param>!
            </fbt>
          </Text>

          {this.props.nextOnboardingStep !== 'Ready' ? (
            <Text style={styles.subtitle}>
              <fbt desc="ImportedScreen.incompleteProfileSubtitle">
                There are a few more steps required to complete your Origin
                account.
              </fbt>
            </Text>
          ) : (
            <Text style={styles.subtitle}>
              <fbt desc="ImportedScreen.completeProfileSubtitle">
                Looks like you are all set to go!
              </fbt>
            </Text>
          )}
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Continue', 'ImportedScreen.continueButton')}
            onPress={() =>
              this.props.navigation.navigate(this.props.nextOnboardingStep)
            }
          />
        </View>
      </>
    )
  }

  renderImported() {
    return (
      <>
        <View style={styles.content}>
          <Image
            style={{ marginBottom: 30 }}
            source={require(IMAGES_PATH + 'wallet-icon-inactive.png')}
          />
          <Text style={styles.title}>
            <fbt desc="ImportedScreen.importedTitle">
              You&apos;ve imported your wallet
            </fbt>
          </Text>
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={styles.subtitle}>
              <fbt desc="ImportedScreen.importedSubtitle">
                Next, create an Origin profile that will be linked to this
                wallet.
              </fbt>
            </Text>
            <Text
              style={{
                ...styles.subtitle,
                fontWeight: '600',
                fontStyle: 'italic'
              }}
            >
              <fbt desc="ImportedScreen.anonymityWarning">
                Please note, your wallet will no longer be anonymous
              </fbt>
            </Text>
            <TouchableOpacity onPress={this.toggleModal}>
              <Text style={{ textAlign: 'center', color: '#1a82ff' }}>
                {fbt('Learn more', 'ImportedScreen.learnMoreLink')} &gt;
              </Text>
            </TouchableOpacity>
          </View>
          {this.renderModal()}
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt(
              'Create a profile',
              'ImportedScreen.createProfileButton'
            )}
            onPress={() =>
              this.props.navigation.navigate(this.props.nextOnboardingStep)
            }
          />
          <OriginButton
            size="large"
            type="link"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt(
              `Oops, wait. Let's start over...`,
              'ImportedScreen.startOverButton'
            )}
            onPress={() => {
              DeviceEventEmitter.emit(
                'removeAccount',
                this.props.wallet.activeAccount
              )
              this.props.navigation.navigate('Welcome')
            }}
          />
        </View>
      </>
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
          <LearnCard onRequestClose={() => this.toggleModal()} />
        </SafeAreaView>
      </Modal>
    )
  }
}

const mapStateToProps = ({ marketplace, wallet }) => {
  return { marketplace, wallet }
}

const mapDispatchToProps = dispatch => ({
  setEmailVerified: email => dispatch(setEmailVerified(email)),
  setPhoneVerified: phone => dispatch(setPhoneVerified(phone)),
  setName: payload => dispatch(setName(payload)),
  setAvatarUri: avatarUri => dispatch(setAvatarUri(avatarUri)),
  setIdentity: identity => dispatch(setIdentity(identity))
})

export default withOriginGraphql(withConfig(
  withOnboardingSteps(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ImportedScreen)
  )
))

const styles = StyleSheet.create({
  ...OnboardingStyles,
  modalSafeAreaView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  },
  image: {
    backgroundColor: '#2e3f53',
    borderRadius: 60,
    width: 120,
    height: 120,
    marginBottom: 30
  }
})
