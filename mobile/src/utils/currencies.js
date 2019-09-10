'use strict'

import { ethers } from 'ethers'
import * as RNLocalize from 'react-native-localize'
import get from 'lodash.get'

import MainnetContracts from '@origin/contracts/build/contracts_mainnet.json'
import RinkebyContracts from '@origin/contracts/build/contracts_rinkeby.json'
import OriginContracts from '@origin/contracts/build/contracts_origin.json'
import LocalContracts from '@origin/contracts/build/contracts.json'

import { CURRENCIES } from '../constants'
import { reverseMapping } from 'utils'

const IMAGES_PATH = '../../assets/images/'

// Build a map of contract addreses to contract name from the imported configs
// Values are arrays of the names of the contracts, which should have a length
// of one.
const CONTRACT_ADDRESSES = {
  ...reverseMapping(MainnetContracts),
  ...reverseMapping(RinkebyContracts),
  ...reverseMapping(OriginContracts),
  ...reverseMapping(LocalContracts ? LocalContracts : {})
}

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

/* Parse a GraphQL result to get a token balance.
 */
export function tokenBalanceFromGql(result) {
  const amount = get(result.data, 'web3.account.token.balance', 0)
  const decimals = get(result.data, 'web3.account.token.token.decimals', 0)
  if (amount === null || decimals === null) {
    return null
  }
  return Number(ethers.utils.formatUnits(amount, decimals))
}

/* Lookup a currency type based on its contract address.
 */
export function getCurrencyTypeFromAddress(address) {
  if (address === '0x0000000000000000000000000000000000000000') return 'eth'
  const contractAddresses = {}
  // Lowercase all the adddresses
  Object.entries(CONTRACT_ADDRESSES).forEach(([address, values]) => {
    contractAddresses[address.toLowerCase()] = values
  })
  const contractNames = contractAddresses[address.toLowerCase()]
  if (contractNames) {
    return contractNames[0].toLowerCase()
  }
}

/* Find the best available currency for the device based on the locality.
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
