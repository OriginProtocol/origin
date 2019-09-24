import React from 'react'
import { fbt } from 'fbt-runtime'

import get from 'lodash/get'

import Buy from '../../mutations/Buy'
import withSingleUnitData from './withSingleUnitData'

/**
 * Renders the button that runs the makeOffer/swapAndMakeOffer mutation
 */
const BuySingleUnitMutation = ({ refetch, listing, from, prices, token, tokenStatus, shippingAddress }) => {
  return (
    <Buy
      refetch={refetch}
      listing={listing}
      from={from}
      value={get(prices, `${token}.amount`)}
      quantity={1}
      currency={token}
      tokenStatus={tokenStatus}
      shippingAddress={shippingAddress}
      className="btn btn-primary"
      children={fbt('Purchase', 'Purchase')}
    />
  )
}

export default withSingleUnitData(BuySingleUnitMutation)
