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
    const tokenObj = currencies.data[tokenOrDecimals]

    if (!tokenObj) {
      // Fallback
      tokenDecimals = 18
    } else {
      tokenDecimals = parseInt(tokenObj.decimals)
    }
  }

  let [whole, frac] = amount.toString().split('.')
  frac = (frac || '').substr(0, tokenDecimals)

  if (frac.length == tokenDecimals) {
    return `${whole}${frac}`
  } else if (frac.length < tokenDecimals) {
    return `${whole}${frac.padEnd(tokenDecimals, '0')}`
  }

  // frac.length > tokenDecimals
  // This should never happen since we truncate the fractional part
  throw new Error('Failed to convert fixed value to big int')
}

export default getUnitTokenValue
