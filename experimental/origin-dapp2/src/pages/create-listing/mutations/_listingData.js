import pick from 'lodash/pick'

export default function applyListingData(props, data) {
  const { listing, listingType } = props

  const variables = {
    ...data,
    autoApprove: true,
    data: {
      title: listing.title,
      description: listing.description,
      price: { currency: 'ETH', amount: listing.price },
      category: listing.category,
      subCategory: listing.subCategory,
      media: listing.media.map(m => pick(m, 'contentType', 'url')),
      commissionPerUnit: listing.boost
    }
  }
  if (listingType === 'unit') {
    const unitsTotal = Number(listing.quantity)
    variables.unitData = { unitsTotal }
    variables.commission = unitsTotal > 1 ? listing.boostLimit : listing.boost
  } else if (listingType === 'fractional') {
    variables.fractionalData = {
      weekendPrice: { currency: 'ETH', amount: listing.weekendPrice },
      booked: listing.booked,
      customPricing: listing.customPricing,
      unavailable: listing.unavailable
    }
    variables.commission = listing.boostLimit
  }

  return variables
}
