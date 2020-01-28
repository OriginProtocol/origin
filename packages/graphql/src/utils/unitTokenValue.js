import memoize from 'lodash/memoize'
import contracts from '../contracts'
import currencies from './currencies'

/**
 * Get the ether unit that has a certain number of decimals
 * 
 * Ref: https://web3js.readthedocs.io/en/v1.2.0/web3-utils.html#id88
 * 
 * @param {Number} decimals number of decimals
 * 
 * @returns {String} the ether unit that has `decimals` decimals
 */
const getUnitWithDecimals = memoize(decimals => {
  const web3 = contracts.web3

  const unit = Object.keys(web3.utils.unitMap)
    .find(unit => {
      const valueInWei = web3.utils.unitMap[unit]
      
      const zeroCount = valueInWei.length - valueInWei.replace(/0/g, '').length

      return zeroCount === decimals
    })

  return unit
})

/**
 * Truncates the big numbers upto `n` decimals
 * 
 * @param {String} numStr The big number as string
 * @param {Number} decimals Number of decimals to truncate to
 * 
 * @return {String} truncated number as string
 */
function removeExtraDecimals(numStr, decimals) {
  return numStr.replace(new RegExp(`^([0-9]+\.[0-9]{${decimals || 18}}).*`), '$1')
}

/**
 * Takes in a token value with decimals and returns the token's value
 * with the smallest unit possible without any decimals
 * 
 * @param {String} amount The token value with decimals
 * @param {String|Number} token The token ID or the number of decimals
 * 
 * @returns {String} `amount` represented in smallest unit of `token`
 */
function getUnitTokenValue(amount, tokenOrDecimals) {
  const web3 = contracts.web3

  let tokenDecimals = tokenOrDecimals

  if (typeof decimals === 'string') {
    const tokenObj = currencies.data[token]
  
    if (!tokenObj) {
      // Fallback
      return web3.utils.toWei(removeExtraDecimals(amount, 18), 'ether')
    }

    tokenDecimals = tokenObj.decimals
  }

  const targetWei = removeExtraDecimals(amount, tokenDecimals)

  const targetUnit = getUnitWithDecimals(tokenDecimals)

  const targetValue = web3.utils.toBN(
    web3.utils.toWei(targetWei, targetUnit)
  )

  return targetValue
}

export default getUnitTokenValue