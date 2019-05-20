'use strict'

import React, { Component, Fragment } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import Web3 from 'web3'
import { fbt } from 'fbt-runtime'

import Address from 'components/address'
import OriginButton from 'components/origin-button'
import currencies from 'utils/currencies'
import { decodeTransaction } from '../utils/contractDecoder'

const web3 = new Web3()

class TransactionCard extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { msgData, wallet } = this.props
    const { functionName, parameters } = decodeTransaction(msgData.data.data)
    const { _commission, _currency, _value } = parameters
    const balances = wallet.accountBalance
    const gasWei = web3.utils
      .toBN(msgData.data.gasPrice)
      .mul(web3.utils.toBN(msgData.data.gasLimit))
    const gas = web3.utils.fromWei(gasWei.toString(), 'ether')

    let boost,
      heading,
      daiInvolved,
      ognInvolved,
      payment,
      paymentCurrency,
      daiRequired = 0,
      ethRequired = Number(gas)
    switch (functionName) {
      case 'createListing':
        heading = fbt('Create Listing', 'TransactionCard.headingCreate')
        // To boost or not to boost, up to 100
        boost = 0
        // Boolean coercion
        ognInvolved = !!boost
        break
      case 'makeOffer':
        heading = fbt('Purchase', 'TransactionCard.headingPurchase')
        payment = web3.utils.fromWei(_value)
        // TODO: handle this detection better, this will only work while there
        // is a single alternate payment currency
        if (_currency === '0x0000000000000000000000000000000000000000') {
          paymentCurrency = 'eth'
          ethRequired += Number(payment)
        } else {
          paymentCurrency = 'dai'
          daiRequired += Number(payment)
        }
        ognInvolved = parseInt(_commission) > 0
        daiInvolved = paymentCurrency === 'dai'
        break
      case 'emitIdentityUpdated':
        heading = fbt(
          'Publish Identity',
          'TransactionCard.headingPublishIdentity'
        )
        break
      case 'approve':
        heading = fbt(
          'Approve Currency Conversion',
          'TransactionCard.headingApprove'
        )
        break
      default:
        heading = fbt('Blockchain Transaction', 'TransactionCard.default')
    }

    const calculableTotal = true
    const gasInUSD = gas * currencies['eth'].priceToUSD
    const paymentInUSD = paymentCurrency
      ? payment * currencies[paymentCurrency].priceToUSD
      : 0
    const total = calculableTotal && `$${(gasInUSD + paymentInUSD).toFixed(2)}`
    const hasSufficientDai = daiRequired <= Number(balances['dai'] || 0)
    const hasSufficientEth = ethRequired <= Number(balances['eth'] || 0)

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
                    <Text style={styles.label}>
                      <fbt desc="TransactionCard.payment">Payment</fbt>
                    </Text>
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
                  <Text style={styles.label}>
                    <fbt desc="TransactionCard.gasCost">Gas Cost</fbt>
                  </Text>
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
                    {` ${Number(gas).toFixed(5)} ETH`}
                  </Text>
                </View>
              </View>
            </View>
          </Fragment>
        ) : (
          <Fragment>
            <View style={styles.primaryContainer}>
              <Text style={[styles.amount, styles.primary]}>
                {Number(gas).toFixed(5)} ETH
              </Text>
              <Text style={styles.label}>
                <fbt desc="TransactionCard.gasCost">Gas Cost</fbt>
              </Text>
            </View>
            <View style={styles.primaryContainer}>
              <Text style={[styles.amount, styles.primary]}>{boost} OGN</Text>
              <Text style={styles.label}>
                <fbt desc="TransactionCard.boost">Boost</fbt>
              </Text>
            </View>
          </Fragment>
        )}
        <View style={styles.accountSummary}>
          <View style={styles.accountText}>
            <Text style={styles.account}>
              <fbt desc="TransactionCard.accountText">Your Account</fbt>
              {`: `}
            </Text>
            <Address
              address={wallet.accounts[0].address}
              style={styles.account}
            />
          </View>
          <View style={styles.accountText}>
            <Text style={styles.account}>
              {daiInvolved || ognInvolved
                ? fbt('Your Balances', 'TransactionCard.balances')
                : fbt('Your Balance', 'TransactionCard.balance')}
              :{' '}
            </Text>
            <Text style={styles.account}>
              {Number(balances['eth']).toFixed(5)} ETH
              {daiInvolved && `${Number(balances['dai']).toFixed(2)} DAI`}
              {ognInvolved && `${balances['ogn']} OGN`}
            </Text>
          </View>
          <View style={styles.accountText}>
            {!hasSufficientDai && (
              <Text style={styles.danger}>
                <fbt desc="TransactionCard.insufficientGeneral">
                  You don't have enough ETH to submit this transaction.
                </fbt>
              </Text>
            )}
          </View>
          <View style={styles.accountText}>
            {!hasSufficientEth && (
              <Text style={styles.danger}>
                {functionName === 'emitIdentityUpdated' && (
                  <fbt desc="TransactionCard.insufficientIdentity">
                    You don't have enough ETH to publish your identity.
                  </fbt>
                )}
                {functionName !== 'emitIdentityUpdated' && (
                  <fbt desc="TransactionCard.insufficientGeneral">
                    You don't have enough ETH to submit this transaction.
                  </fbt>
                )}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <OriginButton
            size="large"
            type="primary"
            textStyle={{ fontSize: 18, fontWeight: '900' }}
            title={fbt('Confirm', 'TransactionCard.button')}
            disabled={!hasSufficientDai || !hasSufficientEth}
            onPress={this.props.onConfirm}
          />
        </View>
        <TouchableOpacity onPress={this.props.onRequestClose}>
          <Text style={styles.cancel}>
            <fbt desc="TransactionCard.cancel">Cancel</fbt>
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapStateToProps = ({ wallet }) => {
  return { wallet }
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
  danger: {
    color: 'red',
    fontFamily: 'Lato',
    fontSize: 11,
    textAlign: 'center'
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
