import React, { Component, Fragment } from 'react'
import { Alert, Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'

import Address from 'components/address'
import OriginButton from 'components/origin-button'

import { sufficientFunds } from 'utils/transaction'

const IMAGES_PATH = '../../assets/images/'

class TransactionItem extends Component {
  render() {
    const { activation, item, address = '', handleApprove, handlePress, handleReject, navigation, style, wallet } = this.props
    const { cost, gas_cost, listing, meta, status, to } = item
    const hasNotificationsEnabled = activation.notifications.permissions.hard.alert
    // To Do: account for possible commission
    const hasSufficientFunds = sufficientFunds(wallet, item)
    const counterpartyAddress = (listing && listing.seller) || to
    const { price = { amount: '', currency: '' } } = listing
    const picture = listing && listing.media && listing.media[0]
    let activitySummary, heading

    switch(meta.method) {
      case 'createListing':
        activitySummary = status === 'completed' ? 'Created listing' : 'Canceled listing'
        heading = 'Listing in progress'
        break
      case 'makeOffer':
        activitySummary = status === 'completed' ? 'Offer made' : 'Offer canceled'
        heading = 'Purchase in progress'
        break
      case 'withdrawOffer':
        activitySummary = listing.seller === address ?
          (status === 'completed' ? 'Rejected offer' : 'Canceled offer rejection') :
          (status === 'completed' ? 'Withdrew offer' : 'Canceled offer withdrawal')
        heading = listing.seller === address ? 'Rejecting an offer' : 'Withdrawing an offer'
        break
      case 'acceptOffer':
        activitySummary = status === 'completed' ? 'Offer accepted' : 'Offer acceptance canceled'
        heading = 'Accepting an offer'
        break
      case 'dispute':
        activitySummary = status === 'completed' ? 'Dispute started' : 'Dispute canceled'
        heading = 'Reporting a problem'
        break
      case 'finalize':
        activitySummary = status === 'completed' ? 'Funds released' : 'Release of funds canceled'
        heading = 'Releasing funds'
        break
      case 'addData':
        activitySummary = status === 'completed' ? 'Reviewed sale' : 'Review canceled'
        heading = 'Leaving a review'
        break
      default:
        activitySummary = status === 'completed' ? 'Confirmed transaction' : 'Canceled transaction'
        heading = 'Transaction in progress'
    }

    return ['completed', 'rejected'].find(s => s === status) ? (
      <TouchableHighlight onPress={handlePress}>
        <View style={[ styles.listItem, style ]}>
          {!picture && <Image source={require(`${IMAGES_PATH}avatar.png`)} style={styles.avatar} />}
          {picture && <Image source={{ uri: picture.url }} style={styles.thumbnail} />}
          <View style={styles.content}>
            {listing &&
              <View>
                <Text style={styles.imperative}>{activitySummary}</Text>
                <View style={styles.counterparties}>
                  <Address address={address} label="From Address" style={styles.address} />
                  <Image source={require(`${IMAGES_PATH}arrow-forward.png`)} style={styles.arrow} />
                  <Address address={counterpartyAddress} label="To Address" style={styles.address} />
                </View>
              </View>
            }
            {!listing && meta &&
              <View>
                <Text style={styles.imperative}>called <Text style={styles.subject}>{meta.contract}.{meta.method}</Text></Text>
                <View style={styles.counterparties}>
                  <Address address={address} label="From Address" style={styles.address} />
                  {cost && <Text style={styles.imperative}>Value: {cost} Eth</Text>}
                  <Text style={styles.imperative}>Gas: {gas_cost}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.address}>{meta.contract}</Text>
                    <Address address={meta.to} label="To Address" style={styles.address} />
                  </View>
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
        <Text style={styles.heading}>{heading}</Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.listingCardTouch} onPress={() => {
          navigation.navigate('Transaction', { item })
        }}>
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
                  <Address address={address} label="From Address" style={styles.address} />
                  <Image source={require(`${IMAGES_PATH}arrow-forward.png`)} style={styles.arrow} />
                  <Address address={counterpartyAddress} label="To Address" style={styles.address} />
                </View>
                <View style={styles.price}>
                  <Image source={require(`${IMAGES_PATH}eth-icon.png`)} style={styles.currencyIcon} />
                  <Text style={styles.amount}>{Number(price.amount).toFixed(5)}</Text>
                  <Text style={styles.abbreviation}>{price.currency}</Text>
                </View>
              </View>
              <View style={styles.nav}>
                <Image source={require(`${IMAGES_PATH}nav-arrow.png`)} />
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
              {!hasNotificationsEnabled &&
                <View style={styles.stepContainer}>
                  <Image source={require(`${IMAGES_PATH}chat-bubble.png`)} />
                  <Text style={styles.step}>Enable Notifications</Text>
                </View>
              }
              {!hasNotificationsEnabled && !hasSufficientFunds &&
                <Image source={require(`${IMAGES_PATH}white-arrow.png`)} style={styles.stepSeparator} />
              }
              {!hasSufficientFunds &&
                <View style={styles.stepContainer}>
                  <Image source={require(`${IMAGES_PATH}coin-stack.png`)} />
                  <Text style={styles.step}>Add Funds</Text>
                </View>
              }
            </View>
            <OriginButton
              size="large"
              type="primary"
              style={styles.button}
              textStyle={{ fontSize: 18, fontWeight: '900' }}
              title={'Continue'}
              onPress={() => {
                if (hasSufficientFunds) {
                  navigation.navigate('Transaction', { item })
                } else {
                  navigation.navigate('WalletFunding', {
                    currency: price.currency.toLowerCase(),
                    item,
                  })
                }
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

const mapStateToProps = ({ activation, wallet }) => {
  return { activation, wallet }
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
    height: 12,
    marginLeft: 10,
    marginRight: 10,
    width: 12,
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
    height: 38,
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
  step: {
    fontFamily: 'Lato',
    fontSize: 14,
    fontWeight: '300',
    marginLeft: 5,
  },
  stepContainer: {
    flexDirection: 'row',
    margin: 10,
  },
  stepSeparator: {
    height: 44,
    marginTop: -3,
    width: 22,
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
