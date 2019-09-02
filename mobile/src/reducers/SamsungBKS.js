'use strict'

import { SamsungBKSConstants } from 'actions/SamsungBKS'

const initialState = {
  isUsed: false,
  isSupported: null,
  seedHash: null,
  error: null
}

export default function SamsungBKS(state = initialState, action = {}) {
  switch (action.type) {
    case SamsungBKSConstants.GET_SUPPORTED_SUCCESS:
      return {
        ...state,
        isSupported: action.payload,
        error: null
      }

    case SamsungBKSConstants.GET_SUPPORTED_ERROR:
      return {
        ...state,
        error: action.error
      }

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

    case SamsungBKSConstants.SET_IS_USED:
      return {
        ...state,
        isUsed: action.payload
      }
  }

  return state
}
