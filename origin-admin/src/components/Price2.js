import React from 'react'

import withCurrencies from 'hoc/withCurrencies'

const Price = ({ currencies, price: { currency, amount } }) => {
  const foundCurrency = currencies.find(c => c.id === currency.code)
  if (foundCurrency) {
    return <span>{`${amount} ${foundCurrency.code}`}</span>
  } else if (currency.code === 'USD') {
    return <span>{`$${amount}`}</span>
  }
  return <span>{`${amount} ${currency.code}`}</span>
}

export default withCurrencies(Price)
