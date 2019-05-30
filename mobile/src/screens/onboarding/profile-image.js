'use strict'

import React, { Component } from 'react'
import { Image, StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'
import ImagePicker from 'react-native-image-picker'

import { setProfileImage } from 'actions/Onboarding'
import { SettingsButton } from 'components/settings-button'
import OriginButton from 'components/origin-button'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import OnboardingStyles from 'styles/onboarding'

const IMAGES_PATH = '../../../assets/images/'
const imagePickerOptions = {
  title: 'Select Photo',
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}

class ProfileImage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imagePickerError: null,
      loading: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleImageClick = this.handleImageClick.bind(this)
  }

  handleSubmit() {
    this.props.navigation.navigate(this.props.nextOnboardingStep)
  }

  handleImageClick() {
    ImagePicker.showImagePicker(imagePickerOptions, async response => {
      this.setState({ loading: false })
      if (response.error) {
        this.setState({ imagePickerError: response.error })
      } else {
        // TODO upload to IPFS and store the URI
        await this.props.setProfileImage(response.uri)
      }
    })
  }

  render() {
    const galleryPermissionDenied =
      this.state.imagePickerError === 'Photo library permissions not granted'

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {galleryPermissionDenied
            ? this.renderGalleryPermissionDenied()
            : this.renderImage()}
        </View>
        <View style={[styles.visibilityWarning, styles.isVisible]}>
          <Text style={styles.visibilityWarningHeader}>
            What will be visible on the blockchain?
          </Text>
          <Text>Your photo will be visible on the blockchain.</Text>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Continue', 'ProfileImageScreen.continueButton')}
            disabled={!this.props.onboarding.profileImage}
            onPress={this.handleSubmit}
          />
        </View>
      </SafeAreaView>
    )
  }

  renderGalleryPermissionDenied() {
    return (
      <>
        <Text style={styles.title}>
          <fbt desc="ProfileImageScreen.galleryDisabledTitle">
            Gallery access denied
          </fbt>
        </Text>
        <Text style={styles.subtitle}>
          <fbt desc="ProfileImageScreen.galleryDisabledSubtitle">
            It looks like we cannot access your photo gallery. You will need to
            allow access in the onboarding for the Origin Marketplace App.
          </fbt>
        </Text>
        <SettingsButton />
      </>
    )
  }

  renderImage() {
    return (
      <TouchableOpacity onPress={this.handleImageClick} style={styles.content}>
        <Image
          resizeMethod={'scale'}
          resizeMode={'contain'}
          source={
            this.props.onboarding.profileImage
              ? { uri: this.props.onboarding.profileImage }
              : require(IMAGES_PATH + 'partners-graphic.png')
          }
          style={styles.image}
        />
        <Text style={styles.title}>
          {!this.props.onboarding.profileImage ? (
            <fbt desc="ProfileImageScreen.title">Upload a photo</fbt>
          ) : (
            <fbt desc="ProfileImageScreen.successTitle">Looking good</fbt>
          )}
        </Text>
      </TouchableOpacity>
    )
  }
}

const mapStateToProps = ({ onboarding, wallet }) => {
  return { onboarding, wallet }
}

const mapDispatchToProps = dispatch => ({
  setProfileImage: payload => dispatch(setProfileImage(payload))
})

export default withOnboardingSteps(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ProfileImage)
)

const styles = StyleSheet.create({
  ...OnboardingStyles,
  image: {
    backgroundColor: '#2e3f53',
    borderRadius: 60,
    width: 120,
    height: 120,
    marginBottom: 30
  }
})
