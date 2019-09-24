import Web3 from 'web3'

function removePrefix(v) {
  if (!v.startsWith('0x')) {
    return v
  }
  return v.slice(2)
}

function addPrefix(v) {
  if (v.startsWith('0x')) {
    return v
  }
  return `0x${v}`
}

function isHex(v) {
  v = removePrefix(v)
  return v.match(/^[A-Fa-f0-9]$/) !== null
}

/**
 * Normalize a value for comparison
 *
 * @param {string} the value to normalize
 * @throws {TypeError} when value isn't supported
 */
export default function normalize(v) {
  if (typeof v !== 'string') throw TypeError('Value not string')

  v = removePrefix(v)

  if (!isHex(v)) throw TypeError('Value is not hex')

  // Address
  if (v.length === 40) {
    return Web3.utils.toChecksumAddress(addPrefix(v))
  }

  return v.toLowerCase()
}

export function normalCompare(a, b) {
  return normalize(a) === normalize(b)
}
