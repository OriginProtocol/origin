import React, { useContext } from 'react'

import withCurrencies from 'hoc/withCurrencies'
import round from 'lodash/round'
import numberFormat from 'utils/numberFormat'
import CurrencyContext from 'constants/CurrencyContext'

const Price = ({
  className,
  target,
  currencies,
  price: { currency, amount } = {}
}) => {
  if (!currency) return null
  if (!target) {
    target = useContext(CurrencyContext)
  }
  const foundCurrency = currencies.find(c => c.id === currency.id)
  const targetCurrency = currencies.find(c => c.id === target) || foundCurrency

  if (!foundCurrency) return '???'

  const amountUSD = amount * foundCurrency.priceInUSD
  amount = amountUSD / targetCurrency.priceInUSD
  amount = round(amount, 5)

  if (targetCurrency.code === 'USD') {
    const formatted = numberFormat(amount, 2).replace('.00', '')
    return <span className={className}>{`$${formatted}`}</span>
  } else if (targetCurrency.code === 'EUR') {
    const formatted = numberFormat(amount, 2).replace('.00', '')
    return <span className={className}>{`€${formatted}`}</span>
  } else if (targetCurrency.code === 'GBP') {
    const formatted = numberFormat(amount, 2).replace('.00', '')
    return <span className={className}>{`£${formatted}`}</span>
  }
  return <span className={className}>{`${amount} ${targetCurrency.code}`}</span>
}

export default withCurrencies(Price)
