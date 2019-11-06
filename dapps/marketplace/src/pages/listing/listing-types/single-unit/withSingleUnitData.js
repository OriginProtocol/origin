import React from 'react'
import WithPrices from 'components/WithPrices'

const withSingleUnitData = WrappedComponent => {
  const WithSingleUnitData = ({ listing, ...props }) => {
    const amount = listing.price.amount
    const totalPrice = { amount, currency: listing.price.currency }

    return (
      <WithPrices
        listing={listing}
        price={totalPrice}
        targets={[
          'token-ETH',
          'token-DAI',
          'token-OGN',
          'token-OKB',
          listing.price.currency.id
        ]}
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
          />
        )}
      </WithPrices>
    )
  }

  return WithSingleUnitData
}

export default withSingleUnitData
