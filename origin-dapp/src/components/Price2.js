import React from 'react'

import withCurrencies from 'hoc/withCurrencies'

const Price = ({ className, currencies, price: { currency, amount } = {} }) => {
  if (!currency) return null
  const foundCurrency = currencies.find(c => c.id === currency.id)
  if (foundCurrency) {
    if (foundCurrency.code === 'USD') {
      return <span className={className}>{`$${amount}`}</span>
    }
    return (
      <span className={className}>{`${amount} ${foundCurrency.code}`}</span>
    )
  }
  return <span className={className}>{`${amount} ${currency.code}`}</span>
}

export default withCurrencies(Price)
