import React from 'react'

import { useStateValue } from 'data/state'

import Link from 'components/Link'

const CheckoutContact = () => {
  const [{ cart }] = useStateValue()
  const { userInfo } = cart
  if (!userInfo) return null

  return (
    <div className="info-row">
      <div className="label">Contact</div>
      <div className="value">{userInfo.email}</div>
      <Link className="change" to="/checkout">
        Change
      </Link>
    </div>
  )
}

export default CheckoutContact
