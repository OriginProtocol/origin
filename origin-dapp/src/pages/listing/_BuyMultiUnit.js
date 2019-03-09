import React from 'react'

import Price from 'components/Price'
import Buy from './mutations/Buy'
import SelectQuantity from './_SelectQuantity'
import PaymentOptions from './_PaymentOptions'

const MultiUnit = ({ listing, from, quantity, updateQuantity, refetch }) => {
  const amount = String(Number(listing.price.amount) * Number(quantity))
  return (
    <div className="listing-buy multi">
      <div className="price">
        <Price amount={listing.price.amount} />
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
          <Price amount={amount} />
        </span>
      </div>
      <PaymentOptions />
      <Buy
        refetch={refetch}
        listing={listing}
        from={from}
        value={amount}
        quantity={quantity}
        className="btn btn-primary"
        children="Purchase"
      />
    </div>
  )
}

export default MultiUnit
