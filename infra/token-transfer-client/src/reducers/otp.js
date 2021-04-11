import {
  VERIFY_OTP_PENDING,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_ERROR,
  SUBMIT_OTP_UPDATE_PENDING,
  SUBMIT_OTP_UPDATE_SUCCESS,
  SUBMIT_OTP_UPDATE_ERROR
} from '../actions/otp'

const initialState = {
  isVerifying: false,
  verifyError: null,
  isUpdating: false,
  updateError: null,
  otp: null
}

export default function otcReducer(state = initialState, action) {
  switch (action.type) {
    case VERIFY_OTP_PENDING:
      return {
        ...state,
        isVerifying: true
      }
    case VERIFY_OTP_SUCCESS:
      return {
        ...state,
        isVerifying: false,
        verifyError: null,
        otp: action.payload
      }
    case VERIFY_OTP_ERROR:
      return {
        ...state,
        isVerifying: false,
        verifyError: action.error,
        otp: null
      }
    case SUBMIT_OTP_UPDATE_PENDING:
      return {
        ...state,
        isUpdating: true
      }
    case SUBMIT_OTP_UPDATE_SUCCESS:
      return {
        ...state,
        isUpdating: false,
        updateError: null
      }
    case SUBMIT_OTP_UPDATE_ERROR:
      return {
        ...state,
        isUpdating: false,
        updateError: action.error
      }
    default:
      return state
  }
}

export const getVerifyError = state => state.verifyError
export const getIsVerifying = state => state.isVerifying
export const getUpdateError = state => state.updateError
export const getIsUpdating = state => state.isUpdating
export const getOtp = state => state.otp
