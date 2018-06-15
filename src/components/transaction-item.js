import React, { Component } from 'react'
import { Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import OriginButton from './origin-button'

export default class TransactionItem extends Component {
  render() {
    const { item, handleApprove, handlePress, handleReject, style } = this.props
    // placeholders
    const hasSufficientFunds = true
    const myAddress = '0x12Be343B94f860124dC4fEe278FDCBD38C101BAR'
    const counterpartyAddress = '0x34Be343B94f860124dC4fEe278FDCBD38C102BAZ'

    return (
      <TouchableHighlight onPress={handlePress}>
        <View style={[ styles.listItem, style ]}>
          <Image source={require('../../assets/images/avatar.png')} style={styles.avatar} />
          <View style={styles.content}>
            <Text style={styles.imperative}>{item.actionName} <Text style={styles.subject}>{item.listingName}{item.listingName}</Text>?</Text>
            <View style={styles.counterparties}>
              <Text style={styles.address}>{`${myAddress.slice(0, 4)}...${myAddress.slice(38)}`}</Text>
              <Image source={require('../../assets/images/arrow-forward-material.png')} style={styles.arrow} />
              <Text style={styles.address}>{`${counterpartyAddress.slice(0, 4)}...${counterpartyAddress.slice(38)}`}</Text>
            </View>
            {hasSufficientFunds && handleApprove &&
              <View style={styles.actions}>
                <View style={{ marginRight: 10 }}>
                  <OriginButton size="small" type="primary" title="Approve" onPress={handleApprove} />
                </View>
                <OriginButton size="small" type="danger" title="Reject" onPress={handleReject} />
              </View>
            }
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    paddingTop: '5%',
  },
  address: {
    color: '#3e5d77',
    fontSize: 12,
    fontWeight: '300',
  },
  arrow: {
    marginLeft: 10,
    marginRight: 10,
  },
  avatar: {
    marginRight: '5%',
  },
  content: {
    flex: 1,
    marginTop: 5,
  },
  counterparties: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  imperative: {
    fontSize: 17,
    fontWeight: '300',
    marginBottom: 4,
  },
  listItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: '5%',
  },
  subject: {
    fontWeight: 'normal',
  },
})
