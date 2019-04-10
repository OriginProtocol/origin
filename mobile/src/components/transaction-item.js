import React, { Component, Fragment } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'

import Address from 'components/address'
import OriginButton from 'components/origin-button'

import { toOgns } from 'utils/tokens'
import { sufficientFunds } from 'utils/transaction'

const IMAGES_PATH = '../../assets/images/'

class TransactionItem extends Component {
  render() {
    const {
      activation,
      item,
      address = '',
      handleApprove,
      handlePress,
      handleReject,
      navigation,
      style,
      wallet
    } = this.props
    const {
      cost,
      gas_cost,
      ogn_cost,
      identity = {},
      listing = {},
      meta,
      status,
      to
    } = item
    const hasNotificationsEnabled =
      activation.notifications.permissions.hard.alert
    // To Do: account for possible commission
    const hasSufficientFunds = sufficientFunds(wallet, item)
    const counterpartyAddress = listing.seller || to
    const { price = { amount: '', currency: '' } } = listing
    const { profile = {} } = identity
    const { avatar, firstName = '', lastName = '' } = profile
    const picture = (listing.media && listing.media[0]) || avatar
    const costEth = Number(web3.utils.fromWei(cost.toString())).toFixed(5)
    const gasEth = Number(web3.utils.fromWei(gas_cost.toString())).toFixed(5)
    const totalEth = Number(
      web3.utils.fromWei(
        web3.utils
          .toBN(cost)
          .add(web3.utils.toBN(gas_cost))
          .toString()
      )
    ).toFixed(5)
    const totalOgn = toOgns(ogn_cost)
    let activitySummary, heading
    const fullName =
      `${profile.firstName} ${profile.lastName}`.trim() || 'Unnamed User'

    switch (meta.method) {
      case 'createListing':
        activitySummary =
          status === 'completed' ? 'Created listing' : 'Canceled listing'
        heading = 'Listing in progress'
        break
      case 'makeOffer':
        activitySummary =
          status === 'completed' ? 'Offer made' : 'Offer canceled'
        heading = 'Purchase in progress'
        break
      case 'withdrawOffer':
        activitySummary =
          listing.seller === address
            ? status === 'completed'
              ? 'Rejected offer'
              : 'Canceled offer rejection'
            : status === 'completed'
            ? 'Withdrew offer'
            : 'Canceled offer withdrawal'
        heading =
          listing.seller === address
            ? 'Rejecting an offer'
            : 'Withdrawing an offer'
        break
      case 'acceptOffer':
        activitySummary =
          status === 'completed'
            ? 'Offer accepted'
            : 'Offer acceptance canceled'
        heading = 'Accepting an offer'
        break
      case 'dispute':
        activitySummary =
          status === 'completed' ? 'Dispute started' : 'Dispute canceled'
        heading = 'Reporting a problem'
        break
      case 'finalize':
        activitySummary =
          status === 'completed'
            ? 'Funds released'
            : 'Release of funds canceled'
        heading = 'Releasing funds'
        break
      case 'addData':
        activitySummary =
          status === 'completed' ? 'Reviewed sale' : 'Review canceled'
        heading = 'Leaving a review'
        break
      case 'emitIdentityUpdated':
        activitySummary =
          status === 'completed' ? 'Identity published' : 'Identity canceled'
        heading = 'Publishing an identity'
        break
      default:
        activitySummary =
          status === 'completed'
            ? 'Confirmed transaction'
            : 'Canceled transaction'
        heading = 'Transaction in progress'
    }

    return ['completed', 'rejected'].find(s => s === status) ? (
      <TouchableHighlight onPress={handlePress}>
        <View style={[styles.listItem, styles.completed, style]}>
          {!picture && meta.method === 'emitIdentityUpdated' && (
            <Image
              source={require(`${IMAGES_PATH}placeholder-user.png`)}
              style={{ ...styles.thumbnail }}
            />
          )}
          {!picture && meta.method !== 'emitIdentityUpdated' && (
            <Image
              source={require(`${IMAGES_PATH}placeholder-listing.png`)}
              style={{ ...styles.thumbnail }}
            />
          )}
          {!!picture && (
            <Image
              source={{ uri: picture.url || picture }}
              style={styles.thumbnail}
            />
          )}
          <View style={styles.content}>
            {(listing.ipfsHash || identity.profile) && (
              <View>
                <Text style={styles.imperative}>{activitySummary}</Text>
                <View style={styles.counterparties}>
                  <Address
                    address={address}
                    label="From Address"
                    style={styles.address}
                  />
                  <Image
                    source={require(`${IMAGES_PATH}arrow-forward.png`)}
                    style={styles.arrow}
                  />
                  <Address
                    address={counterpartyAddress}
                    label="To Address"
                    style={styles.address}
                  />
                </View>
              </View>
            )}
            {!listing.ipfsHash && !identity.profile && (
              <View>
                <Text style={styles.imperative}>
                  called{' '}
                  <Text style={styles.subject}>
                    {meta.contract}.{meta.method}
                  </Text>
                </Text>
                <View style={styles.counterparties}>
                  <Address
                    address={address}
                    label="From Address"
                    style={styles.address}
                  />
                  {costEth > 0 && (
                    <Text style={styles.imperative}>Value: {costEth} Eth</Text>
                  )}
                  <Text style={styles.imperative}>Gas: {gasEth} Eth</Text>
                  {meta && (
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={styles.address}>{meta.contract}</Text>
                      <Address
                        address={meta.to}
                        label="To Address"
                        style={styles.address}
                      />
                    </View>
                  )}
                  {status && (
                    <Text style={styles.address}>Status: {status}</Text>
                  )}
                </View>
              </View>
            )}
            {hasSufficientFunds && handleApprove && (
              <View style={styles.actions}>
                <View style={{ marginRight: 10 }}>
                  <OriginButton
                    size="small"
                    type="primary"
                    title="Approve"
                    deactivate={true}
                    onPress={handleApprove}
                  />
                </View>
                <OriginButton
                  size="small"
                  type="danger"
                  title="Reject"
                  deactivate={true}
                  onPress={handleReject}
                />
              </View>
            )}
          </View>
        </View>
      </TouchableHighlight>
    ) : (
      <View style={[styles.pendingItem, style]}>
        <Text style={styles.heading}>{heading}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.listingCardTouch}
          onPress={() => {
            navigation.navigate('Transaction', { item })
          }}
        >
          <View style={styles.listingCard}>
            {!!picture && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: picture.url || picture }}
                  style={styles.picture}
                  resizeMethod={'resize'}
                  resizeMode={'cover'}
                />
              </View>
            )}
            <View style={styles.main}>
              <View style={styles.detailsContainer}>
                <Text numberOfLines={1} style={styles.subject}>
                  {listing.title || fullName}
                </Text>
                <View style={styles.counterparties}>
                  <Address
                    address={address}
                    label="From Address"
                    style={styles.address}
                  />
                  <Image
                    source={require(`${IMAGES_PATH}arrow-forward.png`)}
                    style={styles.arrow}
                  />
                  <Address
                    address={counterpartyAddress}
                    label="To Address"
                    style={styles.address}
                  />
                </View>
                <View style={styles.price}>
                  <Image
                    source={require(`${IMAGES_PATH}eth-icon.png`)}
                    style={styles.currencyIcon}
                  />
                  <Text style={styles.amount}>{totalEth} </Text>
                  <Text style={styles.abbreviation}>ETH</Text>
                </View>
                {ogn_cost > 0 && (
                  <View style={styles.price}>
                    <Image
                      source={require(`${IMAGES_PATH}ogn-icon.png`)}
                      style={styles.currencyIcon}
                    />
                    <Text style={styles.amount}>{totalOgn} </Text>
                    <Text style={styles.abbreviation}>OGN</Text>
                  </View>
                )}
              </View>
              <View style={styles.nav}>
                <Image source={require(`${IMAGES_PATH}nav-arrow.png`)} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {(!hasNotificationsEnabled || !hasSufficientFunds) && (
          <Fragment>
            <Text style={styles.heading}>
              {!hasNotificationsEnabled && !hasSufficientFunds
                ? 'Next Steps'
                : 'Next Step'}
            </Text>
            <View style={styles.nextSteps}>
              {!hasNotificationsEnabled && (
                <View style={styles.stepContainer}>
                  <Image source={require(`${IMAGES_PATH}chat-bubble.png`)} />
                  <Text style={styles.step}>Enable Notifications</Text>
                </View>
              )}
              {!hasNotificationsEnabled && !hasSufficientFunds && (
                <Image
                  source={require(`${IMAGES_PATH}white-arrow.png`)}
                  style={styles.stepSeparator}
                />
              )}
              {!hasSufficientFunds && (
                <View style={styles.stepContainer}>
                  <Image source={require(`${IMAGES_PATH}coin-stack.png`)} />
                  <Text style={styles.step}>Add Funds</Text>
                </View>
              )}
            </View>
          </Fragment>
        )}
        <OriginButton
          size="large"
          type="primary"
          style={styles.button}
          textStyle={{ fontSize: 14, fontWeight: '900' }}
          title={
            hasNotificationsEnabled && hasSufficientFunds
              ? 'Confirm'
              : 'Continue'
          }
          onPress={
            hasNotificationsEnabled && hasSufficientFunds
              ? handleApprove
              : () => {
                  if (hasSufficientFunds) {
                    navigation.navigate('Transaction', { item })
                  } else {
                    navigation.navigate('WalletFunding', {
                      currency: price.amount
                        ? price.currency.toLowerCase()
                        : 'eth',
                      item
                    })
                  }
                }
          }
          deactivate={hasNotificationsEnabled && hasSufficientFunds}
        />
        <OriginButton
          size="large"
          type="danger"
          outline={true}
          style={styles.button}
          textStyle={{ fontSize: 14, fontWeight: '900' }}
          title={'Cancel'}
          onPress={handleReject}
          deactivate={true}
        />
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
    lineHeight: 10
  },
  actions: {
    flexDirection: 'row',
    paddingTop: '5%'
  },
  address: {
    color: '#3e5d77',
    fontSize: 12,
    fontWeight: '300'
  },
  amount: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: 'bold',
    marginRight: 5
  },
  arrow: {
    height: 12,
    marginLeft: 10,
    marginRight: 10,
    width: 12
  },
  button: {
    borderRadius: 30,
    height: 40,
    marginBottom: 10,
    marginHorizontal: 10
  },
  completed: {
    maxHeight: 94
  },
  content: {
    flex: 1,
    marginTop: 5
  },
  counterparties: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10
  },
  currencyIcon: {
    height: 16,
    marginRight: 5,
    width: 16
  },
  detailsContainer: {
    flex: 1
  },
  heading: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10
  },
  imageContainer: {
    marginBottom: 10
  },
  imperative: {
    fontSize: 17,
    fontWeight: 'normal',
    marginBottom: 4
  },
  listingCard: {
    borderColor: '#dde6ea',
    borderRadius: 7,
    borderWidth: 1,
    padding: 10
  },
  listingCardTouch: {
    flex: 1,
    marginBottom: 20
  },
  listItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: '5%'
  },
  main: {
    flexDirection: 'row',
    minWidth: 200
  },
  nav: {
    justifyContent: 'center',
    paddingLeft: 10
  },
  nextSteps: {
    backgroundColor: '#eaf0f3',
    borderRadius: 7,
    flexDirection: 'row',
    height: 38,
    marginBottom: 20
  },
  pendingItem: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10
  },
  picture: {
    height: 156,
    width: 208
  },
  price: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'row'
  },
  step: {
    fontFamily: 'Lato',
    fontSize: 14,
    fontWeight: '300',
    marginLeft: 5
  },
  stepContainer: {
    flexDirection: 'row',
    margin: 10
  },
  stepSeparator: {
    height: 44,
    marginTop: -3,
    width: 22
  },
  subject: {
    fontFamily: 'Lato',
    fontSize: 17,
    marginBottom: 10
  },
  thumbnail: {
    height: 50,
    marginRight: 20,
    width: 50
  }
})
