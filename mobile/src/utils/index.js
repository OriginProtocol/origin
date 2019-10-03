'use strict'

import { Platform } from 'react-native'
import RNSamsungBKS from 'react-native-samsung-bks'

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function abbreviateName(party, defaultName = '') {
  const { profile = {}, fullName } = party
  const { firstName = '', lastName = '' } = profile
  const lastNameLetter = lastName.length ? `${lastName.charAt(0)}.` : ''
  const abbreviatedName = fullName && `${firstName} ${lastNameLetter}`

  return abbreviatedName || defaultName
}

/* Split an Ethereum address into two separate strings.
 */
export function evenlySplitAddress(address = '') {
  const { length } = address
  const middle = length / 2

  return [address.slice(0, middle), address.slice(middle)]
}

/* Truncate an Ethereum address to a maximum length and add an ellipsis
 * in the middle so the start and the last characters of the address can be
 * seen.
 */
export function truncateAddress(address = '', chars = 5) {
  const MAX_ADDRESS_LENGTH = 10

  if (address.length <= MAX_ADDRESS_LENGTH) return address

  let separator = '...'

  if (chars > address.length) {
    separator = ''
  }

  return (
    address.substr(0, chars) +
    separator +
    address.substr(address.length - chars)
  )
}

/* Truncate a string and add an ellipsis suffix.
 */
export function truncate(data, chars = 5) {
  if (chars && data.length <= chars) return data
  return data.substr(0, chars) + '...'
}

/* Return HD deriviation path for an account with an index. The derivation path
 * uses the BIP44 deriviation specification.
 */
export function generateHdPath(index) {
  return `m/44'/60'/0'/0/${index}`
}

/* Determines if a transaction is a valid meta transaction fomr the decoded
 * transaction data. This only checks the function name.
 *
 * TODO: add contract address validation
 */
export function isValidMetaTransaction(data) {
  const validFunctions = [
    'acceptOffer',
    'addData',
    'createListing',
    'createProxyWithSenderNonce',
    'emitIdentityUpdated',
    'finalize',
    'makeOffer',
    'marketplaceFinalizeAndPay',
    'transferTokenMarketplaceExecute',
    'updateListing',
    'withdrawListing',
    'withdrawOffer'
  ]
  return validFunctions.includes(data.functionName)
}

/* Change an object to values -> keys
 */
export const reverseMapping = o =>
  Object.keys(o).reduce(
    (r, k) => Object.assign(r, { [o[k]]: (r[o[k]] || []).concat(k) }),
    {}
  )

export const canUseSamsungBKS = async wallet => {
  if (!__DEV__) {
    // Cannot use BKS if not in dev mode because we don't have SCW_APP_ID
    return false
  } else if (Platform.OS === 'ios') {
    // Android only
    return false
  } else if (wallet.accounts.length > 0) {
    // Cant use BKS if there are already accounts
    return false
  }
  return await RNSamsungBKS.isSupported()
}
