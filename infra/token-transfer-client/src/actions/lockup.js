import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

export const ADD_LOCKUP_PENDING = 'ADD_LOCKUP_PENDING'
export const ADD_LOCKUP_SUCCESS = 'ADD_LOCKUP_SUCCESS'
export const ADD_LOCKUP_ERROR = 'ADD_LOCKUP_ERROR'
export const FETCH_LOCKUPS_PENDING = 'FETCH_LOCKUPS_PENDING'
export const FETCH_LOCKUPS_SUCCESS = 'FETCH_LOCKUPS_SUCCESS'
export const FETCH_LOCKUPS_ERROR = 'FETCH_LOCKUPS_ERROR'

function addLockupPending() {
  return {
    type: ADD_LOCKUP_PENDING
  }
}

function addLockupSuccess(payload) {
  return {
    type: ADD_LOCKUP_SUCCESS,
    payload
  }
}

function addLockupError(error) {
  return {
    type: ADD_LOCKUP_ERROR,
    error
  }
}

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

export function addLockup(lockup) {
  return dispatch => {
    dispatch(addLockupPending())

    return agent
      .post(`${apiUrl}/api/lockups`)
      .send(lockup)
      .then(response => dispatch(addLockupSuccess(response.body)))
      .catch(error => {
        dispatch(addLockupError(error))
        throw error
      })
  }
}
