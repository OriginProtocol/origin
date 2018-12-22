import React, { Component, Fragment } from 'react'
import { Alert, Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'

import OriginButton from 'components/origin-button'

const IMAGES_PATH = '../../assets/images/'

class TransactionItem extends Component {
  render() {
    const { activation, item, address = '', balance, handleApprove, handlePress, handleReject, style } = this.props
    const { cost, listing, meta, status, to, transaction_type } = item
    const hasNotificationsEnabled = activation.notifications.permissions.hard.alerts
    const hasSufficientFunds = web3.utils.toBN(balance).gt(cost)
    const counterpartyAddress = (listing && listing.seller) || to
    const { price = { amount: '', currency: '' } } = listing
    const picture = listing && listing.media && listing.media[0]
    const activitySummary = status => {
      switch(meta.method) {
        case 'createListing':
          return status === 'completed' ? 'Created listing' : 'Canceled listing'
        case 'makeOffer':
          return status === 'completed' ? 'Offer made' : 'Offer canceled'
        case 'withdrawOffer':
          return listing.seller === 'address' ?
            (status === 'completed' ? 'Rejected offer' : 'Canceled offer rejection') :
            (status === 'completed' ? 'Withdrew offer' : 'Canceled offer withdrawal')
        case 'acceptOffer':
          return status === 'completed' ? 'Offer accepted' : 'Offer acceptance canceled'
        case 'dispute':
          return status === 'completed' ? 'Dispute started' : 'Dispute canceled'
        case 'finalize':
          return status === 'completed' ? 'Funds released' : 'Release of funds canceled'
        case 'addData':
          return status === 'completed' ? 'Reviewed sale' : 'Review canceled'
      }
    }

    return ['completed', 'rejected'].find(s => s === status) ? (
      <TouchableHighlight onPress={handlePress}>
        <View style={[ styles.listItem, style ]}>
          {!picture && <Image source={require(`${IMAGES_PATH}avatar.png`)} style={styles.avatar} />}
          {picture && <Image source={{ uri: picture.url }} style={styles.thumbnail} />}
          <View style={styles.content}>
            {listing &&
              <View>
                <Text style={styles.imperative}>{activitySummary(status)}</Text>
                <View style={styles.counterparties}>
                  <Text style={styles.address}>{`${address.slice(0, 4)}...${address.slice(38)}`}</Text>
                  <Image source={require(`${IMAGES_PATH}arrow-forward-material.png`)} style={styles.arrow} />
                  <Text style={styles.address}>{`${counterpartyAddress.slice(0, 4)}...${counterpartyAddress.slice(38)}`}</Text>
                </View>
              </View>
            }
            {!listing && meta &&
              <View>
                <Text style={styles.imperative}>called <Text style={styles.subject}>{meta.contract}.{meta.method}</Text></Text>
                <View style={styles.counterparties}>
                  <Text style={styles.address}>{`${address.slice(0, 4)}...${address.slice(38)}`}</Text>
                  {cost && <Text style={styles.imperative}>Value: {cost} Eth</Text>}
                  <Text style={styles.imperative}>Gas: {gas_cost}</Text>
                  <Text style={styles.address}>{meta.contract}({`${meta.to.slice(0, 4)}...${meta.to.slice(38)}`})</Text>
                  {status && <Text style={styles.address}>Status: {status}</Text>}
                </View>
              </View>
            }
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
      <View style={[ styles.pendingItem, style ]}>
        <Text style={styles.heading}>
          {
            transaction_type === 'purchase' ?
            'Offer in progress' :
            'Listing in progress'
          }
        </Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.listingCardTouch} onPress={handlePress}>
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
            <View style={styles.main}>
              <View style={styles.detailsContainer}>
                <Text style={styles.subject}>{listing.title}</Text>
                <View style={styles.counterparties}>
                  <Text style={styles.address}>{`${address.slice(0, 4)}...${address.slice(38)}`}</Text>
                  <Image source={require(`${IMAGES_PATH}arrow-forward-material.png`)} style={styles.arrow} />
                  <Text style={styles.address}>{`${counterpartyAddress.slice(0, 4)}...${counterpartyAddress.slice(38)}`}</Text>
                </View>
                <View style={styles.price}>
                  <Image source={require(`${IMAGES_PATH}eth-icon.png`)} style={styles.currencyIcon} />
                  <Text style={styles.amount}>{Number(price.amount).toFixed(5)}</Text>
                  <Text style={styles.abbreviation}>{price.currency}</Text>
                </View>
              </View>
              <View style={styles.nav}>
                <Image source={require('../../assets/images/arrow-right.png')} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {(!hasNotificationsEnabled || !hasSufficientFunds) &&
          <Fragment>
            <Text style={styles.heading}>
              {(!hasNotificationsEnabled && !hasSufficientFunds) ? 'Next Steps' : 'Next Step'}
            </Text>
            <View style={styles.nextSteps}>
              <Text style={styles.step}>Enable Notifications</Text>
              <Text style={{ color: 'white', fontWeight: '900' }}>></Text>
              {!hasSufficientFunds && <Text style={styles.step}>Add Funds</Text>}
            </View>
            <OriginButton
              size="large"
              type="primary"
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={'Continue'}
              onPress={() => {
                Alert.alert('Next')
              }}
            />
          </Fragment>
        }
        {(hasNotificationsEnabled && hasSufficientFunds) &&
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Confirm'}
            onPress={handleApprove}
          />
        }
        <TouchableOpacity onPress={handleReject}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = ({ activation }) => {
  return {
    activation,
  }
}

export default connect(mapStateToProps)(TransactionItem)

const styles = StyleSheet.create({
  abbreviation: {
    color: '#7a26f3',
    fontFamily: 'Lato',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 10,
  },
  actions: {
    flexDirection: 'row',
    paddingTop: '5%',
  },
  address: {
    color: '#3e5d77',
    fontSize: 12,
    fontWeight: '300',
  },
  amount: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: 'bold',
    marginRight: 5,
  },
  arrow: {
    marginLeft: 10,
    marginRight: 10,
  },
  avatar: {
    marginRight: 10,
  },
  button: {
    marginBottom: 20,
    marginHorizontal: 10,
  },
  cancel: {
    color: '#007fff',
    fontFamily: 'Lato',
    fontSize: 14,
    marginBottom: 10,
  },
  content: {
    flex: 1,
    marginTop: 5,
  },
  counterparties: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  currencyIcon: {
    height: 16,
    marginRight: 5,
    width: 16,
  },
  detailsContainer: {
    flex: 1,
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
    padding: 10,
  },
  listingCardTouch: {
    flex: 1,
    marginBottom: 20,
  },
  listItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: '5%',
  },
  main: {
    flexDirection: 'row',
  },
  nav: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
  nextSteps: {
    backgroundColor: '#eaf0f3',
    borderRadius: 7,
    flexDirection: 'row',
    marginBottom: 20,
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
  price: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'row',
  },
  subject: {
    fontFamily: 'Lato',
    fontSize: 17,
    marginBottom: 10,
  },
  step: {
    fontFamily: 'Lato',
    fontSize: 14,
    fontWeight: '300',
    margin: 10,
  },
  thumbnail: {
    height: 50,
    marginRight: 10,
    width: 50,
  },
})
