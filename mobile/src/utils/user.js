'use strict'

import Web3 from 'web3'

const web3 = new Web3()
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

/**
 * Takes an Ethereum address and formats it for reliable comparison or display
 * e.g. 0x627306090abab3a6e1400e9345bc60c78a8bef57 becomes 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
 * @param {string} an Ethereum address in any case
 * @return {string} a case-specific address (currently checksum)
 * @throws {Error} if the input is not a valid Ethereum address
 */

export function formattedAddress(string) {
  return web3.utils.toChecksumAddress(string)
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

/* Determine the next onboarding step from the state of the onboarding store.
 *
 * This logic is abstracted here to avoid duplicating it. It is used by a HOC
 * (withOnboardingSteps) but it is also needed in Navigation.js to extend
 * a react-navigation navigator. The HOC is not compatible.
 */
export function getNextOnboardingStep(onboardingStore, settingsStore) {
  if (!onboardingStore.emailAttestation && !onboardingStore.emailVerified) {
    return 'Email'
  } else if (
    onboardingStore.phoneAttestation === null &&
    !onboardingStore.phoneVerified
  ) {
    return 'Phone'
  } else if (!onboardingStore.firstName || !onboardingStore.lastName) {
    return 'Name'
  } else if (onboardingStore.avatarUri === null) {
    return 'Avatar'
  } else if (!settingsStore.pin && !settingsStore.biometryType) {
    return 'Authentication'
  }
  return 'Ready'
}
