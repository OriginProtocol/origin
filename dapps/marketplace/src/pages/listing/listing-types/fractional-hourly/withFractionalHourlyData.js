import React from 'react'
import dayjs from 'dayjs'

import WithPrices from 'components/WithPrices'

import supportedTokens from '@origin/graphql/src/utils/supportedTokens'

const withFractionalHourlyData = WrappedComponent => {
  const WithFractionalHourlyData = ({
    listing,
    range,
    availability,
    ...props
  }) => {
    let startDate = null,
      endDate = null,
      totalPrice,
      available = false

    if (range) {
      const split = range.split('/')
      startDate = split[0]
      endDate = split[1]
      const priceEstimate = availability.estimatePrice(
        `${startDate}/${dayjs(endDate)
          .add(-1, 'hour')
          .format('YYYY-MM-DDTHH:00:00')}`
      )
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
          ...supportedTokens,
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
            startDate={startDate}
            endDate={endDate}
            totalPrice={totalPrice}
            availability={availability}
            available={available}
            range={range}
          />
        )}
      </WithPrices>
    )
  }

  return WithFractionalHourlyData
}

export default withFractionalHourlyData
