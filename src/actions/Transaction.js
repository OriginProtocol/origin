import keyMirror from 'utils/keyMirror'

export const TransactionConstants = keyMirror(
  {
    UPDATE: null,
    UPSERT: null
  },
  'TRANSACTION'
)

export function update(confirmationCount, transactionReceipt) {
  return {
    type: TransactionConstants.UPDATE,
    confirmationCount,
    transactionReceipt
  }
}

export function upsert(transaction) {
  return {
    type: TransactionConstants.UPSERT,
    transaction: {
      confirmationCount: 0,
      ...transaction
    }
  }
}
