import React from 'react'

import Price from 'components/Price2'
import Buy from './mutations/Buy'

const SingleUnit = ({ listing, from, refetch }) => (
  <div className="listing-buy">
    <div className="price">
      <Price price={listing.price} />
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
