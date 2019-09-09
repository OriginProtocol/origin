'use strict'

import { ethers } from 'ethers'
import * as RNLocalize from 'react-native-localize'
import get from 'lodash.get'

import { CURRENCIES } from '../constants'

const IMAGES_PATH = '../../assets/images/'

/* The supported cryptocurrencies
 */
export default {
  dai: {
    color: '#fec100',
    icon: require(`${IMAGES_PATH}dai-icon.png`),
    name: 'Maker Dai'
  },
  eth: {
    color: '#a27cff',
    icon: require(`${IMAGES_PATH}eth-icon.png`),
    name: 'Ethereum'
  },
  ogn: {
    color: '#007fff',
    icon: require(`${IMAGES_PATH}ogn-icon.png`),
    name: 'Origin Token'
  }
}

/* TODO
 *
 */
export function tokenBalanceFromGql(result) {
  const amount = get(result.data, 'web3.account.token.balance', 0)
  const decimals = get(result.data, 'web3.account.token.token.decimals', 0)
  if (amount === null || decimals === null) {
    return null
  }
  return Number(ethers.utils.formatUnits(amount, decimals))
}

/* TODO
 *
 */
export function findBestAvailableCurrency() {
  const supportedCurrencyCodes = CURRENCIES.map(currency => currency.code)
  const preferredCurrencyCodes = RNLocalize.getCurrencies().filter(code =>
    supportedCurrencyCodes.includes(code)
  )
  const currencyCode = preferredCurrencyCodes.length
    ? preferredCurrencyCodes[0]
    : 'USD'
  return CURRENCIES.find(currency => currency.code === currencyCode)
}
