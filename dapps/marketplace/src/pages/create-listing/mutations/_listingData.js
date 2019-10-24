import pick from 'lodash/pick'
import get from 'lodash/get'

import tokenBalance from 'utils/tokenPrice'

// Translate listing from schema representation to form
// representation.
export function getStateFromListing(props) {
  const tokens = get(props, 'listing.acceptedTokens', []).map(t => t.id)
  return {
    // FractionalListing fields:
    weekendPrice: get(props, 'listing.weekendPrice.amount', ''),
    booked: get(props, 'listing.booked', []),
    customPricing: get(props, 'listing.customPricing', []),
    unavailable: get(props, 'listing.unavailable', []),

    // HourlyFractionalListing fields:
    timeZone: get(props, 'listing.timeZone', ''),
    workingHours: get(props, 'listing.workingHours', []),

    // GiftCardListing fields:
    retailer: get(props, 'listing.retailer', ''),
    cardAmount: get(props, 'listing.cardAmount', ''),
    issuingCountry: get(props, 'listing.issuingCountry', 'US'),
    isDigital: get(props, 'listing.isDigital', false),
    isCashPurchase: get(props, 'listing.isCashPurchase', false),
    receiptAvailable: get(props, 'listing.receiptAvailable', false),
    location: get(props, 'listing.location', false),

    // Marketplace creator fields:
    marketplacePublisher: get(props, 'listing.marketplacePublisher'),

    ...pick(props.listing, [
      'id',
      'contractAddr',
      '__typename',
      'title',
      'description',
      'category',
      'subCategory',
      'seller',
      'unitsAvailable'
    ]),
    // For new listings, there is no default selection.
    // However, for old listings, if no token is specified, default selection to ETH.
    acceptedTokens: props.listing.id && !tokens.length ? ['token-ETH'] : tokens,
    quantity: String(props.listing.unitsTotal),
    currency: get(props, 'listing.price.currency.id', ''),
    price: String(props.listing.price.amount),
    commission: tokenBalance(get(props, 'listing.commission', '0')),
    commissionPerUnit: tokenBalance(
      get(props, 'listing.commissionPerUnit', '0')
    ),
    media: props.listing.media,
    requiresShipping: get(props, 'listing.requiresShipping', false)
  }
}

export default function applyListingData(props, data) {
  const { listing } = props

  const variables = {
    ...data,
    autoApprove: true,
    data: {
      typename: listing.__typename,
      title: listing.title,
      description: listing.description,
      price: { currency: listing.currency, amount: listing.price },
      acceptedTokens: listing.acceptedTokens,
      category: listing.category,
      subCategory: listing.subCategory,
      location: listing.location,
      media: listing.media.map(m => pick(m, 'contentType', 'url')),
      commission: listing.commission ? String(listing.commission) : '0',
      commissionPerUnit: listing.commissionPerUnit
        ? String(listing.commissionPerUnit)
        : '0',
      marketplacePublisher: listing.marketplacePublisher,
      requiresShipping: listing.requiresShipping
    }
  }

  switch (listing.__typename) {
    case 'ServiceListing': {
      break
    }

    case 'UnitListing': {
      const unitsTotal = Number(listing.quantity)
      variables.unitData = { unitsTotal }
      break
    }

    case 'FractionalListing':
    case 'FractionalHourlyListing':
      variables.fractionalData = {
        weekendPrice: {
          currency: listing.currency,
          amount: listing.weekendPrice
        },
        timeZone: listing.timeZone,
        workingHours: listing.workingHours,
        booked: listing.booked,
        customPricing: listing.customPricing,
        unavailable: listing.unavailable
      }
      break

    case 'GiftCardListing':
      const unitsTotal = Number(listing.quantity)
      variables.unitData = {
        unitsTotal: unitsTotal,
        retailer: listing.retailer,
        cardAmount: listing.cardAmount,
        issuingCountry: listing.issuingCountry,
        isDigital: listing.isDigital,
        isCashPurchase: listing.isCashPurchase,
        receiptAvailable: listing.receiptAvailable
      }
      break

    case 'AnnouncementListing':
      break

    default:
      throw new Error(`Unknown listing.__typename: ${listing.__typename}`)
  }

  return variables
}
