import React, { useContext } from 'react'

import withCurrencies from 'hoc/withCurrencies'
import ceil from 'lodash/round'
import get from 'lodash/get'
import numberFormat from 'utils/numberFormat'
import CurrencyContext from 'constants/CurrencyContext'
import { CurrenciesByKey } from 'constants/Currencies'

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
  const currencyId = typeof currency === 'string' ? currency : currency.id
  const foundCurrency = currencies.find(c => c.id === currencyId)
  const targetCurrency = currencies.find(c => c.id === target) || foundCurrency

  if (!foundCurrency) return '???'

  const isFiat = targetCurrency.id.indexOf('fiat-') === 0
  const amountUSD = amount * foundCurrency.priceInUSD
  amount = amountUSD / targetCurrency.priceInUSD
  amount = ceil(amount, 5)

  const showCode = !targetCurrency.code.match(/^(USD|EUR|GBP)$/)
  const formatted = isFiat ? numberFormat(amount, 2).replace('.00', '') : amount
  const symbol = get(CurrenciesByKey, `${targetCurrency.id}.2`, '')

  return (
    <span className={className}>{`${symbol}${formatted}${
      showCode ? ` ${targetCurrency.code}` : ''
    }`}</span>
  )
}

export default withCurrencies(Price)
