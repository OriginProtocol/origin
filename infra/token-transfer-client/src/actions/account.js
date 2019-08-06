import agent from '../utils/agent'

export const FETCH_ACCOUNTS_PENDING = 'FETCH_ACCOUNTS_PENDING'
export const FETCH_ACCOUNTS_SUCCESS = 'FETCH_ACCOUNTS_SUCCESS'
export const FETCH_ACCOUNTS_ERROR = 'FETCH_ACCOUNTS_ERROR'
export const ADD_ACCOUNT_PENDING = 'ADD_ACCOUNT_PENDING'
export const ADD_ACCOUNT_SUCCESS = 'ADD_ACCOUNT_SUCCESS'
export const ADD_ACCOUNT_ERROR = 'ADD_ACCOUNT_ERROR'
export const DELETE_ACCOUNT = 'DELETE_ACCOUNT'

function fetchAccountsPending() {
  return {
    type: FETCH_ACCOUNTS_PENDING
  }
}

function fetchAccountsSuccess(payload) {
  return {
    type: FETCH_ACCOUNTS_SUCCESS,
    payload
  }
}

function fetchAccountsError(error) {
  return {
    type: FETCH_ACCOUNTS_ERROR,
    error
  }
}

function addAccountPending() {
  return {
    type: ADD_ACCOUNT_PENDING
  }
}

function addAccountSuccess(payload) {
  return {
    type: ADD_ACCOUNT_SUCCESS,
    payload
  }
}

function addAccountError(error) {
  return {
    type: ADD_ACCOUNT_ERROR,
    error
  }
}

export function addAccount(account) {
  return dispatch => {
    dispatch(addAccountPending())

    const apiUrl = process.env.PORTAL_API_URL || 'http://localhost:5000'
    agent
      .post(`${apiUrl}/api/accounts`)
      .send(account)
      .then(response => dispatch(addAccountSuccess(response.body)))
      .catch(error => {
        dispatch(addAccountError(error))
        throw error
      })
  }
}

export function fetchAccounts() {
  return dispatch => {
    dispatch(fetchAccountsPending())

    const apiUrl = process.env.PORTAL_API_URL || 'http://localhost:5000'
    agent
      .get(`${apiUrl}/api/accounts`)
      .then(response => dispatch(fetchAccountsSuccess(response.body)))
      .catch(error => {
        dispatch(fetchAccountsError(error))
        throw error
      })
  }
}
