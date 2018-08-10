import { TransactionConstants } from '../actions/Transaction'

const initialState = []

export default function Transactions(state = initialState, action = {}) {
  switch (action.type) {
  case TransactionConstants.UPDATE:
    const { confirmationCount, transactionReceipt } = action

    return state.map(t => {
      if (t.transactionHash !== transactionReceipt.transactionHash) {
        return t
      }

      return { ...t, confirmationCount }
    })

  case TransactionConstants.UPSERT:
    const { transaction } = action
    const { transactionHash } = transaction

    return state.some(t => t.transactionHash === transactionHash)
      ? state.map(t => {
        if (t.transactionHash !== transactionHash) {
          return t
        }

        return { ...t, transaction }
      })
      : [...state, transaction]

  default:
    return state
  }
}
