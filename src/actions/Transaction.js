import keyMirror from 'utils/keyMirror'

export const TransactionConstants = keyMirror(
  {
    UPDATE: null,
    UPSERT: null,
  },
  'TRANSACTION'
)

export function update(transactionHash, confirmationCount) {
  return {
    type: TransactionConstants.UPDATE,
    transactionHash,
    confirmationCount,
  }
}

export function upsert(transaction) {
  return {
    type: TransactionConstants.UPSERT,
    transaction: {
      confirmationCount: 0,
      ...transaction,
    },
  }
}
