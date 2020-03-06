require('dotenv').config()

const fetch = require('node-fetch')
const memoize = require('lodash/memoize')
const { PROVIDER, NETWORK_ID } = require('./utils/const')

const Defaults = {
  '999': {
    ipfsGateway: 'http://localhost:8080',
    ipfsApi: 'http://localhost:5002',
    provider: 'ws://localhost:8545'
  },
  '4': {
    ipfsGateway: 'https://ipfs.staging.originprotocol.com',
    ipfsApi: 'https://ipfs.staging.originprotocol.com',
    marketplace: '0x3d608cce08819351ada81fc1550841ebc10686fd',
    fetchPastLogs: true
  },
  '1': {
    ipfsGateway: 'https://ipfs.originprotocol.com',
    ipfsApi: 'https://ipfs.originprotocol.com',
    marketplace: '0x698ff47b84837d3971118a369c570172ee7e54c2',
    fetchPastLogs: true
  }
}

const getSiteConfig = memoize(async function getSiteConfig(
  dataURL,
  netId = NETWORK_ID
) {
  let data
  if (dataURL) {
    const url = `${dataURL}config.json`
    console.debug(`Loading config from ${url}`)
    const dataRaw = await fetch(url)
    data = await dataRaw.json()
  } else {
    console.warn('dataURL not provided')
  }
  const defaultData = Defaults[netId] || {}
  const networkData = data ? data.networks[netId] : null || {}
  const siteConfig = {
    provider: PROVIDER,
    ...data,
    ...defaultData,
    ...networkData
  }
  return siteConfig
})

module.exports = {
  getSiteConfig,
  provider: PROVIDER
}
