import React, { Component, Fragment } from 'react'
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'

import { promptForNotifications } from 'actions/Activation'

import Address from 'components/address'
import Avatar from 'components/avatar'
import OriginButton from 'components/origin-button'

import currencies from 'utils/currencies'
import { sufficientFunds } from 'utils/transaction'

import originWallet from '../OriginWallet'

const DETAIL_PADDING = 20
const IMAGES_PATH = '../../assets/images/'

class TransactionScreen extends Component {
  constructor(props) {
    super(props)

    this.handleApprove = this.handleApprove.bind(this)
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
    const { activation, navigation } = this.props
    const hasNotificationsEnabled = activation.notifications.permissions.hard.alert
    const { method } = navigation.state.params.item.meta
    
    !hasNotificationsEnabled && this.props.promptForNotifications(method)
  }

  handleApprove() {
    const item = this.props.navigation.getParam('item')

    originWallet.handleEvent(item)
  }

  handleReject() {
    const item = this.props.navigation.getParam('item')

    originWallet.handleReject(item)
  }

  render() {
    const { navigation, wallet } = this.props
    const item = navigation.getParam('item')
    const { cost, gas_cost, listing, to } = item
    const counterpartyAddress = (listing && listing.seller) || to
    const { price = { amount: '', currency: '' } } = listing
    const picture = listing && listing.media && listing.media[0]
    const hasSufficientFunds = sufficientFunds(wallet, item)
    const total = web3.utils.toBN(cost).add(web3.utils.toBN(gas_cost))
    const { width } = Dimensions.get('window')
    const innerWidth = width - DETAIL_PADDING * 2

    return (
      <View style={styles.container}>
        <View style={styles.details}>
          {picture &&
            <View style={[styles.imageContainer, { height: innerWidth * 0.75 }]}>
              <Image
                source={{ uri: picture.url }}
                resizeMethod={'resize'}
                resizeMode={'cover'}
                style={{ flex: 1 }}
              />
            </View>
          }
          <Text numberOfLines={1} style={styles.title}>{listing.title}</Text>
          <View style={styles.accounts}>
            <Avatar size={40} style={{ marginRight: 13 }} />
            <View style={styles.accountText}>
              <Text style={styles.direction}>From</Text>
              <Address
                address={wallet.address}
                chars={4}
                label={'From Address'}
                style={styles.address}
              />
            </View>
            <Image source={require(`${IMAGES_PATH}arrow-forward.png`)} style={styles.arrow} />
            <Avatar size={40} style={{ marginRight: 13 }} />
            <View style={styles.accountText}>
              <Text style={styles.direction}>To</Text>
              <Address
                address={counterpartyAddress}
                chars={4}
                label={'To Address'}
                style={styles.address}
              />
            </View>
          </View>
          <View style={styles.lineItem}>
            <Image source={currencies['eth'].icon} style={styles.icon} />
            <Text style={styles.label}>Price</Text>
            <Text style={styles.amount}>{Number(web3.utils.fromWei(web3.utils.toBN(cost))).toFixed(5)}</Text>
            <View style={styles.currencyContainer}>
              <Text style={[styles.label, styles.currency, { color: currencies['eth'].color }]}>ETH</Text>
              <Text style={[styles.label, styles.currency, { color: '#94a7b5' }]}>123.45 USD</Text>
            </View>
          </View>
          <View style={styles.lineItem}>
            <Image source={currencies['eth'].icon} style={styles.icon} />
            <Text style={styles.label}>Gas Cost</Text>
            <Text style={styles.amount}>{Number(web3.utils.fromWei(web3.utils.toBN(gas_cost))).toFixed(5)}</Text>
            <View style={styles.currencyContainer}>
              <Text style={[styles.label, styles.currency, { color: currencies['eth'].color }]}>ETH</Text>
              <Text style={[styles.label, styles.currency, { color: '#94a7b5' }]}>123.45 USD</Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={hasSufficientFunds ? 'Confirm' : 'Continue'}
            onPress={hasSufficientFunds ? this.handleApprove : () => {
              navigation.navigate('WalletFunding', {
                currency: price.currency.toLowerCase(),
                item,
              })
            }}
          />
          <OriginButton
            size="large"
            type="danger"
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

const mapStateToProps = ({ activation, wallet }) => {
  return { activation, wallet }
}

const mapDispatchToProps = dispatch => ({
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
