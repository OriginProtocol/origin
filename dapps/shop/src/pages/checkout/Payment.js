import React from 'react'
import get from 'lodash/get'

import { useStateValue } from 'data/state'

import Link from 'components/Link'
import useConfig from 'utils/useConfig'
import Contact from './_Contact'
import ShipTo from './_ShipTo'
import ChoosePayment from './ChoosePayment'
import BetaWarning from './_BetaWarning'

const CheckoutPayment = () => {
  const { config } = useConfig()
  const [{ cart }] = useStateValue()
  return (
    <div className="checkout-shipping">
      <div className="d-none d-md-block">
        <h3>{config.fullTitle}</h3>
        <div className="breadcrumbs">
          <Link to="/cart">Cart</Link>
          <Link to="/checkout">Information</Link>
          <Link to="/checkout/shipping">Shipping</Link>
          <span>Payment</span>
        </div>
      </div>
      <div className="checkout-review-info">
        <Contact />
        <ShipTo />
        <div className="info-row">
          <div className="label">Method</div>
          <div className="value">{get(cart, 'shipping.label')}</div>
          <Link className="change" to="/checkout/shipping">
            Change
          </Link>
        </div>
      </div>
      <div className="mt-4 mb-3">
        <b>Payment</b>
        <div>All transactions are secure and encrypted</div>
      </div>

      <ChoosePayment />

      <BetaWarning />
    </div>
  )
}

export default CheckoutPayment
