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

import Address from 'components/address'
import Avatar from 'components/avatar'
import { truncate } from 'utils/user'

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
        <View style={styles.textContainer}>
          <View style={[styles.iconContainer, styles.identiconContainer]}>
            <Avatar source={avatarUrl} />
          </View>
          {name && (
            <Text style={styles.name}>{truncate(name, truncateLength)}</Text>
          )}
          <Address
            address={item.address}
            label={fbt('Address', 'AccountItem.address')}
            style={styles.address}
          />
        </View>
        {
          <View style={styles.iconContainer}>
            {wallet.accounts[0].address === item.address && (
              <Image
                source={require(`${IMAGES_PATH}selected.png`)}
                style={styles.selected}
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
  address: {
    fontFamily: 'Lato',
    fontSize: 13,
    fontWeight: '300',
    marginTop: 4
  },
  iconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  identiconContainer: {
    marginRight: 10
  },
  listItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    flex: 1,
    height: 50,
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: 14
  },
  name: {
    fontFamily: 'Lato',
    fontSize: 17,
    marginRight: '5%'
  },
  unnamed: {
    color: '#98a7b4'
  },
  selected: {
    marginRight: 17
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row'
  }
})
