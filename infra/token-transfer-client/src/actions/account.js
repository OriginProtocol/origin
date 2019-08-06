import agent from '../utils/agent'

export const FETCH_ACCOUNTS_PENDING = 'FETCH_ACCOUNTS_PENDING'
export const FETCH_ACCOUNTS_SUCCESS = 'FETCH_ACCOUNTS_SUCCESS'
export const FETCH_ACCOUNTS_ERROR = 'FETCH_ACCOUNTS_ERROR'
export const ADD_ACCOUNT = 'ADD_ACCOUNT'
export const DELETE_ACCOUNT = 'DELETE_ACCOUNT'

function fetchAccountsPending() {
  return {
    type: FETCH_ACCOUNTS_PENDING
  }
}

function fetchAccountsSuccess(accounts) {
  return {
    type: FETCH_ACCOUNTS_SUCCESS,
    accounts
  }
}

function fetchAccountsError(error) {
  return {
    type: FETCH_ACCOUNTS_ERROR,
    error
  }
}

/*
function addAccount(account) {
  return {
    type: ADD_ACCOUNT,
    account
  }
}

function deleteAccount(id) {
  return {
    type: DELETE_ACCOUNT,
    id
  }
}
*/

export default function fetchAccounts() {
  return dispatch => {
    dispatch(fetchAccountsPending())

    const apiUrl = process.env.PORTAL_API_URL || 'http://localhost:5000'
    agent
      .get(`${apiUrl}/api/accounts`)
      .then(response => dispatch(fetchAccountsSuccess(response.json)))
      .catch(error => dispatch(fetchAccountsError(error)))
  }
}
