'use strict'

import React from 'react'
import {
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import compareVersions from 'compare-versions'
import { fbt } from 'fbt-runtime'

import { VERSION } from '../constants'
import OriginButton from 'components/origin-button'
import CommonStyles from 'styles/common'

const IMAGES_PATH = '../../assets/images/'

class UpdatePrompt extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      upgrade: null
    }
  }

  async componentDidMount() {
    const versionUrl =
      'https://raw.githubusercontent.com/OriginProtocol/origin/master/mobile/.version'
    let versions
    if (!__DEV__) {
      try {
        const response = await fetch(versionUrl)
        versions = await response.json()
      } catch (error) {
        console.warn('Could not fetch versions: ', error)
      }

      if (versions && compareVersions(VERSION, versions.force) === -1) {
        this.setState({ upgrade: 'force' })
      } else if (
        versions &&
        compareVersions(VERSION, versions.recommend) === -1
      ) {
        this.setState({ upgrade: 'recommend' })
      }
    }
  }

  openStore() {
    const APP_STORE_LINK =
      'itms-apps://itunes.apple.com/us/app/apple-store/id1446091928?mt=8'
    const PLAY_STORE_LINK = 'market://details?id=com.origincatcher'
    const storeLink = Platform.OS === 'ios' ? APP_STORE_LINK : PLAY_STORE_LINK
    Linking.canOpenURL(storeLink).then(supported => {
      if (supported) {
        Linking.openURL(storeLink).catch(error => {
          console.error('Error opening store URL: ', error.message)
        })
      } else {
        console.log('Opening store URL not supported')
      }
    })
  }

  render() {
    return (
      <Modal animationType="slide" visible={this.state.upgrade !== null}>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Image
              resizeMethod={'scale'}
              resizeMode={'contain'}
              source={require(IMAGES_PATH + 'update-graphic.png')}
              style={styles.image}
            />
            {this.state.upgrade === 'force' && (
              <>
                <Text style={styles.title}>
                  <fbt desc="UpdateScreen.updateRequired">Update required</fbt>
                </Text>
                <Text style={styles.subtitle}>
                  <fbt desc="UpdateScreen.updateRequiredDesc">
                    Woops! It looks like you are using an old version of the
                    Origin Marketplace App. Please update to proceed.
                  </fbt>
                </Text>
              </>
            )}
            {this.state.upgrade === 'recommend' && (
              <>
                <Text style={styles.title}>
                  <fbt desc="UpdateScreen.updateAvailable">
                    Update available
                  </fbt>
                </Text>
                <Text style={styles.subtitle}>
                  <fbt desc="UpdateScreen.updateAvailableDesc">
                    It looks like you are using an old version of the Origin
                    Marketplace App. For the best experience, we recommend you
                    update.
                  </fbt>
                </Text>
              </>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <OriginButton
              size="large"
              type="primary"
              title={fbt('Update', 'UpdateScreen.updateButton')}
              onPress={this.openStore}
            />
            <OriginButton
              size="large"
              type="link"
              title={fbt('Not now', 'UpdateScreen.cancelButton')}
              onPress={() => this.setState({ upgrade: null })}
            />
          </View>
        </SafeAreaView>
      </Modal>
    )
  }
}

export default UpdatePrompt

const styles = StyleSheet.create({
  ...CommonStyles
})
