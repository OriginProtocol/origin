import React, { Component, Fragment } from 'react'
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'

import { promptForNotifications } from 'actions/Activation'
import { fetchUser } from 'actions/User'

import Address from 'components/address'
import Avatar from 'components/avatar'
import OriginButton from 'components/origin-button'

import currencies from 'utils/currencies'
import { getFiatPrice } from 'utils/price'
import { sufficientFunds } from 'utils/transaction'
import { toOgns } from 'utils/ogn'

import originWallet from '../OriginWallet'

const DETAIL_PADDING = 20
const IMAGES_PATH = '../../assets/images/'

class TransactionScreen extends Component {
  constructor(props) {
    super(props)

    this.handleApprove = this.handleApprove.bind(this)
    this.handleProfile = this.handleProfile.bind(this)
    this.handleReject = this.handleReject.bind(this)
    this.state = {}
  }

  static navigationOptions = ({ address, navigation }) => {
    const { listing, meta } = navigation.getParam('item')
    let title

    switch(meta.method) {
      case 'createListing':
        title = 'Create Listing'
        break
      case 'makeOffer':
        title = 'Make Offer'
        break
      case 'withdrawOffer':
        title = listing.seller === address ? 'Reject Offer' : 'Withdraw Offer'
        break
      case 'acceptOffer':
        title = 'Accept Offer'
        break
      case 'dispute':
        title = 'Report Problem'
        break
      case 'finalize':
        title = 'Release Funds'
        break
      case 'addData':
        title = 'Leave Review'
        break
      case 'emitIdentityUpdated':
        title = 'Publish Identity'
        break
      default:
        title = 'Blockchain Transaction'
    }

    return ({
      title,
      headerTitleStyle : {
        fontFamily: 'Poppins',
        fontSize: 17,
        fontWeight: 'normal',
      },
    })
  }

  componentDidMount() {
    const { activation, fetchUser, navigation, wallet } = this.props
    const hasNotificationsEnabled = activation.notifications.permissions.hard.alert
    const item = navigation.getParam('item')
    const { listing, method, to } = navigation.state.params.item.meta
    
    !hasNotificationsEnabled && this.props.promptForNotifications(method)

    fetchUser(wallet.address)
    fetchUser(listing ? listing.seller : to)
  }

  handleApprove() {
    const item = this.props.navigation.getParam('item')

    originWallet.handleEvent(item)
  }

  handleProfile(address) {
    this.props.navigation.navigate('Profile', {
      user: this.props.users.find(user => user.address === address) || { address },
    })
  }

  handleReject() {
    const item = this.props.navigation.getParam('item')

    originWallet.handleReject(item)
  }

