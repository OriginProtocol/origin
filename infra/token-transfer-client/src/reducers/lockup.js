import {
  calculateUnlockedEarnings,
  calculateEarnings,
  calculateLocked,
  calculateNextVestLocked,
  momentizeLockup
} from '@origin/token-transfer-server/src/shared'

import {
  ADD_LOCKUP_PENDING,
  ADD_LOCKUP_SUCCESS,
  ADD_LOCKUP_ERROR,
  CONFIRM_LOCKUP_PENDING,
  CONFIRM_LOCKUP_SUCCESS,
  CONFIRM_LOCKUP_ERROR,
  FETCH_LOCKUPS_PENDING,
  FETCH_LOCKUPS_SUCCESS,
  FETCH_LOCKUPS_ERROR
} from '../actions/lockup'

const initialState = {
  isAdding: false,
  isLoading: true,
  lockups: [],
  error: null
}

export default function lockupsReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_LOCKUP_PENDING:
      return {
        ...state,
        isAdding: true
      }
    case ADD_LOCKUP_SUCCESS:
      return {
        ...state,
        isAdding: false,
        lockups: [...state.lockups, action.payload],
        error: null
      }
    case ADD_LOCKUP_ERROR:
      return {
        ...state,
        isAdding: false,
        error: action.error
      }
    case CONFIRM_LOCKUP_PENDING:
      return {
        ...state,
        isConfirming: true
      }
    case CONFIRM_LOCKUP_SUCCESS:
      const index = state.lockups.findIndex(l => l.id == action.payload.id)
      return {
        ...state,
        isConfirming: false,
        lockups: [
          ...state.lockups.slice(0, index),
          action.payload,
          ...state.lockups.slice(index + 1)
        ]
      }
    case CONFIRM_LOCKUP_ERROR:
      return {
        ...state,
        isConfirming: false,
        error: action.error
      }
    case FETCH_LOCKUPS_PENDING:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_LOCKUPS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        lockups: action.payload,
        error: null
      }
    case FETCH_LOCKUPS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    default:
      return state
  }
}

export const getLockups = state => state.lockups.map(momentizeLockup)
export const getError = state => state.error
export const getIsLoading = state => state.isLoading
export const getIsAdding = state => state.isAdding
export const getTotals = state => {
  const lockups = getLockups(state)
  const unlockedEarnings = calculateUnlockedEarnings(lockups)
  const allEarnings = calculateEarnings(lockups)
  const locked = calculateLocked(lockups.filter(l => l.confirmed))
  const nextVestLocked = calculateNextVestLocked(
    lockups.filter(l => l.confirmed)
  )
  return { unlockedEarnings, allEarnings, locked, nextVestLocked }
}
