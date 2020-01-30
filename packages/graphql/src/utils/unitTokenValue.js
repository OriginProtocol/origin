import currencies from './currencies'

/**
 * Converts a fixed value to big int string
 *
 * @param {String} amount The token value with decimals
 * @param {String|Number} token The token ID or the number of decimals
 *
 * @returns {String} `amount` represented in smallest unit of `token`
 */
function getUnitTokenValue(amount, tokenOrDecimals) {
  let tokenDecimals = tokenOrDecimals

  if (typeof tokenOrDecimals === 'string') {
    if (tokenOrDecimals.startsWith('fiat-')) {
      // Exclude FIAT
      return amount
    }

    const tokenObj = currencies.data[tokenOrDecimals]

    if (tokenObj && !Number.isNaN(tokenObj.decimals)) {
      tokenDecimals = parseInt(tokenObj.decimals)
    } else if (!tokenObj) {
      // Fallback
      tokenDecimals = 18
    }
  }

  const [whole, _frac] = amount.toString().split('.')
  const frac = (_frac || '').substr(0, tokenDecimals)

  if (frac.length === tokenDecimals) {
    return `${whole}${frac}`
  } else if (frac.length < tokenDecimals) {
    return `${whole}${frac.padEnd(tokenDecimals, '0')}`
  }

  // frac.length > tokenDecimals
  // This should never happen since we truncate the fractional part
  throw new Error('Failed to convert fixed value to big int')
}

export default getUnitTokenValue
