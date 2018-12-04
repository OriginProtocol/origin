const MAX_ADDRESS_LENGTH = 9

export default function truncateWithCenterEllipsis(fullStr = '', strLen) {
  if (fullStr.length <= MAX_ADDRESS_LENGTH) return fullStr;
  const separator = '...'
  const frontChars = 5
  const backChars = 4

  return fullStr.substr(0, frontChars)
    + separator
    + fullStr.substr(fullStr.length - backChars)
}

export function abbreviatedName(party) {
  const { profile = {}, fullName } = party
  const { firstName = '', lastName = ''} = profile
  const lastNameLetter = lastName.length && `${lastName.charAt(0)}.`

  return fullName && `${firstName} ${lastNameLetter}`
}
