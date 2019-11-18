import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

export const FETCH_GRANTS_PENDING = 'FETCH_GRANTS_PENDING'
export const FETCH_GRANTS_SUCCESS = 'FETCH_GRANTS_SUCCESS'
export const FETCH_GRANTS_ERROR = 'FETCH_GRANTS_ERROR'

function fetchGrantsPending() {
  return {
    type: FETCH_GRANTS_PENDING
  }
}

function fetchGrantsSuccess(payload) {
  return {
    type: FETCH_GRANTS_SUCCESS,
    payload
  }
}

function fetchGrantsError(error) {
  return {
    type: FETCH_GRANTS_ERROR,
    error
  }
}

export function fetchGrants() {
  return dispatch => {
    dispatch(fetchGrantsPending())

    agent
      .get(`${apiUrl}/api/grants`)
      .then(response => dispatch(fetchGrantsSuccess(response.body)))
      .catch(error => {
        dispatch(fetchGrantsError(error))
        if (error.status !== 401) {
          throw error
        }
      })
  }
}
