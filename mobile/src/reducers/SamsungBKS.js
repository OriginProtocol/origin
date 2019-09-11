'use strict'

import { SamsungBKSConstants } from 'actions/SamsungBKS'

const initialState = {
  enabled: null,
  seedHash: null,
  error: null
}

export default function SamsungBKS(state = initialState, action = {}) {
  switch (action.type) {
    case SamsungBKSConstants.GET_SEEDHASH_SUCCESS:
      return {
        ...state,
        seedHash: action.payload,
        error: null
      }

    case SamsungBKSConstants.GET_SEEDHASH_ERROR:
      return {
        ...state,
        error: action.error
      }

    case SamsungBKSConstants.SET_ENABLED:
      return {
        ...state,
        enabled: action.payload
      }
  }

  return state
}
