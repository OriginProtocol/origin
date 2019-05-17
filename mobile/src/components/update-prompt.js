'use strict'

import React from 'react'
import {
  Dimensions,
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

import OriginButton from 'components/origin-button'
import { version } from '../../package.json'

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

      if (versions && compareVersions(version, versions.force) === -1) {
        this.setState({ upgrade: 'force' })
      } else if (
        versions &&
        compareVersions(version, versions.recommend) === -1
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
    const { height } = Dimensions.get('window')
    const smallScreen = height < 812

    return (
      <Modal animationType="slide" visible={this.state.upgrade !== null}>
        <SafeAreaView style={styles.container}>
          <View style={styles.body}>
            <Image
              resizeMethod={'scale'}
              resizeMode={'contain'}
              source={require(IMAGES_PATH + 'update-graphic.png')}
              style={[styles.image, smallScreen ? { height: '33%' } : {}]}
            />
            {this.state.upgrade === 'force' && (
              <>
                <Text style={styles.title}>Update required</Text>
                <Text style={styles.subtitle}>
                  Woops! It looks like you are using an old version of the
                  Origin Marketplace App. Please update to proceed.
                </Text>
              </>
            )}
            {this.state.upgrade === 'recommend' && (
              <>
                <Text style={styles.title}>Update available</Text>
                <Text style={styles.subtitle}>
                  It looks like you are using an old version of the Origin
                  Marketplace App. For the best experience, we recommend you
                  update.
                </Text>
              </>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <OriginButton
              size="large"
              type="primary"
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={'Update'}
              onPress={this.openStore}
            />
            <OriginButton
              size="large"
              type="link"
              style={styles.button}
              textStyle={{ fontSize: 18, color: 'white' }}
              title={'Not now'}
              onPress={() => this.setState({ upgrade: null })}
            />
          </View>
        </SafeAreaView>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    backgroundColor: '#293f55',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 50
  },
  container: {
    backgroundColor: '#293f55',
    justifyContent: 'center',
    flex: 1
  },
  buttonContainer: {
    backgroundColor: '#293f55',
    paddingTop: 10,
    paddingBottom: 40
  },
  button: {
    marginBottom: 10,
    marginHorizontal: 20
  },
  image: {
    marginBottom: '10%'
  },
  title: {
    color: 'white',
    fontFamily: 'Lato',
    fontSize: 24,
    fontWeight: '600',
    paddingBottom: 15,
    textAlign: 'center'
  },
  subtitle: {
    color: 'white',
    fontFamily: 'Lato',
    fontSize: 18,
    fontWeight: '300',
    textAlign: 'center'
  }
})

export default UpdatePrompt
