import React from 'react'
import { fbt } from 'fbt-runtime'

import get from 'lodash/get'

import Price from 'components/Price'
import OgnBadge from 'components/OgnBadge'
import WithPrices from 'components/WithPrices'
import Buy from './mutations/Buy'
import PaymentOptions from './_PaymentOptions'
import ConfirmShippingAndPurchase from './_ConfirmShippingAndPurchase'
import PurchaseSummary from './_PurchaseSummary'

const withSingleUnitData = WrappedComponent => {
  const WithSingleUnitData = ({ listing, ...props }) => {
    const amount = listing.price.amount
    const acceptsEth = listing.acceptedTokens.find(t => t.id === 'token-ETH')
    const acceptsDai = listing.acceptedTokens.find(t => t.id === 'token-DAI')
    // Favor payment in ETH over DAI if the seller accepts it.
    const token = acceptsEth ? 'token-ETH' : 'token-DAI'
    const totalPrice = { amount, currency: listing.price.currency }

    return (
      <WithPrices
        price={totalPrice}
        target={token}
        targets={['token-ETH', 'token-DAI', listing.price.currency.id]}
        allowanceTarget={listing.contractAddr}
      >
        {({ prices, tokenStatus }) => (
          <WrappedComponent
            {...props}
            prices={prices}
            tokenStatus={tokenStatus}
            token={token}
            acceptsDai={acceptsDai}
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
      <PaymentOptions
        tokens={prices}
        price={listing.price}
        acceptedTokens={listing.acceptedTokens}
        listing={listing}
        value={token}
        tokenStatus={tokenStatus}
      >
        <ConfirmShippingAndPurchase
          listing={listing}
          className="btn btn-primary"
          children={fbt('Purchase', 'Purchase')}
        />
      </PaymentOptions>
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
