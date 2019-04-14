import get from 'lodash/get'

import MarketplaceContract from '@origin/contracts/build/contracts/V00_Marketplace'
import OriginTokenContract from '@origin/contracts/build/contracts/OriginToken'
import IdentityEventsContract from '@origin/contracts/build/contracts/IdentityEvents'

export default {
  provider: get(process.env, 'PROVIDER_URL', `http://services:8545`),
  providerWS: get(process.env, 'PROVIDER_WS_URL', `ws://services:8545`),
  ipfsGateway: get(process.env, 'IPFS_GATEWAY_URL', `http://ipfs-proxy:9999`),
  ipfsRPC: get(process.env, 'IPFS_API_URL', `http://ipfs-proxy:9999`),
  bridge: 'http://localhost:5000',
  growth: 'http://localhost:4001',
  discovery: 'http://localhost:4000/graphql',
  automine: 2000,
  OriginToken: get(OriginTokenContract, 'networks.999.address'),
  V00_Marketplace: get(MarketplaceContract, 'networks.999.address'),
  IdentityEvents: get(IdentityEventsContract, 'networks.999.address'),
  affiliate: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
  arbitrator: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
  messaging: {
    messagingNamespace: 'origin:docker',
    globalKeyServer: 'http://localhost:6647'
  }
}
