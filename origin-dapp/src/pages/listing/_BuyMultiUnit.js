import React, { useState } from 'react'

import Price from 'components/Price2'
import WithPrices from 'components/WithPrices'
import Buy from './mutations/Buy'
import SelectQuantity from './_SelectQuantity'
import PaymentOptions from './_PaymentOptions'

const MultiUnit = ({ listing, from, quantity, updateQuantity, refetch }) => {
  const amount = String(Number(listing.price.amount) * Number(quantity))
  const acceptsDai = listing.acceptedTokens.find(t => t.id === 'token-DAI')
  const [token, setToken] = useState(acceptsDai ? 'token-DAI' : 'token-ETH')
  const totalPrice = { amount, currency: listing.price.currency }
  return (
    <WithPrices
      price={totalPrice}
      targets={['token-ETH', 'token-DAI', totalPrice.currency.id]}
    >
      {prices => {
        if (!prices) return null
        return (
          <div className="listing-buy multi">
            <div className="price">
              <Price price={listing.price} />
              <span className="desc">{' / each'}</span>
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
            />
            <Buy
              refetch={refetch}
              listing={listing}
              from={from}
              value={prices[token].amount}
              quantity={quantity}
              currency={token}
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
