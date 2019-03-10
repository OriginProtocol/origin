import React, { Component } from 'react'
import Moment from 'react-moment'
import { Alert, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import Address from 'components/address'
import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

export default class DeviceItem extends Component {
  render() {
    const { item, navigation, wallet } = this.props
    const { address, name } = item

    return (
      <TouchableHighlight onPress={() => navigation.navigate('Account', {
        account: {
          address,
          name,
        },
      })}>
        <View style={styles.listItem}>
          <View style={styles.textContainer}>
            <Text style={styles.name}>{name || 'Unnamed Account'}</Text>
            <Address address={address} label={'Address'} style={styles.address} />
          </View>
          <View style={styles.iconContainer}>
            {wallet.address === address &&
              <Image source={require(`${IMAGES_PATH}selected.png`)} style={styles.selected} />
            }
            <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

const styles = StyleSheet.create({
  address: {
    fontFamily: 'Lato',
    fontSize: 13,
    fontWeight: '300',
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  listItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    flex: 1,
    height: 50,
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: 14,
  },
  name: {
    fontFamily: 'Lato',
    fontSize: 17,
    marginRight: '5%',
  },
  selected: {
    marginRight: 17,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
  },
})
