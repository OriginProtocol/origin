import get from 'lodash/get'

const HOST = process.env.HOST || 'localhost'
const LINKER_HOST = process.env.LINKER_HOST || HOST

import MarketplaceContract from '@origin/contracts/build/contracts/V00_Marketplace'
import OriginTokenContract from '@origin/contracts/build/contracts/OriginToken'
import IdentityEventsContract from '@origin/contracts/build/contracts/IdentityEvents'

export default {
  provider: `http://${HOST}:8545`,
  providerWS: `ws://${HOST}:8545`,
  ipfsGateway: `http://${HOST}:8080`,
  ipfsRPC: `http://${HOST}:5002`,
  growth: `http://${HOST}:4001`,
  bridge: 'https://bridge.staging.originprotocol.com',
  automine: 2000,
  OriginToken: get(OriginTokenContract, 'networks.999.address'),
  V00_Marketplace: get(MarketplaceContract, 'networks.999.address'),
  IdentityEvents: get(IdentityEventsContract, 'networks.999.address'),
  affiliate: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
  attestationIssuer: '0x99C03fBb0C995ff1160133A8bd210D0E77bCD101',
  arbitrator: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
  linker: `http://${LINKER_HOST}:3008`,
  linkerWS: `ws://${LINKER_HOST}:3008`,
  messaging: {
    globalKeyServer: 'http://localhost:6647'
  }
}
