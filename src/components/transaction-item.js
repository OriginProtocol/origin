import React, { Component } from 'react'
import { Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import OriginButton from './origin-button'

export default class TransactionItem extends Component {
  render() {
    const { item, address, balance, handleApprove, handlePress, handleReject, style } = this.props
    // placeholders
    const hasSufficientFunds = web3.utils.toBN(balance).gt(item.cost)
    const myAddress = address || ""
    const counterpartyAddress = item.listing && item.listing.seller
    const meta = item.meta
    const status = item.status

    return (
      <TouchableHighlight onPress={handlePress}>
        <View style={[ styles.listItem, style ]}>
          <Image source={require('../../assets/images/avatar.png')} style={styles.avatar} />
          <View style={styles.content}>
            {item.listing && <View><Text style={styles.imperative}>{item.action_label} <Text style={styles.subject}>{item.listing.title}</Text>?</Text>
            <View style={styles.counterparties}>
              <Text style={styles.address}>{`${myAddress.slice(0, 4)}...${myAddress.slice(38)}`}</Text>
              <Image source={require('../../assets/images/arrow-forward-material.png')} style={styles.arrow} />
              <Text style={styles.address}>{`${counterpartyAddress.slice(0, 4)}...${counterpartyAddress.slice(38)}`}</Text>
              {status && <Text style={styles.address}>Status: {status}</Text>}
            </View></View>}
            {!item.listing && meta && <View><Text style={styles.imperative}>call <Text style={styles.subject}>{meta.contract}.{meta.method}</Text>?</Text>
            <View style={styles.counterparties}>
              <Text style={styles.address}>{`${myAddress.slice(0, 4)}...${myAddress.slice(38)}`}</Text>
              {item.cost && <Text style={styles.imperative}>Value: {item.cost} Eth</Text>}
              <Text style={styles.imperative}>Gas: {item.gas_cost}</Text>
              <Text style={styles.address}>{meta.contract}({`${meta.to.slice(0, 4)}...${meta.to.slice(38)}`})</Text>
              {status && <Text style={styles.address}>Status: {status}</Text>}
            </View></View>}
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
