'use strict'

import keyMirror from 'utils/keyMirror'

export const MarketplaceConstants = keyMirror(
  {
    SET_MARKETPLACE_READY: null,
    SET_MARKETPLACE_WEBVIEW_ERROR: null
  },
  'MARKETPLACE'
)

export function setMarketplaceReady(ready) {
  return {
    type: MarketplaceConstants.SET_MARKETPLACE_READY,
    ready
  }
}

export function setMarketplaceWebViewError(error) {
  return {
    type: MarketplaceConstants.SET_MARKETPLACE_WEBVIEW_ERROR,
    error
  }
}
