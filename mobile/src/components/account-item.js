'use strict'

import React, { Component } from 'react'
import { Alert, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import Address from 'components/address'
import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

export default class AccountItem extends Component {
  render() {
    const { item, navigation, wallet } = this.props

    return (
      <TouchableHighlight onPress={() => navigation.navigate('Account', {
        account: {
          item
        },
      })}>
        <View style={styles.listItem}>
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name || 'Unnamed Account'}</Text>
            <Address address={item.address} label={'Address'} style={styles.address} />
          </View>
          {
          <View style={styles.iconContainer}>
            {wallet.accounts[0].address === item.address &&
              <Image source={require(`${IMAGES_PATH}selected.png`)} style={styles.selected} />
            }
            <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
          </View>
          }
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
