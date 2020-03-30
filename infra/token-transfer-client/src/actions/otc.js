import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

export const SUBMIT_OTC_REQUEST_PENDING = 'SUBMIT_OTC_REQUEST_PENDING'
export const SUBMIT_OTC_REQUEST_SUCCESS = 'SUBMIT_OTC_REQUEST_SUCCESS'
export const SUBMIT_OTC_REQUEST_ERROR = 'SUBMIT_OTC_REQUEST_ERROR'

function submitOtcRequestPending() {
  return {
    type: SUBMIT_OTC_REQUEST_PENDING
  }
}

function submitOtcRequestSuccess() {
  return {
    type: SUBMIT_OTC_REQUEST_SUCCESS
  }
}

function submitOtcRequestError(error) {
  return {
    type: SUBMIT_OTC_REQUEST_ERROR,
    error
  }
}

export function submitOtcRequest(lockup) {
  return dispatch => {
    dispatch(submitOtcRequestPending())

    return agent
      .post(`${apiUrl}/api/otc`)
      .send(lockup)
      .then(() => dispatch(submitOtcRequestSuccess()))
      .catch(error => {
        dispatch(submitOtcRequestError(error))
        throw error
      })
  }
}
