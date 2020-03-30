import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

export const FETCH_CONFIG_PENDING = 'FETCH_CONFIG_PENDING'
export const FETCH_CONFIG_SUCCESS = 'FETCH_CONFIG_SUCCESS'
export const FETCH_CONFIG_ERROR = 'FETCH_CONFIG_ERROR'

function fetchConfigPending() {
  return {
    type: FETCH_CONFIG_PENDING
  }
}

function fetchConfigSuccess(payload) {
  return {
    type: FETCH_CONFIG_SUCCESS,
    payload
  }
}

function fetchConfigError(error) {
  return {
    type: FETCH_CONFIG_ERROR,
    error
  }
}

export function fetchConfig() {
  return dispatch => {
    dispatch(fetchConfigPending())

    agent
      .get(`${apiUrl}/api/config`)
      .then(response => dispatch(fetchConfigSuccess(response.body)))
      .catch(error => {
        dispatch(fetchConfigError(error))
        throw error
      })
  }
}
