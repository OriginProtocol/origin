import {
  SUBMIT_OTC_REQUEST_PENDING,
  SUBMIT_OTC_REQUEST_SUCCESS,
  SUBMIT_OTC_REQUEST_ERROR
} from '../actions/otc'

const initialState = {
  isAdding: false,
  error: null
}

export default function otcReducer(state = initialState, action) {
  switch (action.type) {
    case SUBMIT_OTC_REQUEST_PENDING:
      return {
        ...state,
        isAdding: true
      }
    case SUBMIT_OTC_REQUEST_SUCCESS:
      return {
        ...state,
        isAdding: false,
        error: null
      }
    case SUBMIT_OTC_REQUEST_ERROR:
      return {
        ...state,
        isAdding: false,
        error: action.error
      }
    default:
      return state
  }
}

export const getError = state => state.error
export const getIsAdding = state => state.isAdding
