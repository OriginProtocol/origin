import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

export const FETCH_LOCKUPS_PENDING = 'FETCH_LOCKUPS_PENDING'
export const FETCH_LOCKUPS_SUCCESS = 'FETCH_LOCKUPS_SUCCESS'
export const FETCH_LOCKUPS_ERROR = 'FETCH_LOCKUPS_ERROR'

function fetchLockupsPending() {
  return {
    type: FETCH_LOCKUPS_PENDING
  }
}

function fetchLockupsSuccess(payload) {
  return {
    type: FETCH_LOCKUPS_SUCCESS,
    payload
  }
}

function fetchLockupsError(error) {
  return {
    type: FETCH_LOCKUPS_ERROR,
    error
  }
}

export function fetchLockups() {
  return dispatch => {
    dispatch(fetchLockupsPending())

    agent
      .get(`${apiUrl}/api/lockups`)
      .then(response => dispatch(fetchLockupsSuccess(response.body)))
      .catch(error => {
        dispatch(fetchLockupsError(error))
        throw error
      })
  }
}
