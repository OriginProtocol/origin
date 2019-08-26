import enums from '@origin/token-transfer-server/src/enums'

import {
  ADD_TRANSFER_PENDING,
  ADD_TRANSFER_SUCCESS,
  ADD_TRANSFER_ERROR,
  CONFIRM_TRANSFER_PENDING,
  CONFIRM_TRANSFER_SUCCESS,
  CONFIRM_TRANSFER_ERROR,
  FETCH_TRANSFERS_PENDING,
  FETCH_TRANSFERS_SUCCESS,
  FETCH_TRANSFERS_ERROR
} from '../actions/transfer'

const initialState = {
  isAdding: false,
  isConfirming: false,
  isLoading: true,
  transfers: [],
  error: null
}

export default function transfersReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_TRANSFER_PENDING:
      return {
        ...state,
        isAdding: true
      }
    case ADD_TRANSFER_SUCCESS:
      return {
        ...state,
        isAdding: false,
        transfers: [...state.transfers, action.payload],
        error: null
      }
    case ADD_TRANSFER_ERROR:
      return {
        ...state,
        isAdding: false,
        error: action.error
      }
    case CONFIRM_TRANSFER_PENDING:
      return {
        ...state,
        isConfirming: true
      }
    case CONFIRM_TRANSFER_SUCCESS:
      return {
        ...state,
        isConfirming: false,
        transfers: [
          ...state.transfers.filter(t => t.id === action.payload.id),
          {
            ...action.payload
          }
        ],
        error: null
      }
    case CONFIRM_TRANSFER_ERROR:
      return {
        ...state,
        isConfirming: false,
        error: action.error
      }
    case FETCH_TRANSFERS_PENDING:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_TRANSFERS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        transfers: action.payload,
        error: null
      }
    case FETCH_TRANSFERS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    default:
      return state
  }
}

export const getTransfers = state => state.transfers
export const getError = state => state.error
export const getIsAdding = state => state.isAdding
export const getIsConfirming = state => state.isConfirming
export const getIsLoading = state => state.isLoading
export const getWithdrawnAmount = state => {
  const pendingOrCompleteTransfers = [
    enums.TransferStatuses.Enqueued,
    enums.TransferStatuses.Paused,
    enums.TransferStatuses.WaitingConfirmation,
    enums.TransferStatuses.Success
  ]

  return state.transfers.reduce((total, transfer) => {
    if (pendingOrCompleteTransfers.includes(transfer.status)) {
      return total + Number(transfer.amount)
    }
    return total
  }, 0)
}
