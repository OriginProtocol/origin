import React from 'react'

import Link from 'components/Link'
import UserActivationLink from 'components/UserActivationLink'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'

import { fbt } from 'fbt-runtime'

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
