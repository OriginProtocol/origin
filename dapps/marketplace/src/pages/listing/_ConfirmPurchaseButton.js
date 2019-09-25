import React from 'react'

import Link from 'components/Link'
import UserActivationLink from 'components/UserActivationLink'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'
import withMessagingStatus from 'hoc/withMessagingStatus'

import { fbt } from 'fbt-runtime'

/**
 * Renders a button that takes you to
 *  - Onboarding, if user doesn't have an identity
 *  - "Shipping Address" screen, if user has identity and listing requires shipping
 *  - "Confirm Purchase" screen, if user has identity and listing  doesn't require shipping
 */
const ConfirmPurchaseButton = ({
  hasMessagingKeys,
  className,
  children,
  listing,
  disabled,
  wallet,
  identity,
  messagingStatusLoading,
  identityLoading,
  walletLoading
}) => {
  if (messagingStatusLoading || identityLoading || walletLoading) {
    return (
      <button
        className={className}
        children={<fbt desc="Loading...">Loading...</fbt>}
        disabled={true}
      />
    )
  }

  if (
    !wallet ||
    !identity ||
    (!hasMessagingKeys &&
      !(localStorage.bypassOnboarding || localStorage.useWeb3Identity))
  ) {
    return (
      <UserActivationLink
        className={className}
        children={children}
        location={{
          pathname: `/listing/${listing.id}/payment`
        }}
      />
    )
  }

  return (
    <Link
      to={`/listing/${listing.id}/payment`}
      className={className}
      children={children || <fbt desc="Purchase">Purchase</fbt>}
      disabled={disabled === true}
    />
  )
}

export default withWallet(
  withIdentity(
    withMessagingStatus(ConfirmPurchaseButton, {
      excludeData: true
    })
  )
)
