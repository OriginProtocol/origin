import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

export const FETCH_USER_PENDING = 'FETCH_USER_PENDING'
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS'
export const FETCH_USER_ERROR = 'FETCH_USER_ERROR'

function fetchUserPending() {
  return {
    type: FETCH_USER_PENDING
  }
}

function fetchUserSuccess(payload) {
  return {
    type: FETCH_USER_SUCCESS,
    payload
  }
}

function fetchUserError(error) {
  return {
    type: FETCH_USER_ERROR,
    error
  }
}

export function fetchUser() {
  return dispatch => {
    dispatch(fetchUserPending())

    agent
      .get(`${apiUrl}/api/user`)
      .then(response => dispatch(fetchUserSuccess(response.body)))
      .catch(error => {
        dispatch(fetchUserError(error))
        throw error
      })
  }
}
