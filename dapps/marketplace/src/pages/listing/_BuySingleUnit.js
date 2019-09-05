import React from 'react'
import { fbt } from 'fbt-runtime'

import get from 'lodash/get'

import Price from 'components/Price'
import OgnBadge from 'components/OgnBadge'
import WithPrices from 'components/WithPrices'
import Buy from './mutations/Buy'
import PaymentOptions from './_PaymentOptions'
import ConfirmShippingAndPurchase from './_ConfirmShippingAndPurchase'

const withSingleUnitData = (WrappedComponent) => {
  const WithSingleUnitData = ({ listing, ...props }) => {
    const acceptsDai = listing.acceptedTokens.find(t => t.id === 'token-DAI')
    const token = acceptsDai ? 'token-DAI' : 'token-ETH'

    return (
      <WithPrices
        price={listing.price}
        target={token}
        targets={['token-ETH', 'token-DAI', listing.price.currency.id]}
        allowanceTarget={listing.contractAddr}
      >
        {({ prices, tokenStatus }) => (
          <WrappedComponent
            {...{
              prices,
              tokenStatus,
              token,
              acceptsDai,
              listing,
              ...props
            }}
          />
        )}
      </WithPrices>
    )
  }

  return WithSingleUnitData
}

/**
 * Renders the buy button that you see on the listing detail page
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
        value={token}
        hasBalance={tokenStatus.hasBalance}
        hasEthBalance={tokenStatus.hasEthBalance}
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
const ConfirmSingleUnitPurchase = withSingleUnitData(({ refetch, listing, from, prices, token, tokenStatus }) => {
  return (
    <Buy
      refetch={refetch}
      listing={listing}
      from={from}
      value={get(prices, `${token}.amount`)}
      quantity={1}
      currency={token}
      tokenStatus={tokenStatus}
      className="btn btn-primary"
      children={fbt('Purchase', 'Purchase')}
    />
  )
})

export default withSingleUnitData(SingleUnit)

export {
  ConfirmSingleUnitPurchase
}
