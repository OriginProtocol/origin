const MAX_ADDRESS_LENGTH = 10

export function abbreviateName(party, defaultName = '') {
  const { firstName = '', lastName = '', fullName } = party || {}
  const lastNameLetter = lastName.length ? `${lastName.charAt(0)}.` : ''
  const abbreviatedName = fullName && `${firstName} ${lastNameLetter}`

  return abbreviatedName || defaultName
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
