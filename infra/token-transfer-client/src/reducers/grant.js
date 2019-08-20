import moment from 'moment'

import { momentizeGrant } from '@origin/token-transfer-server/src/lib/vesting'

import { unlockDate } from '@/constants'

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
  const isLocked = moment.utc() < unlockDate
  const grantTotal = grants.reduce((total, currentGrant) => {
    return total + Number(currentGrant.amount)
  }, 0)
  const vestedTotal = grants.reduce((total, currentGrant) => {
    return isLocked ? 0 : total + Number(currentGrant.vestedAmount)
  }, 0)
  const unvestedTotal = grantTotal - vestedTotal
  return { grantTotal, vestedTotal, unvestedTotal }
}
