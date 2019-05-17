'use strict'

import React, { Component } from 'react'
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native'
import { connect } from 'react-redux'

import Address from 'components/address'
import Identicon from 'components/identicon'
import { truncate } from 'utils/user'

const IMAGES_PATH = '../../assets/images/'

class AccountItem extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { item, navigation, wallet } = this.props
    // Truncate the account name to something that looks reasonable, the upper
    // bound was set from an iPhone X
    const truncateLength = Dimensions.get('window').width < 375 ? 15 : 20

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
              <Identicon address={item.address} />
            </View>
            {wallet.accountNameMapping[item.address] && (
              <Text style={styles.name}>
                {truncate(
                  wallet.accountNameMapping[item.address],
                  truncateLength
                )}
              </Text>
            )}
            <Address
              address={item.address}
              label={'Address'}
              style={styles.address}
            />
          </View>
          {
            <View style={styles.iconContainer}>
              {wallet.activeAccount.address === item.address && (
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
