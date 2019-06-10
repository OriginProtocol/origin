'use strict'

import React, { Component } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'
import { fbt } from 'fbt-runtime'
import ImagePicker from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'

import { setAvatarUri } from 'actions/Onboarding'
import { SettingsButton } from 'components/settings-button'
import Avatar from 'components/avatar'
import OriginButton from 'components/origin-button'
import withConfig from 'hoc/withConfig'
import withOnboardingSteps from 'hoc/withOnboardingSteps'
import OnboardingStyles from 'styles/onboarding'

const imagePickerOptions = {
  title: 'Select Photo',
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}

class AvatarScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imagePickerError: null,
      avatarSource: null,
      loading: false
    }
    this.handleImageClick = this.handleImageClick.bind(this)
  }

  handleImageClick() {
    ImagePicker.showImagePicker(imagePickerOptions, async response => {
      if (response.didCancel) {
        console.debug('User cancelled image picker')
        return
      } else if (response.error) {
        this.setState({ imagePickerError: response.error })
        return
      }

      this.setState({ loading: true })

      const outImage = await ImageResizer.createResizedImage(
        response.uri,
        1024,
        1014,
        'JPEG',
        90,
        response.originalRotation
      )

      // Create form data, origin-ipfs-proxy uses Busboy which only parses multiple
      // multipart/form-data and application/x-www-form-urlencoded requests
      const formData = new FormData()
      formData.append('file', outImage)

      console.debug('Uploading to IPFS')
      const ipfsRPC = this.props.config.ipfsRPC
      const ipfsResponse = await fetch(`${ipfsRPC}/api/v0/add`, {
        method: 'POST',
        body: formData
      })

      if (!ipfsResponse.ok) {
        this.setState({
          imagePickerError: fbt(
            'Photo uploaded failed',
            'AvatarScreen.uploadFailed'
          )
        })
        return
      }

      const data = await ipfsResponse.json()
      console.debug(`IPFS hash: ${data.Hash}`)
      await this.props.setAvatarUri(`ipfs://${data.Hash}`)

      this.setState({
        loading: false,
        avatarSource: outImage
      })
    })
  }

  render() {
    const galleryPermissionDenied =
      this.state.imagePickerError ===
      fbt(
        'Photo library permissions not granted',
        'AvatarScreen.galleryPermissionDenied'
      )

    let content
    if (this.state.loading) {
      content = (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      )
    } else if (galleryPermissionDenied) {
      content = this.renderGalleryPermissionDenied()
    } else {
      content = this.renderImage()
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>{content}</View>
        <View style={[styles.visibilityWarningContainer, styles.isVisible]}>
          <Text style={styles.visibilityWarningHeader}>
            <fbt desc="AvatarScreen.visibilityWarningHeader">
              What will be visible on the blockchain?
            </fbt>
          </Text>
          <Text style={styles.visibilityWarningText}>
            <fbt desc="AvatarScreen.visibilityWarningText">
              Your photo will be visible on the blockchain
            </fbt>
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Continue', 'AvatarScreen.continueButton')}
            onPress={() => {
              if (this.props.onboarding.avatarUri === null) {
                // If no avatarUri is set the user has elected to continue
                // and skip the upload. Set the value in the store to false
                // so we can distinguish between incomplete and skipped.
                this.props.setAvatarUri(false)
              }
              this.props.navigation.navigate(this.props.nextOnboardingStep)
            }}
          />
        </View>
      </SafeAreaView>
    )
  }

  renderGalleryPermissionDenied() {
    return (
      <>
        <Text style={styles.title}>
          <fbt desc="AvatarScreen.galleryDisabledTitle">
            Gallery access denied
          </fbt>
        </Text>
        <Text style={styles.subtitle}>
          <fbt desc="AvatarScreen.galleryDisabledSubtitle">
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
        <Avatar
          source={this.state.avatarSource}
          size={120}
          style={{ marginBottom: 30 }}
        />
        <Text style={styles.title}>
          {!this.props.onboarding.avatarUri ? (
            <fbt desc="AvatarScreen.title">Upload a photo</fbt>
          ) : (
            <fbt desc="AvatarScreen.successTitle">Looking good</fbt>
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
  setAvatarUri: avatarUri => dispatch(setAvatarUri(avatarUri))
})

export default withConfig(
  withOnboardingSteps(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(AvatarScreen)
  )
)

const styles = StyleSheet.create({
  ...OnboardingStyles,
  loading: {
    flex: 1,
    justifyContent: 'space-around'
  }
})
