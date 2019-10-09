'use strict'

const Web3 = require('web3')

/**
 * Telegram Bot API allows command strings to be only 32 characters long
 * However, an hex address is 40-characters long
 *
 * So, we split the 40-characters address into 4 chunks of 10-characters hex strings
 * and encode them with base36 and pad the result to 8-characters
 *
 * JS doesn't work good with big numbers. And we don't need any kind of operation
 * on the big numbers. So, BigInt might not be necessary. That's the reason we
 * split it into 4 smaller chunks that do not exceed `Number.MAX_SAFE_INTEGER`
 *
 * The max value of each (10 hex character) chunks would be `ff ff ff ff ff` === `e13wu1of`.
 * So the base36 encoded value will never exceed 8 characters. Padding the result to
 * 8 digit makes it easier while decoding.
 *
 * Usage:
 * const address = '0x627306090abab3a6e1400e9345bc60c78a8bef57'
 * const b36Address =  encode(address)
 * > "5e8xz5saa8dlfxog0sran1b4axplbg47"
 * decode(b36Address)
 * > "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"
 */

module.exports.encode = content => {
  return (
    content
      // Split into four 10-character chunks
      .replace('0x', '')
      .match(/.{1,10}/g)
      // Encode to base36 and pad to 8 characters
      .map(x =>
        parseInt(x, 16)
          .toString(36)
          .padStart(8, '0')
      )
      // Join the chunks
      .join('')
  )
}

module.exports.decode = content => {
  const decodedAddress = content
    // Split into four 8-character chunks
    .match(/.{1,8}/g)
    // Encode to base16 and pad to 10 characters
    .map(x =>
      parseInt(x, 36)
        .toString(16)
        .padStart(10, '0')
    )
    // Join the chunks
    .join('')

  return Web3.utils.toChecksumAddress('0x' + decodedAddress)
}
