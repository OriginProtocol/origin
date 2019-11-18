import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

export const ADD_ACCOUNT_PENDING = 'ADD_ACCOUNT_PENDING'
export const ADD_ACCOUNT_SUCCESS = 'ADD_ACCOUNT_SUCCESS'
export const ADD_ACCOUNT_ERROR = 'ADD_ACCOUNT_ERROR'
export const DELETE_ACCOUNT_PENDING = 'DELETE_ACCOUNT_PENDING'
export const DELETE_ACCOUNT_SUCCESS = 'DELETE_ACCOUNT_SUCCESS'
export const DELETE_ACCOUNT_ERROR = 'DELETE_ACCOUNT_ERROR'
export const FETCH_ACCOUNTS_PENDING = 'FETCH_ACCOUNTS_PENDING'
export const FETCH_ACCOUNTS_SUCCESS = 'FETCH_ACCOUNTS_SUCCESS'
export const FETCH_ACCOUNTS_ERROR = 'FETCH_ACCOUNTS_ERROR'

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

function deleteAccountPending() {
  return {
    type: DELETE_ACCOUNT_PENDING
  }
}

function deleteAccountSuccess(payload) {
  return {
    type: DELETE_ACCOUNT_SUCCESS,
    payload
  }
}

function deleteAccountError(error) {
  return {
    type: DELETE_ACCOUNT_ERROR,
    error
  }
}

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

export function addAccount(account) {
  return dispatch => {
    dispatch(addAccountPending())

    return agent
      .post(`${apiUrl}/api/accounts`)
      .send(account)
      .then(response => dispatch(addAccountSuccess(response.body)))
      .catch(error => {
        dispatch(addAccountError(error))
        throw error
      })
  }
}

export function deleteAccount(id) {
  return dispatch => {
    dispatch(deleteAccountPending())

    return agent
      .delete(`${apiUrl}/api/accounts/${id}`)
      .then(() => dispatch(deleteAccountSuccess(id)))
      .catch(error => {
        dispatch(deleteAccountError(error))
        throw error
      })
  }
}

export function fetchAccounts() {
  return dispatch => {
    dispatch(fetchAccountsPending())

    return agent
      .get(`${apiUrl}/api/accounts`)
      .then(response => dispatch(fetchAccountsSuccess(response.body)))
      .catch(error => {
        dispatch(fetchAccountsError(error))
        if (error.status !== 401) {
          throw error
        }
      })
  }
}
