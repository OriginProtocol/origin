import React from 'react'

import Price from 'components/Price'
import Buy from './mutations/Buy'
import SelectQuantity from './_SelectQuantity'

const MultiUnit = ({ listing, from, quantity, updateQuantity, refetch }) => {
  const amount = String(Number(listing.price.amount) * Number(quantity))
  return (
    <div className="listing-buy multi">
      <div className="price">
        <Price amount={listing.price.amount} />
      </div>
      <SelectQuantity
        quantity={quantity}
        onChange={val => updateQuantity(val)}
        available={listing.unitsAvailable}
      />
      <div className="total">
        <span>Total Price</span>
        <span>{`${amount} ETH`}</span>
      </div>
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
