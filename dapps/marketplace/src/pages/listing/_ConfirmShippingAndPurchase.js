import React from 'react'

import Link from 'components/Link'
import UserActivationLink from 'components/UserActivationLink'

import withMessagingStatus from 'hoc/withMessagingStatus'

import { fbt } from 'fbt-runtime'

/**
 * Renders a button that takes you to
 *  - Onboarding, if user doesn't have an identity
 *  - "Shipping Address" screen, if user has identity and listing requires shipping
 *  - "Confirm Purchase" screen, if user has identity and listing  doesn't require shipping
 */
const ConfirmShippingAndPurchase = ({
  hasMessagingKeys,
  className,
  children,
  listing,
  disabled,
  messagingStatusLoading
}) => {
  if (messagingStatusLoading) {
    return (
      <button
        className={className}
        children={<fbt desc="Loading...">Loading...</fbt>}
        disabled={true}
      />
    )
  }

  if (!hasMessagingKeys) {
    return (
      <UserActivationLink
        className={className}
        children={children}
        location={{ pathname: `/listing/${listing.id}` }}
      />
    )
  }

  return (
    <Link
      to={`/listing/${listing.id}/${
        listing.requiresShipping ? 'shipping' : 'confirm'
      }`}
      className={className}
      children={children || <fbt desc="Purchase">Purchase</fbt>}
      disabled={disabled === true}
    />
  )
}

export default withMessagingStatus(ConfirmShippingAndPurchase, {
  excludeData: true
})
