import {
  FETCH_GRANTS_PENDING,
  FETCH_GRANTS_SUCCESS,
  FETCH_GRANTS_ERROR
} from '../actions/grant'

const initialState = {
  isFetching: false,
  grants: [],
  error: null
}

export default function grantsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_GRANTS_PENDING:
      return {
        ...state,
        isFetching: true
      }
    case FETCH_GRANTS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        grants: action.payload,
        error: null
      }
    case FETCH_GRANTS_ERROR:
      return {
        ...state,
        isFetching: false,
        error: action.error
      }
    default:
      return state
  }
}
