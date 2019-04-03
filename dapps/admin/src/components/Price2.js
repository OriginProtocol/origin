import React from 'react'

import withCurrencies from 'hoc/withCurrencies'
import ceil from 'lodash/round'
import get from 'lodash/get'
import numberFormat from 'utils/numberFormat'

const Price = ({ className, target, currencies, descriptor, ...props }) => {
  const listingType = get(props, 'listing.__typename')
  const price = props.price || get(props, 'listing.price')
  const currency = get(price, 'currency')
  let amount = get(price, 'amount')

  if (!currency) return null
  if (!target) {
    target = 'fiat-USD'
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
  const symbol = targetCurrency.code

  const content = (
    <span className={className}>{`${symbol} ${formatted}${
      showCode ? ` ${targetCurrency.code}` : ''
    }`}</span>
  )

  if (descriptor) {
    if (listingType === 'FractionalListing') {
      return (
        <>
          {content}
          <span className="desc"> / night</span>
        </>
      )
    } else if (listingType === 'FractionalHourlyListing') {
      return (
        <>
          {content}
          <span className="desc"> / hour</span>
        </>
      )
    } else if (get(props, 'listing.multiUnit')) {
      return (
        <>
          {content}
          <span className="desc"> each</span>
        </>
      )
    }
  }

  return content
}

export default withCurrencies(Price)
