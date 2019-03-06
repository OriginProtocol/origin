export const getDerivedTransactionData = (transactions, hideList) => {
  const CONFIRMATION_COMPLETION_COUNT = 12

  const transactionsNotHidden = transactions.filter(
    t => !hideList.includes(t.transactionHash)
  )
  const transactionsNotCompleted = transactions.filter(
    t => t.confirmationCount < CONFIRMATION_COMPLETION_COUNT
  )
  const transactionsCanBeCleared = !!transactionsNotHidden.filter(
    t => t.confirmationCount >= CONFIRMATION_COMPLETION_COUNT
  ).length

  const transactionsArePending = !!transactions.filter(
    ({ confirmationCount }) =>
      !confirmationCount ||
      confirmationCount < CONFIRMATION_COMPLETION_COUNT
  ).length

  return {
    transactionsNotHidden,
    transactionsNotCompleted,
    transactionsCanBeCleared,
    transactionsArePending,
    CONFIRMATION_COMPLETION_COUNT
  }
}
