import React from 'react'
import { fbt } from 'fbt-runtime'

import Price from 'components/Price'
import OgnBadge from 'components/OgnBadge'
import ConfirmPurchaseButton from '../../_ConfirmPurchaseButton'
import withSingleUnitData from './withSingleUnitData'

/**
 * Renders the buy widget and button that you see on the listing detail page
 * When user clicks on purchase, it takes you to Purchase confirmation page
 */
const SingleUnit = ({ listing, growthReward, prices }) => {
  if (!prices) return null

  return (
    <div className="listing-buy">
      <div className="price d-flex justify-content-between align-items-center">
        <Price listing={listing} descriptor />
        <OgnBadge
          amount={growthReward}
          className="listing-detail-growth-reward"
        />
      </div>
      <ConfirmPurchaseButton
        listing={listing}
        className="btn btn-primary"
        children={fbt('Purchase', 'Purchase')}
      />
    </div>
  )
}

export default withSingleUnitData(SingleUnit)
