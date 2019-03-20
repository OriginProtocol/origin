/**
 * Helper class for handling money.
 * TODO(franck):
 *   1. Use BigNumber for handling amounts
 *   2. Implement operations such as mutiply, add, etc...
 */
class Money {
  constructor({ amount, currency }) {
    this.currency = currency
    this.amount = String(amount)
  }
}

export default Money
