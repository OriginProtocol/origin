import {
  ADD_ACCOUNT_PENDING,
  ADD_ACCOUNT_SUCCESS,
  ADD_ACCOUNT_ERROR,
  FETCH_ACCOUNTS_PENDING,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_ERROR
} from '../actions/account'

const initialState = {
  isAdding: false,
  isFetching: false,
  accounts: [],
  error: null
}

export default function accountsReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_ACCOUNT_PENDING:
      return {
        ...state,
        isAdding: true
      }
    case ADD_ACCOUNT_SUCCESS:
      return {
        ...state,
        isAdding: false,
        accounts: [...state.accounts, action.payload],
        error: null
      }
    case ADD_ACCOUNT_ERROR:
      return {
        ...state,
        isAdding: false,
        error: action.error
      }
    case FETCH_ACCOUNTS_PENDING:
      return {
        ...state,
        isFetching: true
      }
    case FETCH_ACCOUNTS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        accounts: action.payload,
        error: null
      }
    case FETCH_ACCOUNTS_ERROR:
      return {
        ...state,
        isFetching: false,
        error: action.error
      }
    default:
      return state
  }
}
