import React from 'react'

import withCurrencies from 'hoc/withCurrencies'
import ceil from 'lodash/round'
import get from 'lodash/get'
import numberFormat from 'utils/numberFormat'
import { CurrenciesByKey } from 'constants/Currencies'

const Price = ({ className, target, currencies, prefix = '', ...props }) => {
  const currency = get(props.price, 'currency')
  let amount = get(props.price, 'amount')

  if (!currency) return null

  const currencyId = typeof currency === 'string' ? currency : currency.id
  const foundCurrency = currencies.find(c => c.id === currencyId)
  const targetCurrency = currencies.find(c => c.id === target) || foundCurrency

  if (!foundCurrency) return null

  const isFiat = targetCurrency.id.indexOf('fiat-') === 0
  const amountUSD = amount * foundCurrency.priceInUSD
  amount = amountUSD / targetCurrency.priceInUSD
  amount = ceil(amount, props.decimals || 5)

  const showCode = !targetCurrency.code.match(/^(USD|EUR|GBP)$/)
  const formatted = isFiat ? numberFormat(amount, 2).replace('.00', '') : amount
  const symbol = get(CurrenciesByKey, `${targetCurrency.id}.2`, '')

  const content = `${symbol}${formatted}${
    showCode ? ` ${targetCurrency.code}` : ''
  }`

  return (
    <span className={className}>
      {prefix}
      {content}
    </span>
  )
}

export default withCurrencies(Price)
