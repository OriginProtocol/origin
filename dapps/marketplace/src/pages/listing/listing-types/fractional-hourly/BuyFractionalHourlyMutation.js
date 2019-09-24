import React from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Buy from '../../mutations/Buy'

import withFractionalHourlyData from './withFractionalHourlyData'

/**
 * Renders the button that runs the makeOffer/swapAndMakeOffer mutation
 */
const BuyFractionalHourlyMutation = ({
  refetch,
  listing,
  from,
  prices,
  token,
  tokenStatus,
  startDate,
  endDate,
  available
}) => {
  return (
    <Buy
      refetch={refetch}
      listing={listing}
      from={from}
      value={get(prices, `['${token}'].amount`)}
      quantity={1}
      disabled={available ? false : true}
      startDate={startDate}
      endDate={endDate}
      currency={token}
      tokenStatus={tokenStatus}
      className={`btn btn-primary${available ? '' : ' disabled'}`}
      children={fbt('Book', 'Book')}
    />
  )
}

export default withFractionalHourlyData(BuyFractionalHourlyMutation)

