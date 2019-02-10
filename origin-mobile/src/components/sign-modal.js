import React, { Component, Fragment } from 'react'
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import Address from 'components/address'
import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

export default class SignModal extends Component {
  render() {
    const { item, address, handleApprove, handleReject, toggleModal } = this.props
    const msg = item.sign && item.sign.params.msg

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!item}
        onRequestClose={() => {
          console.log('Modal closed')
          toggleModal()
        } }
      >
        <TouchableOpacity onPress={toggleModal}>
          <View style={styles.above}></View>
        </TouchableOpacity>
        <View style={styles.main}>
          <TouchableOpacity onPress={toggleModal} style={{ width: '100%' }}>
            <View style={styles.close}>
              <Image source={require(`${IMAGES_PATH}arrow-down.png`)} />
            </View>
          </TouchableOpacity>
          <View style={styles.promptContainer}>
            <Text style={styles.question}>
              Do you wish to sign this message?
            </Text>
            <Text style={styles.listingName}>
              {msg}
            </Text>
          </View>
          <View style={styles.counterparties}>
            <View style={styles.party}>
              <Image source={require(`${IMAGES_PATH}avatar.png`)} style={styles.avatar} />
              <Address address={address} label="From Address" style={styles.address} />
            </View>
          </View>
          <View style={styles.fundingAvailable}>
            <View style={{ marginBottom: 20 }}>
              <OriginButton size="large" type="primary" title="Approve" onPress={handleApprove} />
            </View>
            <OriginButton size="large" type="danger" title="Reject" onPress={handleReject} />
          </View>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  above: {
    backgroundColor: 'transparent',
    height: 88,
  },
  address: {
    color: '#3e5d77',
    fontFamily: 'Lato',
    fontSize: 12,
    fontWeight: '300',
  },
  arrow: {
    height: 22,
    marginLeft: 20,
    marginRight: 20,
    width: 26,
  },
  avatar: {
    marginBottom: 4,
  },
  close: {
    alignItems: 'center',
    marginBottom: 11,
    paddingBottom: 5,
    paddingTop: 5,
  },
  counterparties: {
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
    marginBottom: 30,
  },
  fundingAvailable: {
    width: '83%',
  },
  fundingRequired: {
    alignItems: 'center',
    width: '100%',
  },
  image: {
    borderRadius: 4,
    flex: 1,
    height: undefined,
    marginBottom: 40,
    width: undefined,
  },
  imageContainer: {
    flex: 1,
    width: '83%',
  },
  listingName: {
    fontFamily: 'Lato',
    fontSize: 23,
    marginBottom: 30,
    textAlign: 'center',
    width: '90%',
  },
  main: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flex: 1,
    height: '95%',
    justifyContent: 'space-around',
    paddingBottom: '10%',
  },
  party: {
    alignItems: 'center',
    marginLeft: 'auto',
  },
  promptContainer: {
    alignItems: 'center',
    width: '100%',
  },
  question: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: '300',
    marginBottom: 17,
    textAlign: 'center',
    width: '90%',
  },
  wallet: {
    fontFamily: 'Lato',
    fontSize: 17,
    textAlign: 'center',
    width: '60%',
  },
  warning: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: '300',
    marginBottom: 17,
    textAlign: 'center',
    width: '90%',
  },
})
