import React from 'react'
import { FormattedMessage } from 'react-intl'

export const PendingBadge = () => (
  <span className="pending badge">
    <FormattedMessage
      id={'badges.pending'}
      defaultMessage={'Pending'}
    />
  </span>
)

export const SoldBadge = () => (
  <span className="sold badge">
    <FormattedMessage
      id={'badges.sold'}
      defaultMessage={'Sold'}
    />
  </span>
)
