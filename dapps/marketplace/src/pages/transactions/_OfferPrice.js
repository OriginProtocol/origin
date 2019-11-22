import React from 'react'

import Price from 'components/Price'

import withTypeSpecificData from 'pages/listing/listing-types/withTypeSpecificData'

import getAvailabilityCalculator from 'utils/getAvailabilityCalculator'

/**
 * Renders the Price component with the offer price
 * at the time of purchase/sale (and not current value)
 *
 */
const OfferPrice = ({ listing, offer }) => {
  if (!listing || !offer) {
    return null
  }

  const range = `${offer.startDate}/${offer.endDate}`

  const quantity = offer.quantity || 1

  const availability = getAvailabilityCalculator(listing)

  const PriceComp = withTypeSpecificData(Price)

  return (
    <PriceComp
      listing={listing}
      offer={offer}
      range={range}
      availability={availability}
      quantity={quantity}
      priceProp="totalPrice"
    />
  )
}

export default OfferPrice
