import React, { Component } from 'react'
import { Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import OriginButton from './origin-button'

export default class TransactionItem extends Component {
  render() {
    const { item, address = '', balance, handleApprove, handlePress, handleReject, style } = this.props
    const { cost, listing, meta, status, to, transaction_type } = item
    const hasSufficientFunds = web3.utils.toBN(balance).gt(cost)
    const counterpartyAddress = (listing && listing.seller) || to
    const picture = listing && listing.media && listing.media[0]
    const activitySummary = () => {
      switch(meta.method) {
        case 'createListing':
          return 'Created listing for'
        case 'makeOffer':
          return 'Offer made for'
        case 'withdrawOffer':
          return listing.seller === 'address' ?
            'Rejected offer for' :
            'Withdrew offer for'
        case 'acceptOffer':
          return 'Offer accepted for'
        case 'dispute':
          return 'Dispute started for'
        case 'finalize':
          return 'Funds released for'
        case 'addData':
          return 'Reviewed sale of'
      }
    }

    return status === 'completed' ? (
      <TouchableHighlight onPress={handlePress}>
        <View style={[ styles.listItem, style ]}>
          {!picture && <Image source={require('../../assets/images/avatar.png')} style={styles.avatar} />}
          {picture && <Image source={{ uri: picture.url }} style={styles.thumbnail} />}
          <View style={styles.content}>
            {item.listing && <View><Text style={styles.imperative}>{activitySummary()} <Text style={{ fontWeight: 'normal' }}>{item.listing.title}</Text></Text>
            <View style={styles.counterparties}>
              <Text style={styles.address}>{`${address.slice(0, 4)}...${address.slice(38)}`}</Text>
              <Image source={require('../../assets/images/arrow-forward-material.png')} style={styles.arrow} />
              <Text style={styles.address}>{`${counterpartyAddress.slice(0, 4)}...${counterpartyAddress.slice(38)}`}</Text>
            </View></View>}
            {!item.listing && meta && <View><Text style={styles.imperative}>called <Text style={styles.subject}>{meta.contract}.{meta.method}</Text></Text>
            <View style={styles.counterparties}>
              <Text style={styles.address}>{`${address.slice(0, 4)}...${address.slice(38)}`}</Text>
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
    ) : (
      <TouchableHighlight onPress={handlePress}>
        <View style={[ styles.pendingItem, style ]}>
          <Text style={styles.heading}>
            {
              transaction_type === 'purchase' ?
              'Offer in progress' :
              'Listing in progress'
            }
          </Text>
          <View style={styles.listingCard}>
            {picture &&
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: picture.url }}
                  style={styles.picture}
                  resizeMethod={'resize'}
                  resizeMode={'cover'}
                />
              </View>
            }
            <Text style={styles.subject}>{listing.title}</Text>
            <View style={styles.counterparties}>
              <Text style={styles.address}>{`${address.slice(0, 4)}...${address.slice(38)}`}</Text>
              <Image source={require('../../assets/images/arrow-forward-material.png')} style={styles.arrow} />
              <Text style={styles.address}>{`${counterpartyAddress.slice(0, 4)}...${counterpartyAddress.slice(38)}`}</Text>
              {status && <Text style={styles.address}>Status: {status}</Text>}
            </View>
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
    marginRight: 10,
  },
  content: {
    flex: 1,
    marginTop: 5,
  },
  counterparties: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  heading: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageContainer: {
    marginBottom: 10,
  },
  imperative: {
    fontSize: 17,
    fontWeight: '300',
    marginBottom: 4,
  },
  listingCard: {
    borderColor: '#dde6ea',
    borderRadius: 7,
    borderWidth: 1,
    flex: 1,
    padding: 10,
  },
  listItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: '5%',
  },
  pendingItem: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
  },
  picture: {
    height: 156,
    width: 208,
  },
  subject: {
    fontFamily: 'Lato',
    fontSize: 17,
    marginBottom: 10,
  },
  thumbnail: {
    height: 50,
    marginRight: 10,
    width: 50,
  },
})
