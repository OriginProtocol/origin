import React, { Component, Fragment } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'

import Address from 'components/address'
import OriginButton from 'components/origin-button'

import currencies from 'utils/currencies'

class TransactionCard extends Component {
  constructor(props) {
    super(props)

    this.handleCancel = this.handleCancel.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.state = {}
  }

  handleCancel() {
    this.props.onPress()
  }

  handleConfirm() {
    this.props.onPress()
  }

  render() {
    const {
      address = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
    } = this.props
    const paymentCurrencies = ['dai', 'eth']
    const gas = ((Math.random() / 10000) * 160).toFixed(5)
    let boost, heading, daiInvolved, ognInvolved, payment, paymentCurrency

    switch (this.props.transactionType) {
      case 'createListing':
        // To boost or not to boost, up to 100
        boost =
          0 && Math.floor(Math.random() * 2) * Math.ceil(Math.random() * 100)
        // Boolean coercion
        ognInvolved = !!boost
        heading = 'Create Listing'
        break
      case 'makeOffer':
        paymentCurrency =
          paymentCurrencies[
            Math.floor(Math.random() * paymentCurrencies.length)
          ]
        payment =
          paymentCurrency === 'eth'
            ? ((Math.random() / 1000) * 160).toFixed(5)
            : (Math.random() * 100).toFixed(2)
        daiInvolved = paymentCurrency === 'dai'
        heading = 'Purchase'
        break
      case 'publishIdentity':
        heading = 'Publish Identity'
        break
      default:
        heading = 'Blockchain Transaction'
    }

    // Can we convert all involved cryptocurrencies and derive a fiat-equivalent sum?
    const calculableTotal = !ognInvolved
    const gasInUSD = gas * currencies['eth'].priceToUSD
    const paymentInUSD = paymentCurrency
      ? payment * currencies[paymentCurrency].priceToUSD
      : 0
    const total = calculableTotal && `$${(gasInUSD + paymentInUSD).toFixed(2)}`

    return (
      <View style={styles.card}>
        <Text style={styles.heading}>{heading}</Text>
        {calculableTotal ? (
          <Fragment>
            <View style={styles.primaryContainer}>
              <Text style={[styles.amount, styles.primary]}>{total}</Text>
            </View>
            <View style={styles.lineItems}>
              {!!paymentInUSD && (
                <View style={styles.lineItem}>
                  <View>
                    <Text style={styles.label}>Payment</Text>
                  </View>
                  <View>
                    <Text
                      style={[styles.amount, styles.converted]}
                    >{`$${paymentInUSD.toFixed(2)}`}</Text>
                    <Text style={styles.amount}>
                      <Image
                        source={currencies[paymentCurrency].icon}
                        style={styles.icon}
                      />
                      {` ${payment} ${paymentCurrency.toUpperCase()}`}
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.lineItem}>
                <View>
                  <Text style={styles.label}>Gas Cost</Text>
                </View>
                <View>
                  <Text
                    style={[styles.amount, styles.converted]}
                  >{`$${gasInUSD.toFixed(2)}`}</Text>
                  <Text style={styles.amount}>
                    <Image
                      source={currencies['eth'].icon}
                      style={styles.icon}
                    />
                    {` ${gas} ETH`}
                  </Text>
                </View>
              </View>
            </View>
          </Fragment>
        ) : (
          <Fragment>
            <View style={styles.primaryContainer}>
              <Text style={[styles.amount, styles.primary]}>{gas} ETH</Text>
              <Text style={styles.label}>Gas Cost</Text>
            </View>
            <View style={styles.primaryContainer}>
              <Text style={[styles.amount, styles.primary]}>{boost} OGN</Text>
              <Text style={styles.label}>Boost</Text>
            </View>
          </Fragment>
        )}
        <View style={styles.accountSummary}>
          <View style={styles.accountText}>
            <Text style={styles.account}>Your Account: </Text>
            <Address address={address} style={styles.account} />
          </View>
          <View style={styles.accountText}>
            <Text style={styles.account}>
              {daiInvolved || ognInvolved ? 'Your Balances' : 'Your Balance'}:{' '}
            </Text>
            <Text style={styles.account}>
              {`${(Math.random() * 160).toFixed(5)} ETH`}
              {daiInvolved && ` ~ ${(Math.random() * 100).toFixed(2)} DAI`}
              {ognInvolved && ` ~ ${Math.ceil(Math.random() * 1000)} OGN`}
            </Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <OriginButton
            size="large"
            type="primary"
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={'Confirm'}
            onPress={this.handleConfirm}
          />
        </View>
        <TouchableOpacity onPress={this.handleCancel}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps)(TransactionCard)

const styles = StyleSheet.create({
  account: {
    color: '#94a7b5',
    fontFamily: 'Lato',
    fontSize: 11,
    textAlign: 'center'
  },
  accountSummary: {
    marginBottom: 20
  },
  accountText: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4
  },
  amount: {
    color: '#94a7b5',
    fontFamily: 'Lato',
    fontSize: 11,
    textAlign: 'right'
  },
  buttonContainer: {
    paddingBottom: 20
  },
  cancel: {
    color: '#1a82ff',
    fontFamily: 'Lato',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  converted: {
    color: '#0b1823',
    fontSize: 18,
    marginBottom: 4
  },
  heading: {
    color: '#0b1823',
    fontFamily: 'Lato',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center'
  },
  icon: {
    height: 8,
    width: 8
  },
  label: {
    color: '#94a7b5',
    fontFamily: 'Lato',
    fontSize: 18,
    textAlign: 'center'
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  lineItems: {
    backgroundColor: '#f7f8f8',
    borderColor: '#dde6ea',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    marginBottom: 20,
    marginLeft: -20,
    marginRight: -20,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingTop: 20
  },
  primary: {
    color: 'black',
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  primaryContainer: {
    paddingBottom: 20
  }
})
