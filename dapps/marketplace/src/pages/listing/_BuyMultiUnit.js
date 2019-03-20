import React, { useState, useContext } from 'react'
import get from 'lodash/get'

import CurrencyContext from 'constants/CurrencyContext'
import Price from 'components/Price'
import WithPrices from 'components/WithPrices'
import Buy from './mutations/Buy'
import SelectQuantity from './_SelectQuantity'
import PaymentOptions from './_PaymentOptions'

const MultiUnit = ({ listing, from, quantity, updateQuantity, refetch }) => {
  const selectedCurrency = useContext(CurrencyContext)
  const amount = String(Number(listing.price.amount) * Number(quantity))
  const acceptsDai = listing.acceptedTokens.find(t => t.id === 'token-DAI')
  const [token, setToken] = useState(acceptsDai ? 'token-DAI' : 'token-ETH')
  const totalPrice = { amount, currency: listing.price.currency }
  return (
    <WithPrices
      price={totalPrice}
      target={token}
      targets={['token-ETH', 'token-DAI', totalPrice.currency.id]}
    >
      {({ prices, tokenStatus }) => {
        if (!prices) return null
        return (
          <div className="listing-buy multi">
            <div className="price">
              <Price listing={listing} descriptor />
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
            />
            <div className="total">
              <span>Total Price</span>
              <span>
                <Price price={totalPrice} />
              </span>
            </div>
            <PaymentOptions
              tokens={prices}
              price={totalPrice}
              acceptedTokens={listing.acceptedTokens}
              value={token}
              onChange={setToken}
              hasBalance={tokenStatus.hasBalance}
            />
            <Buy
              refetch={refetch}
              listing={listing}
              from={from}
              value={get(prices, `${token}.amount`)}
              quantity={quantity}
              currency={token}
              tokenStatus={tokenStatus}
              className="btn btn-primary"
              children="Purchase"
            />
          </div>
        )
      }}
    </WithPrices>
  )
}

export default MultiUnit
