'use strict'

import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { fbt } from 'fbt-runtime'

import { decodeTransaction } from '../utils/contractDecoder'
import { findBestAvailableCurrency } from 'utils/currencies'
import Address from 'components/address'
import OriginButton from 'components/origin-button'
import currencies from 'utils/currencies'
import CommonStyles from 'styles/common'
import CardStyles from 'styles/card'

const TransactionCard = props => {
  const { msgData, wallet, loading } = props
  let { functionName, contractName, parameters } = decodeTransaction(
    msgData.data.data
  )
  if (contractName === 'IdentityProxyContract' && functionName === 'execute') {
    // Transaction is proxied, extract the original transaction by decoding the
    // _data parameter
    /* eslint-disable-next-line no-extra-semi */
    ;({ functionName, contractName, parameters } = decodeTransaction(
      parameters._data
    ))
  }

  const fiatCurrency =
    props.settings.currency || findBestAvailableCurrency()

  console.debug(`Contract: ${contractName}, Function: ${functionName}`)
  console.debug(parameters)

  // Calculate gas in wei
  const gasWei = global.web3.utils
    .toBN(msgData.data.gasPrice)
    .mul(global.web3.utils.toBN(msgData.data.gas))

  // Convert gas price to ether
  const gas = global.web3.utils.fromWei(gasWei.toString(), 'ether')
  const ethExchangeRate = props.exchangeRates[`${fiatCurrency[1]}/ETH`].rate
  const daiExchangeRate = props.exchangeRates[`${fiatCurrency[1]}/DAI`].rate
  const balances = wallet.accountBalance

  let heading,
    boost,
    payment = 0,
    paymentCurrency,
    daiRequired = 0,
    ethRequired = Number(gas),
    ognRequired = 0

  switch (functionName) {
    case 'createListing':
      heading = fbt('Create Listing', 'TransactionCard.headingCreate')
      boost = 0
      break
    case 'makeOffer':
      heading = fbt('Purchase', 'TransactionCard.headingPurchase')
      payment = global.web3.utils.fromWei(parameters._value)
      // TODO: handle this detection better, this will only work while there
      // is a single alternate payment currency
      if (
        parameters._currency === '0x0000000000000000000000000000000000000000'
      ) {
        paymentCurrency = 'eth'
        ethRequired += Number(payment)
      } else {
        paymentCurrency = 'dai'
        daiRequired += Number(payment)
      }
      ognRequired = parseInt(parameters._commission)
      break
    case 'swapAndMakeOffer':
      heading = fbt('Purchase', 'TransactionCard.headingPurchase')
      payment =
        global.web3.utils.fromWei(parameters._value.toString()) /
        ethExchangeRate
      paymentCurrency = 'eth'
      ethRequired += Number(payment)
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
    case 'createProxyWithSenderNonce':
      heading = fbt(
        'Enable Meta Transactions',
        'TransactionCard.createProxyHeading'
      )
      break
    default:
      heading = fbt('Blockchain Transaction', 'TransactionCard.default')
  }

  const calculableTotal = !ognRequired > 0
  const gasFiatPrice = gas * ethExchangeRate
  const paymentFiatPrice =
    paymentCurrency === 'eth'
      ? payment * ethExchangeRate
      : payment * daiExchangeRate

  const total =
    calculableTotal &&
    `${fiatCurrency[2]}${(gasFiatPrice + paymentFiatPrice).toFixed(2)}`

  const hasSufficientDai = daiRequired <= Number(balances['dai'] || 0)
  const hasSufficientEth = ethRequired <= Number(balances['eth'] || 0)
  // const hasSufficientOgn = ognRequired <= Number(balances['ogn'] || 0)

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeading}>{heading}</Text>
      {calculableTotal ? (
        <>
          <View style={styles.primaryContainer}>
            <Text style={[styles.amount, styles.primary]}>{total}</Text>
          </View>
          <View style={styles.lineItems}>
            {!!paymentFiatPrice && (
              <View style={styles.lineItem}>
                <View>
                  <Text style={styles.label}>
                    <fbt desc="TransactionCard.payment">Payment</fbt>
                  </Text>
                </View>
                <View>
                  <Text style={[styles.amount, styles.converted]}>{`${
                    fiatCurrency[2]
                  }${paymentFiatPrice.toFixed(2)}`}</Text>
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
                <Text style={[styles.amount, styles.converted]}>{`${
                  fiatCurrency[2]
                }${gasFiatPrice.toFixed(2)}`}</Text>
                <Text style={styles.amount}>
                  <Image source={currencies['eth'].icon} style={styles.icon} />
                  {` ${Number(gas).toFixed(5)} ETH`}
                </Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
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
        </>
      )}
      <View style={styles.accountSummary}>
        <View style={styles.accountText}>
          <Text style={styles.account}>
            <fbt desc="TransactionCard.accountText">Your Account</fbt>
            {`: `}
          </Text>
          <Address
            address={wallet.activeAccount.address}
            styles={styles.account}
          />
        </View>
        <View style={styles.accountText}>
          <Text style={styles.account}>
            {daiRequired > 0 || ognRequired > 0
              ? fbt('Your Balances', 'TransactionCard.balances')
              : fbt('Your Balance', 'TransactionCard.balance')}
            :{' '}
          </Text>
          <Text style={styles.account}>
            {Number(balances['eth']).toFixed(5)} ETH{' '}
          </Text>
          {daiRequired > 0 && (
            <Text style={styles.account}>
              {Number(balances['dai']).toFixed(2)} DAI{' '}
            </Text>
          )}
          {ognRequired > 0 && (
            <Text style={styles.account}>{balances['ogn']} OGN</Text>
          )}
        </View>
        <View style={styles.accountText}>
          {!hasSufficientDai && (
            <Text style={styles.danger}>
              <fbt desc="TransactionCard.insufficientGeneral">
                You don&apos;t have enough ETH to submit this transaction.
              </fbt>
            </Text>
          )}
        </View>
        <View style={styles.accountText}>
          {!hasSufficientEth && (
            <Text style={styles.danger}>
              {functionName === 'emitIdentityUpdated' && (
                <fbt desc="TransactionCard.insufficientIdentity">
                  You don&apos;t have enough ETH to publish your identity.
                </fbt>
              )}
              {functionName !== 'emitIdentityUpdated' && (
                <fbt desc="TransactionCard.insufficientGeneral">
                  You don&apos;t have enough ETH to submit this transaction.
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
          title={fbt('Confirm', 'TransactionCard.button')}
          disabled={!hasSufficientDai || !hasSufficientEth || loading}
          onPress={props.onConfirm}
          loading={loading}
        />
      </View>
      <TouchableOpacity onPress={props.onRequestClose}>
        <Text style={styles.cardCancelText}>
          <fbt desc="TransactionCard.cancel">Cancel</fbt>
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const mapStateToProps = ({ exchangeRates, settings, wallet }) => {
  return { exchangeRates, settings, wallet }
}

export default connect(mapStateToProps)(TransactionCard)

const styles = StyleSheet.create({
  ...CommonStyles,
  ...CardStyles,
  account: {
    color: '#94a7b5',
    fontFamily: 'Lato',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600'
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
