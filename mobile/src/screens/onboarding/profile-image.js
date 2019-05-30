'use strict'

import React, { Component } from 'react'
import {
  ActivityIndicator,
  Image,
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

import { setProfileImage } from 'actions/Onboarding'
import { SettingsButton } from 'components/settings-button'
import OriginButton from 'components/origin-button'
import withConfig from 'hoc/withConfig'
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
      imageSource: null,
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
      if (response.error) {
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

      console.debug('Uploading image to IPFS')
      const ipfsRPC = this.props.configs.mainnet.ipfsRPC
      const ipfsResponse = await fetch(`${ipfsRPC}/api/v0/add`, {
        method: 'POST',
        body: formData
      })

      this.setState({
        loading: false
      })

      if (!ipfsResponse.ok) {
        console.debug('IPFS upload failed')
        this.setState({
          imagePickerError: 'Photo uploaded failed'
        })
        return
      }

      this.setState({
        imageSource: outImage
      })

      const data = await ipfsResponse.json()
      console.debug('IPFS upload succeeded: ', data)
      await this.props.setProfileImage(data.Hash)
    })
  }

  render() {
    const galleryPermissionDenied =
      this.state.imagePickerError === 'Photo library permissions not granted'

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
            this.state.imageSource
              ? this.state.imageSource
              : require(IMAGES_PATH + 'partners-graphic.png')
          }
          style={styles.image}
          onLoadStart={() => {
            this.setState({ loading: true })
          }}
          onLoadEnd={() => {
            this.setState({ loading: false })
          }}
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

export default withConfig(
  withOnboardingSteps(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProfileImage)
  )
)

const styles = StyleSheet.create({
  ...OnboardingStyles,
  loading: {
    flex: 1,
    justifyContent: 'space-around'
  },
  image: {
    backgroundColor: '#2e3f53',
    borderRadius: 60,
    width: 120,
    height: 120,
    marginBottom: 30
  }
})
