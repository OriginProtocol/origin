'use strict'

const Web3 = require('web3')
const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545')
const dictionary = require('./dictionary')

function generateAirbnbCode(ethAddress, userId) {
  const hashCode = web3.utils.sha3(ethAddress + userId).substr(-7)
  return Array.prototype.map
    .call(hashCode, i => dictionary[i.charCodeAt(0)])
    .join(' ')
}

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000)
}

function getAbsoluteUrl(relativeUrl, dappRedirectUrl = null) {
  const protocol = process.env.HTTPS ? 'https' : 'http'
  let url = protocol + '://' + process.env.HOST + relativeUrl
  if (dappRedirectUrl) {
    url += '?dappRedirectUrl=' + dappRedirectUrl
  }
  return url
}

function mapObjectToQueryParams(obj) {
  return Object.keys(obj)
    .map(key => key + '=' + obj[key])
    .join('&')
}

module.exports = {
  generateAirbnbCode,
  generateSixDigitCode,
  getAbsoluteUrl,
  mapObjectToQueryParams
}
