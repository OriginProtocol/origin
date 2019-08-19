import {
  FETCH_USER_PENDING,
  FETCH_USER_SUCCESS,
  FETCH_USER_ERROR
} from '../actions/user'

const initialState = {
  isLoading: true,
  error: null,
  user: null
}

export default function Session(state = initialState, action) {
  switch (action.type) {
    case FETCH_USER_PENDING:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        error: null
      }
    case FETCH_USER_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    default:
      return state
  }
}
