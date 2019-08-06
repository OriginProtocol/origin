import {
  ADD_ACCOUNT,
  FETCH_ACCOUNTS_PENDING,
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_ERROR
} from '../actions/account'

const initialState = {
  pending: false,
  accounts: [],
  error: null
}

export function accountsReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_ACCOUNT:
      return {
        ...state,
        accounts: [...state.accounts, action.payload]
      }
    case FETCH_ACCOUNTS_PENDING:
      return {
        ...state,
        pending: true
      }
    case FETCH_ACCOUNTS_SUCCESS:
      return {
        ...state,
        pending: false,
        accounts: action.payload
      }
    case FETCH_ACCOUNTS_ERROR:
      return {
        ...state,
        pending: false,
        error: action.error
      }
    default:
      return state
  }
}

export const getAccounts = state => state.accounts
export const getAccountsPending = state => state.pending
export const getAccountsError = state => state.error
