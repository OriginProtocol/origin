import {
  calculateGranted,
  calculateVested,
  momentizeGrant
} from '@origin/token-transfer-server/src/shared'

import {
  FETCH_GRANTS_PENDING,
  FETCH_GRANTS_SUCCESS,
  FETCH_GRANTS_ERROR
} from '../actions/grant'

const initialState = {
  isLoading: true,
  grants: [],
  error: null
}

export default function grantsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_GRANTS_PENDING:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_GRANTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        grants: action.payload,
        error: null
      }
    case FETCH_GRANTS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    default:
      return state
  }
}

export const getGrants = state => state.grants.map(momentizeGrant)
export const getError = state => state.error
export const getIsLoading = state => state.isLoading
export const getTotals = state => {
  const grants = getGrants(state)
  const grantTotal = calculateGranted(grants)
  const vestedTotal = calculateVested(grants)
  const unvestedTotal = grantTotal.minus(vestedTotal)
  return { grantTotal, vestedTotal, unvestedTotal }
}
