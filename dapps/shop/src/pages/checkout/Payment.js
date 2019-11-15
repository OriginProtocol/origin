import React from 'react'

import Link from 'components/Link'
import Site from 'constants/Site'
import Contact from './_Contact'
import ShipTo from './_ShipTo'
import ChoosePayment from './ChoosePayment'
import BetaWarning from './_BetaWarning'

const CheckoutPayment = () => {
  return (
    <div className="checkout-shipping">
      <div className="d-none d-md-block">
        <h3>{Site.fullTitle}</h3>
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
          <div className="value">
            Standard Shipping <b>$5.00</b>
          </div>
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

require('react-styl')(`
  .checkout-payment-method
    border: 1px solid #eee
    border-radius: 0.5rem
    padding: 1rem 1rem 0.5rem 1rem
`)
