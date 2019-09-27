import React from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Buy from '../../mutations/Buy'
import withMultiUnitData from './withMultiUnitData'

/**
 * Renders the button that runs the makeOffer/swapAndMakeOffer mutation
 */
const BuyMultiUnitMutation = ({
  refetch,
  listing,
  from,
  prices,
  token,
  tokenStatus,
  quantity,
  shippingAddress
}) => (
  <Buy
    refetch={refetch}
    listing={listing}
    from={from}
    value={get(prices, `${token}.amount`)}
    quantity={quantity}
    currency={token}
    tokenStatus={tokenStatus}
    shippingAddress={shippingAddress}
    className="btn btn-primary"
    children={fbt('Purchase', 'Purchase')}
  />
)

export default withMultiUnitData(BuyMultiUnitMutation)
