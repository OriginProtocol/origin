'use strict'

const MAX_ADDRESS_LENGTH = 10

export function abbreviateName(party, defaultName = '') {
  const { profile = {}, fullName } = party
  const { firstName = '', lastName = '' } = profile
  const lastNameLetter = lastName.length ? `${lastName.charAt(0)}.` : ''
  const abbreviatedName = fullName && `${firstName} ${lastNameLetter}`

  return abbreviatedName || defaultName
}

export function evenlySplitAddress(address = '') {
  const { length } = address
  const middle = length / 2

  return [address.slice(0, middle), address.slice(middle)]
}

export function truncateAddress(address = '', chars = 5) {
  if (address.length <= MAX_ADDRESS_LENGTH) return address
  const separator = '...'

  return (
    address.substr(0, chars) +
    separator +
    address.substr(address.length - chars)
  )
}

export function truncate(data, chars = 5) {
  if (chars && data.length <= chars) return data
  return data.substr(0, chars) + '...'
}

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
