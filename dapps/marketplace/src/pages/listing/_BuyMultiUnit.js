import React from 'react'
import { fbt } from 'fbt-runtime'

import Price from 'components/Price'
import Buy from './mutations/Buy'
import SelectQuantity from './_SelectQuantity'

const MultiUnit = ({ listing, from, quantity, updateQuantity, refetch }) => {
  const amount = String(Number(listing.price.amount) * Number(quantity))
  return (
    <div className="listing-buy multi">
      <div className="price">
        <div className="eth">
          {`${listing.price.amount} ETH`}
          {listing.multiUnit ? <span>{fbt(' / each', '/ each')}</span> : null}
        </div>
        <div className="usd">
          <Price amount={listing.price.amount} />
        </div>
      </div>
      <SelectQuantity
        quantity={quantity}
        onChange={val => updateQuantity(val)}
        available={listing.unitsAvailable}
      />
      <div className="total">
        <span>
          <fbt desc="totalPrice">Total Price</fbt>
        </span>
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
