import React, { useState, useContext } from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import CurrencyContext from 'constants/CurrencyContext'
import Price from 'components/Price'
import OgnBadge from 'components/OgnBadge'
import WithPrices from 'components/WithPrices'
import Buy from './mutations/Buy'
import SelectQuantity from './_SelectQuantity'
import PaymentOptions from './_PaymentOptions'

const MultiUnit = ({
  listing,
  from,
  quantity,
  updateQuantity,
  refetch,
  growthReward,
  isMobile
}) => {
  const selectedCurrency = useContext(CurrencyContext)
  const amount = String(Number(listing.price.amount) * Number(quantity))
  const acceptsDai = listing.acceptedTokens.find(t => t.id === 'token-DAI')
  const [token, setToken] = useState(acceptsDai ? 'token-DAI' : 'token-ETH')
  const totalPrice = { amount, currency: listing.price.currency }

  const priceComp = (
    <div className="total">
      <span className="total-price-label">
        <fbt desc="totalPrice">Total Price</fbt>
      </span>
      <span className="total-price-value">
        <Price price={totalPrice} />
      </span>
    </div>
  )

  return (
    <WithPrices
      price={totalPrice}
      target={token}
      targets={['token-ETH', 'token-DAI', totalPrice.currency.id]}
    >
      {({ prices, tokenStatus }) => {
        if (!prices) return null
        return (
          <>
            <div className="listing-buy multi">
              <div className="price">
                <div className="d-flex justify-content-between align-items-center">
                  <Price listing={listing} descriptor />
                  {!isMobile && (
                    <OgnBadge
                      amount={growthReward}
                      className="listing-detail-growth-reward"
                    />
                  )}
                </div>
                {listing.price.currency.id === selectedCurrency ? null : (
                  <span className="orig">
                    <Price
                      price={listing.price}
                      target={listing.price.currency.id}
                    />
                  </span>
                )}
              </div>
              <SelectQuantity
                quantity={quantity}
                onChange={val => updateQuantity(val)}
                available={listing.unitsAvailable}
                hideLabel={isMobile}
              />
              {!isMobile && priceComp}
              <PaymentOptions
                tokens={prices}
                price={totalPrice}
                acceptedTokens={listing.acceptedTokens}
                value={token}
                onChange={setToken}
                hasBalance={tokenStatus.hasBalance}
                hasEthBalance={tokenStatus.hasEthBalance}
              >
                <Buy
                  refetch={refetch}
                  listing={listing}
                  from={from}
                  value={get(prices, `${token}.amount`)}
                  quantity={quantity}
                  currency={token}
                  tokenStatus={tokenStatus}
                  className="btn btn-primary"
                  children={fbt('Purchase', 'Purchase')}
                />
              </PaymentOptions>
            </div>
            {isMobile && priceComp}
          </>
        )
      }}
    </WithPrices>
  )
}

export default MultiUnit

require('react-styl')(`
  @media (max-width: 767.98px)
    .listing-detail 
      .listing-buy.multi, .listing-buy.fractional
        .price
          line-height: 2
          padding: 0
          white-space: nowrap
        .quantity
          padding: 0
          line-height: 2
          margin: 0
        .btn-primary
          width: auto
        .choose-dates
          margin: 0.5rem 0
        & + .total
          display: flex
          .total-price-label
            flex: auto
          .total-price-value
            font-weight: 900
`)
