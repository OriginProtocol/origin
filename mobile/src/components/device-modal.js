import React, { Component, Fragment } from 'react'
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

export default class DeviceModal extends Component {
  render() {
    const { item, handleApprove, handleReject, toggleModal } = this.props
    // placeholders
    const { browser, platform, language } = item.link && item.link.app_info

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!item}
        onRequestClose={() => {
          console.log('Modal closed')
          toggleModal()
        }}
      >
        <TouchableOpacity onPress={toggleModal}>
          <View style={styles.above} />
        </TouchableOpacity>
        <View style={styles.main}>
          <TouchableOpacity onPress={toggleModal} style={{ width: '100%' }}>
            <View style={styles.close}>
              <Image source={require(`${IMAGES_PATH}arrow-down.png`)} />
            </View>
          </TouchableOpacity>
          <View style={styles.imageContainer}>
            {browser == 'chrome' && (
              <Image source={require(`${IMAGES_PATH}chrome-icon.png`)} />
            )}
            {browser !== 'chrome' && (
              <Image source={require(`${IMAGES_PATH}app-icon.png`)} />
            )}
            <Image
              source={require(`${IMAGES_PATH}link-icon.png`)}
              style={styles.icon}
            />
          </View>
          <View style={styles.promptContainer}>
            <Text style={styles.question}>
              Do you want to link to this platform?
            </Text>
            <Text style={styles.listingName}>
              {platform} {browser}
            </Text>
          </View>
          <View style={{ marginBottom: 20 }}>
            <OriginButton
              size="large"
              type="primary"
              title="Approve"
              onPress={handleApprove}
            />
          </View>
          <OriginButton
            size="large"
            type="danger"
            title="Reject"
            onPress={handleReject}
          />
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  above: {
    backgroundColor: 'transparent',
    height: 88
  },
  arrow: {
    height: 22,
    marginLeft: 20,
    marginRight: 20,
    width: 26
  },
  avatar: {
    marginBottom: 4
  },
  close: {
    alignItems: 'center',
    marginBottom: 11,
    paddingBottom: 5,
    paddingTop: 5
  },
  counterparties: {
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
    marginBottom: 30
  },
  fundingAvailable: {
    width: '83%'
  },
  fundingRequired: {
    alignItems: 'center',
    width: '100%'
  },
  image: {
    borderRadius: 4,
    flex: 1,
    height: undefined,
    marginBottom: 40,
    width: undefined
  },
  imageContainer: {
    flex: 1,
    width: '83%'
  },
  listingName: {
    fontFamily: 'Lato',
    fontSize: 23,
    marginBottom: 30,
    textAlign: 'center',
    width: '90%'
  },
  main: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flex: 1,
    height: '95%',
    justifyContent: 'space-around',
    paddingBottom: '10%'
  },
  party: {
    alignItems: 'center',
    marginLeft: 'auto'
  },
  promptContainer: {
    alignItems: 'center',
    width: '100%'
  },
  question: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: '300',
    marginBottom: 17,
    textAlign: 'center',
    width: '90%'
  },
  wallet: {
    fontFamily: 'Lato',
    fontSize: 17,
    textAlign: 'center',
    width: '60%'
  },
  warning: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: '300',
    marginBottom: 17,
    textAlign: 'center',
    width: '90%'
  }
})
