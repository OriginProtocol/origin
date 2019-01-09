import React from 'react'
import { FormattedMessage } from 'react-intl'

export const BetaBadge = () => (
  <span className="badge badge-primary mt-1">
    <FormattedMessage
      id={'badges.beta'}
      defaultMessage={'Beta'}
    />
  </span>
)

export const BuyerBadge = () => (
  <span className="badge badge-dark">
    <FormattedMessage
      id={'badges.buyer'}
      defaultMessage={'Buyer'}
    />
  </span>
)

export const PendingBadge = () => (
  <span className="pending badge">
    <FormattedMessage
      id={'badges.pending'}
      defaultMessage={'Pending'}
    />
  </span>
)

export const SellerBadge = () => (
  <span className="badge badge-dark">
    <FormattedMessage
      id={'badges.seller'}
      defaultMessage={'Seller'}
    />
  </span>
)

export const SoldBadge = props => (
  <span className="sold badge">
  {props.isMultiUnit && <FormattedMessage
      id={'badges.soldOut'}
      defaultMessage={'Sold Out'}
    />
  }
  {(!props.isMultiUnit || props.isMultiUnit === undefined) && <FormattedMessage
      id={'badges.sold'}
      defaultMessage={'Sold'}
    />
  }
  </span>
)

export const FeaturedBadge = () => (
  <span className="featured badge">
    <FormattedMessage
      id={'badges.featured'}
      defaultMessage={'Featured'}
    />
  </span>
)
