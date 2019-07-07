'use strict'

import React, { Component } from 'react'
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
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
import {
  addAttestation,
  setVerifiedAttestations,
  setName,
  setAvatarUri
} from 'actions/Onboarding'
import { removeAccount, setIdentity } from 'actions/Wallet'
import CommonStyles from 'styles/common'
import OnboardingStyles from 'styles/onboarding'

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

  componentDidMount() {
    this.loadIdentity()
  }

  loadIdentity = async () => {
    let response
    try {
      response = await this.props.getIdentity(
        this.props.wallet.activeAccount.address
      )
    } catch (error) {
      // Skip, identity couldn't be loaded
      console.warn(error)
    }

    const identity = get(response, 'data.web3.account.identity')
    if (identity) {
      const attestations = get(identity, 'attestations', [])
      attestations.map(this.props.addAttestation)
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
        <ScrollView contentContainerStyle={styles.content}>
          {this.state.loading
            ? this.renderLoading()
            : this.state.identity
            ? this.renderProfile()
            : this.renderImported()}
        </ScrollView>
        {this.renderModal()}
      </SafeAreaView>
    )
  }

  /* Render a loading indicator
   */
  renderLoading() {
    return (
      <View style={styles.container}>
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
        <View style={{ ...styles.container, flexGrow: 2 }}>
          {avatarUrl !== undefined && (
            <>
              <Avatar
                source={avatarUrl}
                size={100}
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
        <View style={{ ...styles.container, ...styles.buttonContainer }}>
          <OriginButton
            size="large"
            type="primary"
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
        <View style={{ ...styles.container, flexGrow: 2 }}>
          <Image
            style={styles.image}
            source={require(IMAGES_PATH + 'wallet-icon-inactive.png')}
          />
          <Text style={styles.title}>
            <fbt desc="ImportedScreen.importedTitle">
              You&apos;ve imported your wallet
            </fbt>
          </Text>
          <Text style={styles.subtitle}>
            <fbt desc="ImportedScreen.importedSubtitle">
              Next, create an Origin profile that will be linked to this wallet.
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
        <View style={{ ...styles.container, ...styles.buttonContainer }}>
          <OriginButton
            size="large"
            type="primary"
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
            title={fbt(
              `Oops, wait. Let's start over...`,
              'ImportedScreen.startOverButton'
            )}
            onPress={async () => {
              await this.props.removeAccount(this.props.wallet.activeAccount)
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
        <SafeAreaView style={styles.darkOverlay}>
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
  addAttestation: attestation => dispatch(addAttestation(attestation)),
  removeAccount: account => dispatch(removeAccount(account)),
  setVerifiedAttestations: attestations =>
    dispatch(setVerifiedAttestations(attestations)),
  setName: payload => dispatch(setName(payload)),
  setAvatarUri: avatarUri => dispatch(setAvatarUri(avatarUri)),
  setIdentity: identity => dispatch(setIdentity(identity))
})

export default withOriginGraphql(
  withConfig(
    withOnboardingSteps(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(ImportedScreen)
    )
  )
)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...OnboardingStyles
})
