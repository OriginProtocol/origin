import React from 'react'

import WithPrices from 'components/WithPrices'
import supportedTokens from '@origin/graphql/src/utils/supportedTokens'

const withMultiUnitData = WrappedComponent => {
  const WithMultiUnitData = ({ listing, quantity, ...props }) => {
    const amount = String(Number(listing.price.amount) * Number(quantity))
    const totalPrice = { amount, currency: listing.price.currency }

    return (
      <WithPrices
        listing={listing}
        price={totalPrice}
        targets={[...supportedTokens, totalPrice.currency.id]}
        allowanceTarget={listing.contractAddr}
      >
        {({ prices, tokenStatus, suggestedToken }) => (
          <WrappedComponent
            {...props}
            prices={prices}
            tokenStatus={tokenStatus}
            token={props.paymentMethod || suggestedToken}
            listing={listing}
            totalPrice={totalPrice}
            quantity={quantity}
          />
        )}
      </WithPrices>
    )
  }

  return WithMultiUnitData
}

export default withMultiUnitData
