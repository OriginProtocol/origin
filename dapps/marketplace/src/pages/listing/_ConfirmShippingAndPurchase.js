import React from 'react'

import Link from 'components/Link'
import UserActivationLink from 'components/UserActivationLink'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'

import { fbt } from 'fbt-runtime'

/**
 * Renders a button that takes you to
 *  - Onboarding, if user doesn't have an identity
 *  - "Shipping Address" screen, if user has identity and listing requires shipping
 *  - "Confirm Purchase" screen, if user has identity and listing  doesn't require shipping
 */
const ConfirmShippingAndPurchase = ({ identity, wallet, className, children, listing }) => {
  const hasIdentity = localStorage.noIdentity || identity

  if (!hasIdentity || !wallet) {
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
      to={`/listing/${listing.id}/${listing.requiresShipping ? 'shipping' : 'confirm'}`}
      className={className}
      children={children || <fbt desc="Purchase">Purchase</fbt>}
    />
  )
}

export default withWallet(withIdentity(ConfirmShippingAndPurchase))
