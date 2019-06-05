'use strict'

import keyMirror from 'utils/keyMirror'

export const MarketplaceConstants = keyMirror(
  {
    SET_MARKETPLACE_READY: null
  },
  'MARKETPLACE'
)

export function setMarketplaceReady(ready) {
  return {
    type: MarketplaceConstants.SET_MARKETPLACE_READY,
    ready
  }
}