  render() {
    const { navigation, users, wallet } = this.props
    const item = navigation.getParam('item')
    const { cost, gas_cost, ogn_cost, identity, listing, to } = item
    const counterpartyAddress = (listing && listing.seller) || to
    const { price = { amount: '', currency: '' } } = listing || {}
    const picture = (listing && listing.media && listing.media[0]) || (identity && identity.profile && identity.profile.avatar)
    const { profile } = identity || {}
    const hasSufficientFunds = sufficientFunds(wallet, item)
    const { width } = Dimensions.get('window')
    const innerWidth = width - DETAIL_PADDING * 2
    const fromUser = users.find(({ address }) => address === wallet.address) || {}
    const toUser = users.find(({ address }) => address === counterpartyAddress) || {}
    const priceInETH = Number(web3.utils.fromWei(web3.utils.toBN(cost).toString())).toFixed(5)
    const fiatPrice = getFiatPrice(priceInETH)
    const ognCost = toOgns(ogn_cost)
    const gasCostInETH = Number(web3.utils.fromWei(web3.utils.toBN(gas_cost).toString())).toFixed(5)
    const fiatGasCost = getFiatPrice(gasCostInETH)
    const fullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'Unnamed User'

    return (
      <View style={styles.container}>
        <View style={styles.details}>
          {picture !== '' &&
            <View style={[styles.imageContainer, { height: innerWidth * 0.75 }]}>
              <Image
                source={{ uri: picture.url || picture }}
                resizeMethod={'resize'}
                resizeMode={'cover'}
                style={{ flex: 1 }}
              />
            </View>
          }
          {listing &&
            <Text numberOfLines={1} style={styles.title}>{listing.title}</Text>
          }
          {identity &&
            <Text numberOfLines={1} style={styles.title}>{fullName}</Text>
          }
          <View style={styles.accounts}>
            <Avatar
              image={fromUser.profile && fromUser.profile.avatar}
              size={40}
              style={[
                styles.avatar, 
                fromUser.profile && fromUser.profile.avatar ? { paddingTop: 0 } : {},
              ]}
              onPress={() => this.handleProfile(wallet.address)}
            />
            <View style={styles.accountText}>
              <Text style={styles.direction}>From</Text>
              <Address
                address={wallet.address}
                chars={4}
                label={'From Address'}
                style={styles.address}
                onPress={() => this.handleProfile(wallet.address)}
              />
            </View>
            <Image source={require(`${IMAGES_PATH}arrow-forward.png`)} style={styles.arrow} />
            <Avatar
              image={toUser.profile && toUser.profile.avatar}
              size={40}
              style={[
                styles.avatar, 
                toUser.profile && toUser.profile.avatar ? { paddingTop: 0 } : {},
              ]}
              onPress={() => this.handleProfile(counterpartyAddress)}
            />
            <View style={styles.accountText}>
              <Text style={styles.direction}>To</Text>
              <Address
                address={counterpartyAddress}
                chars={4}
                label={'To Address'}
                style={styles.address}
                onPress={() => this.handleProfile(counterpartyAddress)}
              />
            </View>
          </View>
          {priceInETH > 0 &&
            <View style={styles.lineItem}>
              <Image source={currencies['eth'].icon} style={styles.icon} />
              <Text style={styles.label}>Price</Text>
              <Text style={styles.amount}>{priceInETH}</Text>
              <View style={styles.currencyContainer}>
                <Text style={[styles.label, styles.currency, { color: currencies['eth'].color }]}>ETH</Text>
                {fiatPrice && <Text style={[styles.label, styles.currency, { color: '#94a7b5' }]}>{fiatPrice} USD</Text>}
              </View>
            </View>
          }
          {gasCostInETH > 0 &&
            <View style={styles.lineItem}>
              <Image source={currencies['eth'].icon} style={styles.icon} />
              <Text style={styles.label}>Gas Cost</Text>
              <Text style={styles.amount}>{gasCostInETH}</Text>
              <View style={styles.currencyContainer}>
                <Text style={[styles.label, styles.currency, { color: currencies['eth'].color }]}>ETH</Text>
                {fiatGasCost && <Text style={[styles.label, styles.currency, { color: '#94a7b5' }]}>{fiatGasCost} USD</Text>}
              </View>
            </View>
          }
          {ogn_cost > 0 &&
            <View style={styles.lineItem}>
              <Image source={currencies['ogn'].icon} style={styles.icon} />
              <Text style={styles.label}>OGN Commision</Text>
              <Text style={styles.amount}>{ognCost}</Text>
              <View style={styles.currencyContainer}>
                <Text style={[styles.label, styles.currency, { color: currencies['ogn'].color }]}>OGN</Text>
              </View>
            </View>
          }
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            deactivate={true}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={hasSufficientFunds ? 'Confirm' : 'Continue'}
            onPress={hasSufficientFunds ? this.handleApprove : () => {
              navigation.navigate('WalletFunding', {
                currency: price.amount ? price.currency.toLowerCase() : 'eth',
                item,
              })
            }}
          />
          <OriginButton
            size="large"
            type="danger"
            outline={true}
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Cancel'}
            onPress={this.handleReject}
          />
        </View>
      </View>
    )
  }
}

const mapStateToProps = ({ activation, users, wallet }) => {
  return { activation, users, wallet }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: address => dispatch(fetchUser(address)),
  promptForNotifications: method => dispatch(promptForNotifications(method)),
})

export default connect(mapStateToProps, mapDispatchToProps)(TransactionScreen)

const styles = StyleSheet.create({
  accounts: {
    alignItems: 'center',
    borderColor: '#dde6ea',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 20,
  },
  accountText: {
    justifyContent: 'space-between',
  },
  address: {
    color: '#0b1823',
    fontFamily: 'Lato',
    fontSize: 14
  },
  amount: {
    fontFamily: 'Lato',
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 'auto',
    marginRight: 8,
    textAlign: 'right',
  },
  arrow: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  avatar: {
    marginRight: 13,
  },
  button: {
    marginBottom: 10,
  },
  buttonsContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: '#dde6ea',
    borderTopWidth: 1,
    padding: 20,
    paddingBottom: 10,
    width: '100%',
  },
  cancel: {
    color: '#007fff',
    fontFamily: 'Lato',
    fontSize: 14,
  },
  container: {
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'flex-end',
  },
  currency: {
    fontSize: 10,
  },
  currencyContainer: {
    width: 66,
  },
  details: {
    flex: 1,
    padding: DETAIL_PADDING,
  },
  direction: {
    color: '#3e5d77',
    fontFamily: 'Lato',
    fontSize: 14
  },
  icon: {
    height: 34,
    marginRight: 16,
    width: 34,
  },
  imageContainer: {
    flexShrink: 1,
    marginBottom: 20,
  },
  label: {
    color: '#3e5d77',
    fontFamily: 'Lato',
    fontSize: 14,
  },
  lineItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 20,
  },
  title: {
    fontFamily: 'Lato',
    fontSize: 28,
  },
})
