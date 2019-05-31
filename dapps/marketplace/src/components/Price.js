import React, { useContext } from 'react'
import { fbt } from 'fbt-runtime'

import withCurrencies from 'hoc/withCurrencies'
import ceil from 'lodash/round'
import get from 'lodash/get'
import numberFormat from 'utils/numberFormat'
import CurrencyContext from 'constants/CurrencyContext'
import { CurrenciesByKey } from 'constants/Currencies'

const Price = ({ className, target, currencies, descriptor, ...props }) => {
  const listingType = get(props, 'listing.__typename')
  const price = props.price || get(props, 'listing.price')
  const currency = get(price, 'currency')
  let amount = get(price, 'amount')

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
  amount = ceil(amount, props.decimals || 5)

  const showCode = !targetCurrency.code.match(/^(USD|EUR|GBP)$/)
  const formatted = isFiat ? numberFormat(amount, 2).replace('.00', '') : amount
  const symbol = get(CurrenciesByKey, `${targetCurrency.id}.2`, '')

  const spanContent = (
    <span className={className}>{`${symbol}${formatted}${
      showCode ? ` ${targetCurrency.code}` : ''
    }`}</span>
  )

  const divContent = (
    <div className={className}>{`${symbol}${formatted}${
      showCode ? ` ${targetCurrency.code}` : ''
    }`}</div>
  )

  if (descriptor) {
    if (listingType === 'FractionalListing') {
      return (
        <div>
          <fbt desc="Price.fractionalNightlyShort">
            <fbt:param name="content">{spanContent}</fbt:param>
            <span className="desc">/ night</span>
          </fbt>
        </div>
      )
    } else if (listingType === 'FractionalHourlyListing') {
      return (
        <div>
          <fbt desc="Price.fractionalHourlyShort">
            <fbt:param name="content">{spanContent}</fbt:param>
            <span className="desc">/ hour</span>
          </fbt>
        </div>
      )
    } else if (get(props, 'listing.multiUnit')) {
      return (
        <div>
          <fbt desc="Price.multiUnitShort">
            <fbt:param name="content">{spanContent}</fbt:param>
            <span className="desc">each</span>
          </fbt>
        </div>
      )
    }
  }

  return divContent
}

export default withCurrencies(Price)
