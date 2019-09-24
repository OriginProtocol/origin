import React from 'react'
import { fbt } from 'fbt-runtime'

import get from 'lodash/get'

import Price from 'components/Price'
import OgnBadge from 'components/OgnBadge'
import WithPrices from 'components/WithPrices'
import Buy from './mutations/Buy'
import PaymentOptions from './_PaymentOptions'
import ConfirmPurchaseButton from './_ConfirmPurchaseButton'
import PurchaseSummary from './_PurchaseSummary'

const withSingleUnitData = WrappedComponent => {
  const WithSingleUnitData = ({ listing, ...props }) => {
    const amount = listing.price.amount
    const totalPrice = { amount, currency: listing.price.currency }

    return (
      <WithPrices
        listing={listing}
        price={totalPrice}
        targets={['token-ETH', 'token-DAI', listing.price.currency.id]}
        allowanceTarget={listing.contractAddr}
      >
        {({ prices, tokenStatus, suggestedToken }) => (
          <WrappedComponent
            {...props}
            prices={prices}
            tokenStatus={tokenStatus}
            token={suggestedToken}
            listing={listing}
            totalPrice={totalPrice}
          />
        )}
      </WithPrices>
    )
  }

  return WithSingleUnitData
}

/**
 * Renders the buy widget and button that you see on the listing detail page
 * When user clicks on purchase, it takes you to Purchase confirmation page
 */
const SingleUnit = ({ listing, growthReward, prices, tokenStatus, token }) => {
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

/**
 * Renders the button that runs the makeOffer/swapAndMakeOffer mutation
 */
const BuySingleUnitMutation = withSingleUnitData(
  ({ refetch, listing, from, prices, token, tokenStatus, shippingAddress }) => {
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
)

const SingleUnitPurchaseSummary = withSingleUnitData(PurchaseSummary)

export default withSingleUnitData(SingleUnit)

export { BuySingleUnitMutation, SingleUnitPurchaseSummary }
