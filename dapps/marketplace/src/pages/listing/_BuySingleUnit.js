import React from 'react'
import { fbt } from 'fbt-runtime'

import Price from 'components/Price'
import Buy from './mutations/Buy'

const SingleUnit = ({ listing, from, refetch }) => (
  <div className="listing-buy">
    <div className="price">
      <div className="eth">{`${listing.price.amount} ETH`}</div>
      <div className="usd">
        <Price amount={listing.price.amount} />
      </div>
    </div>
    <Buy
      refetch={refetch}
      listing={listing}
      from={from}
      value={listing.price.amount}
      quantity={1}
      className="btn btn-primary"
      children={fbt('Purchase', 'Purchase')}
    />
  </div>
)

export default SingleUnit
