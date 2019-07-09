'use strict'

import React from 'react'
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'
import get from 'lodash.get'

import { truncate } from 'utils/user'
import Address from 'components/address'
import Avatar from 'components/avatar'
import ListStyles from 'styles/list'

const IMAGES_PATH = '../../assets/images/'

const AccountItem = ({ item, navigation, wallet }) => {
  // Truncate the account name to something that looks reasonable, the upper
  // bound was set from an iPhone X
  const truncateLength = Dimensions.get('window').width < 375 ? 15 : 20
  const identity = get(wallet.identities, item.address, {})
  const name = get(identity, 'fullName')
  const avatarUrl = get(identity, 'avatarUrl')

  return (
    <TouchableHighlight
      onPress={() =>
        navigation.navigate('Account', {
          account: {
            ...item
          }
        })
      }
    >
      <View style={styles.listItem}>
        <View style={styles.listItemTextContainer}>
          <View style={{ ...styles.listItemIconContainer, marginRight: 10 }}>
            <Avatar source={avatarUrl} />
          </View>
          {name && (
            <Text style={styles.name}>{truncate(name, truncateLength)}</Text>
          )}
          <Address
            address={item.address}
            label={fbt('Address', 'AccountItem.address')}
            styles={{ marginTop: 4 }}
          />
        </View>
        {
          <View style={styles.listItemIconContainer}>
            {get(wallet, 'activeAccount.address') === item.address && (
              <Image
                source={require(`${IMAGES_PATH}selected.png`)}
                style={styles.listSelectedItem}
              />
            )}
            <Image source={require(`${IMAGES_PATH}arrow-right.png`)} />
          </View>
        }
      </View>
    </TouchableHighlight>
  )
}

const mapStateToProps = ({ wallet }) => {
  return { wallet }
}

export default connect(mapStateToProps)(AccountItem)

const styles = StyleSheet.create({
  ...ListStyles,
  name: {
    fontFamily: 'Lato',
    fontSize: 17,
    marginHorizontal: 5
  }
})
