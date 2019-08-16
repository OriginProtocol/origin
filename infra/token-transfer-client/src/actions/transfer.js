import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

export const FETCH_TRANSFERS_PENDING = 'FETCH_TRANSFERS_PENDING'
export const FETCH_TRANSFERS_SUCCESS = 'FETCH_TRANSFERS_SUCCESS'
export const FETCH_TRANSFERS_ERROR = 'FETCH_TRANSFERS_ERROR'

function fetchTransfersPending() {
  return {
    type: FETCH_TRANSFERS_PENDING
  }
}

function fetchTransfersSuccess(payload) {
  return {
    type: FETCH_TRANSFERS_SUCCESS,
    payload
  }
}

function fetchTransfersError(error) {
  return {
    type: FETCH_TRANSFERS_ERROR,
    error
  }
}

export function fetchTransfers() {
  return dispatch => {
    dispatch(fetchTransfersPending())

    agent
      .get(`${apiUrl}/api/transfers`)
      .then(response => dispatch(fetchTransfersSuccess(response.body)))
      .catch(error => {
        dispatch(fetchTransfersError(error))
        throw error
      })
  }
}
