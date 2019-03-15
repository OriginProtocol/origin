'use strict'

const Web3 = require('web3')
const dictionary = require('./dictionary')

function generateAirbnbCode(ethAddress, userId) {
  const hashCode = Web3.utils.sha3(ethAddress + userId).substr(-7)
  return Array.prototype.map
    .call(hashCode, i => dictionary[i.charCodeAt(0)])
    .join(' ')
}

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000)
}

function getAbsoluteUrl(relativeUrl, dappRedirectUrl = null) {
  const protocol = process.env.HTTPS ? 'https' : 'http'
  const host = process.env.HOST ? process.env.HOST : 'localhost:5000'
  let url = `${protocol}://${host}${relativeUrl}`
  if (dappRedirectUrl) {
    url += '?dappRedirectUrl=' + dappRedirectUrl
  }
  return url
}

module.exports = {
  generateAirbnbCode,
  generateSixDigitCode,
  getAbsoluteUrl
}
