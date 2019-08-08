import agent from '../utils/agent'

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

    const apiUrl = process.env.PORTAL_API_URL || 'http://localhost:5000'
    agent
      .get(`${apiUrl}/api/grants`)
      .then(response => dispatch(fetchGrantsSuccess(response.body)))
      .catch(error => {
        dispatch(fetchGrantsError(error))
        throw error
      })
  }
}
