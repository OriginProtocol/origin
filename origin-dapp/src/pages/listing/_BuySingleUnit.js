import React from 'react'

import Price from 'components/Price'
import Buy from './mutations/Buy'

const SingleUnit = ({ listing, from, refetch }) => (
  <div className="listing-buy">
    <div className="price">
      <Price amount={listing.price.amount} />
    </div>
    <Buy
      refetch={refetch}
      listing={listing}
      from={from}
      value={listing.price.amount}
      quantity={1}
      className="btn btn-primary"
      children="Purchase"
    />
  </div>
)

export default SingleUnit
