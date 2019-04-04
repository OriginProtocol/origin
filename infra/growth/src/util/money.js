const BigNumber = require('bignumber.js')

class Money {
  static sum(values, currency) {
    if (values === null || values.length === 0) {
      return { amount: '0', currency }
    }
    let total = BigNumber(0)
    for (const value of values) {
      console.log('ADDING ', value)
      if (value.currency !== currency) {
        throw new Error(`unexpect currency ${value.currency}`)
      }
      total = total.plus(BigNumber(value.amount))
    }

    return {
      amount: total.toFixed(),
      currency: currency
    }
  }
}

module.exports = { Money }
