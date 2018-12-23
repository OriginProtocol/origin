import React, { Component } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'

import { promptForNotifications } from 'actions/Activation'

import OriginButton from 'components/origin-button'

import currencies from 'utils/currencies'
import { truncateAddress } from 'utils/user'

import originWallet from '../OriginWallet'

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

  handleApprove() {
    const item = this.props.navigation.getParam('item')

    originWallet.handleEvent(item)
  }

  handleReject() {
    const item = this.props.navigation.getParam('item')

    originWallet.handleReject(item)
  }

  render() {
    const { address, navigation } = this.props
    const item = navigation.getParam('item')
    const { cost, gas_cost, listing, to } = item
    const counterpartyAddress = (listing && listing.seller) || to
    const { price = { amount: '', currency: '' } } = listing
    const picture = listing && listing.media && listing.media[0]

    return (
      <View style={styles.container}>
        <View style={styles.summary}>
          <Text style={styles.subject}>{listing.title}</Text>
          <Text style={styles.summaryText}>{`From: ${truncateAddress(address)}`}</Text>
          <Text style={styles.summaryText}>{`To: ${truncateAddress(counterpartyAddress)}`}</Text>
          <Text style={styles.summaryText}>{`Value Transfer: ${web3.utils.fromWei(cost, 'ether')}`}</Text>
          <Text style={styles.summaryText}>{`Gas Cost: ${web3.utils.fromWei(gas_cost, 'ether')}`}</Text>
          {picture && <Image source={{ uri: picture.url }} style={styles.thumbnail} />}
          <View style={styles.price}>
            <Image source={currencies[price.currency.toLowerCase()].icon} style={styles.currencyIcon} />
            <Text style={styles.amount}>{Number(price.amount).toFixed(5)}</Text>
            <Text style={styles.abbreviation}>{price.currency}</Text>
          </View>
        </View>
        <View style={styles.content}>
          <Text style={styles.contentBody}>This transaction will be submitted to the blockchain.</Text>
        </View>
        <View style={styles.buttonsContainer}>
          <OriginButton
            size="large"
            type="primary"
            style={styles.button}
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Confirm'}
            onPress={this.handleApprove}
          />
          <TouchableOpacity onPress={this.handleReject}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    address: state.wallet.address,
    balances: state.wallet.balances,
  }
}

export default connect(mapStateToProps)(TransactionScreen)

const styles = StyleSheet.create({
  abbreviation: {
    color: '#7a26f3',
    fontFamily: 'Lato',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 10,
  },
  amount: {
    fontFamily: 'Lato',
    fontSize: 17,
    fontWeight: 'bold',
    marginRight: 5,
  },
  button: {
    marginBottom: 10,
  },
  buttonsContainer: {
    alignItems: 'center',
    flex: 0,
    width: '100%',
  },
  cancel: {
    color: '#007fff',
    fontFamily: 'Lato',
    fontSize: 14,
    marginBottom: 10,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f7f8f8',
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: '10%',
    paddingVertical: '5%',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  contentBody: {
    fontFamily: 'Lato',
    fontSize: 18,
    fontWeight: '300',
    textAlign: 'center',
  },
  currencyIcon: {
    height: 16,
    marginRight: 5,
    width: 16,
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
  summary: {
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  summaryText: {
    fontFamily: 'Lato',
    fontSize: 18,
    fontWeight: '300',
  },
  thumbnail: {
    height: 50,
    marginRight: 10,
    width: 50,
  },
})
