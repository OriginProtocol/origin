import {
  FETCH_TRANSFERS_PENDING,
  FETCH_TRANSFERS_SUCCESS,
  FETCH_TRANSFERS_ERROR
} from '../actions/transfer'

const initialState = {
  isAdding: false,
  isFetching: false,
  transfers: [],
  error: null
}

export default function transfersReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_TRANSFERS_PENDING:
      return {
        ...state,
        isFetching: true
      }
    case FETCH_TRANSFERS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        transfers: action.payload,
        error: null
      }
    case FETCH_TRANSFERS_ERROR:
      return {
        ...state,
        isFetching: false,
        error: action.error
      }
    default:
      return state
  }
}
