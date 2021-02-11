import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

export const VERIFY_OTP_PENDING = 'VERIFY_OTP_PENDING'
export const VERIFY_OTP_SUCCESS = 'VERIFY_OTP_SUCCESS'
export const VERIFY_OTP_ERROR = 'VERIFY_OTP_ERROR'
export const SUBMIT_OTP_UPDATE_PENDING = 'SUBMIT_OTP_UPDATE_PENDING'
export const SUBMIT_OTP_UPDATE_SUCCESS = 'SUBMIT_OTP_UPDATE_SUCCESS'
export const SUBMIT_OTP_UPDATE_ERROR = 'SUBMIT_OTP_UPDATE_ERROR'

function verifyOtpPending() {
  return {
    type: VERIFY_OTP_PENDING
  }
}

function verifyOtpSuccess(payload) {
  return {
    type: VERIFY_OTP_SUCCESS,
    payload
  }
}

function verifyOtpError(error) {
  return {
    type: VERIFY_OTP_ERROR,
    error
  }
}

function submitOtpUpdatePending() {
  return {
    type: SUBMIT_OTP_UPDATE_PENDING
  }
}

function submitOtpUpdateSuccess() {
  return {
    type: SUBMIT_OTP_UPDATE_SUCCESS
  }
}

function submitOtpUpdateError(error) {
  return {
    type: SUBMIT_OTP_UPDATE_ERROR,
    error
  }
}

export function verifyOtp(data) {
  return dispatch => {
    dispatch(verifyOtpPending())

    return agent
      .post(`${apiUrl}/api/user/otp`)
      .send(data)
      .then(response => dispatch(verifyOtpSuccess(response.body)))
      .catch(error => {
        dispatch(verifyOtpError(error))
        throw error
      })
  }
}

export function submitOtpUpdate(data) {
  return dispatch => {
    dispatch(submitOtpUpdatePending())

    return agent
      .post(`${apiUrl}/api/user/otp`)
      .send(data)
      .then(response => dispatch(submitOtpUpdateSuccess()))
      .catch(error => {
        dispatch(submitOtpUpdateError(error))
        throw error
      })
  }
}
