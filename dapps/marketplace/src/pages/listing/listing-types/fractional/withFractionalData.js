import React from 'react'

import WithPrices from 'components/WithPrices'

/**
 * HOC that returns all the data that you need for running the
 * makeOffer mutation for fractional listing
 */
const withFractionalData = WrappedComponent => {
  const WithFractionalData = ({ listing, range, availability, ...props }) => {
    let startDate = null,
      endDate = null,
      totalPrice,
      available = false

    if (range) {
      const split = range.split('/')
      startDate = split[0]
      endDate = split[1]
      const priceEstimate = availability.estimateNightlyPrice(range)
      available = priceEstimate.available
      if (available) {
        totalPrice = {
          amount: String(priceEstimate.price),
          currency: listing.price.currency
        }
      }
    }

    return (
      <WithPrices
        listing={listing}
        price={totalPrice}
        targets={[
          'token-ETH',
          'token-DAI',
          'token-OGN',
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
            range={range}
            availability={availability}
            available={available}
            totalPrice={totalPrice}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </WithPrices>
    )
  }

  return WithFractionalData
}

export default withFractionalData
