const BigNumber = require('bignumber.js')

class Money {
  static sum(values, currency) {
    if (values === null || values.length === 0) {
      return { amount: '0', currency }
    }
    values = values.map(reward => reward.value)

    const total = values.reduce((first, second) => {
      if (first.currency !== second.currency)
        throw new Error(
          `At least two values have different currencies. ${first.currency} ${
            second.currency
          }`
        )
      return {
        amount: BigNumber(first.amount).plus(BigNumber(second.amount)),
        currency: first.currency
      }
    })

    return {
      amount: total.amount.toString(),
      currency: total.currency
    }
  }
}

module.exports = { Money }
