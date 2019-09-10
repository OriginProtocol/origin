'use strict'

import { SamsungBKSConstants } from 'actions/SamsungBKS'

const initialState = {
  seedHash: '',
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
  }

  return state
}
