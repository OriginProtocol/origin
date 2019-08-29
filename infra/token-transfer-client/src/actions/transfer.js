import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

export const ADD_TRANSFER_PENDING = 'ADD_TRANSFER_PENDING'
export const ADD_TRANSFER_SUCCESS = 'ADD_TRANSFER_SUCCESS'
export const ADD_TRANSFER_ERROR = 'ADD_TRANSFER_ERROR'
export const CONFIRM_TRANSFER_PENDING = 'CONFIRM_TRANSFER_PENDING'
export const CONFIRM_TRANSFER_SUCCESS = 'CONFIRM_TRANSFER_SUCCESS'
export const CONFIRM_TRANSFER_ERROR = 'CONFIRM_TRANSFER_ERROR'
export const FETCH_TRANSFERS_PENDING = 'FETCH_TRANSFERS_PENDING'
export const FETCH_TRANSFERS_SUCCESS = 'FETCH_TRANSFERS_SUCCESS'
export const FETCH_TRANSFERS_ERROR = 'FETCH_TRANSFERS_ERROR'

function addTransferPending() {
  return {
    type: ADD_TRANSFER_PENDING
  }
}

function addTransferSuccess(payload) {
  return {
    type: ADD_TRANSFER_SUCCESS,
    payload
  }
}

function addTransferError(error) {
  return {
    type: ADD_TRANSFER_ERROR,
    error
  }
}

function confirmTransferPending() {
  return {
    type: CONFIRM_TRANSFER_PENDING
  }
}

function confirmTransferSuccess(payload) {
  return {
    type: CONFIRM_TRANSFER_SUCCESS,
    payload
  }
}

function confirmTransferError(error) {
  return {
    type: CONFIRM_TRANSFER_ERROR,
    error
  }
}

function fetchTransfersPending() {
  return {
    type: FETCH_TRANSFERS_PENDING
  }
}

function fetchTransfersSuccess(payload) {
  return {
    type: FETCH_TRANSFERS_SUCCESS,
    payload
  }
}

function fetchTransfersError(error) {
  return {
    type: FETCH_TRANSFERS_ERROR,
    error
  }
}

export function addTransfer(transfer) {
  return dispatch => {
    dispatch(addTransferPending())

    return agent
      .post(`${apiUrl}/api/transfers`)
      .send(transfer)
      .then(response => dispatch(addTransferSuccess(response.body)))
      .catch(error => {
        dispatch(addTransferError(error))
        throw error
      })
  }
}

export function confirmTransfer(id, token) {
  return dispatch => {
    dispatch(confirmTransferPending())

    return agent
      .post(`${apiUrl}/api/transfers/${id}`)
      .send({ token })
      .then(response => dispatch(confirmTransferSuccess(response.body)))
      .catch(error => {
        dispatch(confirmTransferError(error))
        throw error
      })
  }
}

export function fetchTransfers() {
  return dispatch => {
    dispatch(fetchTransfersPending())

    agent
      .get(`${apiUrl}/api/transfers`)
      .then(response => dispatch(fetchTransfersSuccess(response.body)))
      .catch(error => {
        dispatch(fetchTransfersError(error))
        throw error
      })
  }
}
