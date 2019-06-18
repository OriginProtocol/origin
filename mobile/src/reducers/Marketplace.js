'use strict'

import { MarketplaceConstants } from 'actions/Marketplace'

const initialState = {
  ready: false,
  error: false
}

export default function Marketplace(state = initialState, action = {}) {
  switch (action.type) {
    case MarketplaceConstants.SET_MARKETPLACE_READY:
      return {
        ...state,
        ready: action.ready
      }

    case MarketplaceConstants.SET_MARKETPLACE_WEBVIEW_ERROR:
      return {
        ...state,
        error: action.error
      }
  }

  return state
}
