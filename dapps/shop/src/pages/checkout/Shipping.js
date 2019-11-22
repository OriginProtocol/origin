import React, { useEffect } from 'react'
import get from 'lodash/get'

import { useStateValue } from 'data/state'
import { Countries } from 'data/Countries'
import formatPrice from 'utils/formatPrice'
import useShippingZones from 'utils/useShippingZones'
import Site from 'constants/Site'
import Link from 'components/Link'
import Contact from './_Contact'
import ShipTo from './_ShipTo'
import BetaWarning from './_BetaWarning'

const CheckoutShipping = () => {
  const [{ cart }, dispatch] = useStateValue()
  const { shippingZones, loading } = useShippingZones()

  const country = get(cart, 'userInfo.country')
  const countryCode = get(Countries, `${country}.code`)
  const defaultShippingZone = shippingZones.find(zone => !zone.countries)
  const filteredShippingZones = shippingZones.filter(
    zone => (zone.countries || []).indexOf(countryCode) >= 0
  )
  if (!filteredShippingZones.length && defaultShippingZone) {
    filteredShippingZones.push(defaultShippingZone)
  }

  useEffect(() => {
    const selected = get(cart, 'shipping.id')
    const hasSelected = filteredShippingZones.find(z => z.id === selected)
    if (!cart.shipping || !hasSelected) {
      const zone = filteredShippingZones[0]
      if (zone) {
        dispatch({ type: 'updateShipping', zone })
      }
    }
  }, [shippingZones.length])

  return (
    <div className="checkout-shipping">
      <div className="d-none d-md-block">
        <h3>{Site.fullTitle}</h3>
        <div className="breadcrumbs">
          <Link to="/cart">Cart</Link>
          <Link to="/checkout">Information</Link>
          <span>
            <b>Shipping</b>
          </span>
          <span>Payment</span>
        </div>
      </div>
      <div className="checkout-review-info">
        <Contact />
        <ShipTo />
      </div>
      <div className="mt-4 mb-3">
        <b>Shipping Method</b>
      </div>
      <div className="checkout-payment-method">
        {loading ? <div>Loading...</div> : null}
        {filteredShippingZones.map(zone => (
          <label
            key={zone.id}
            className={`radio ${
              get(cart, 'shipping.id') === zone.id ? 'active' : 'inactive'
            }`}
          >
            <input
              type="radio"
              name="shippingMethod"
              checked={get(cart, 'shipping.id') === zone.id}
              onChange={() => dispatch({ type: 'updateShipping', zone })}
            />
            <div>
              <div>{zone.label}</div>
              <div className="description">{zone.detail}</div>
            </div>
            <span className="ml-auto">
              {zone.amount ? formatPrice(zone.amount) : 'Free'}
            </span>
          </label>
        ))}
      </div>
      <div className="actions">
        <Link to="/checkout">&laquo; Return to information</Link>
        <Link to="/checkout/payment" className="btn btn-primary btn-lg">
          Continue to payment
        </Link>
      </div>

      <BetaWarning />
    </div>
  )
}

export default CheckoutShipping

require('react-styl')(`
  .checkout-review-info
    border: 1px solid #eee
    border-radius: 0.5rem
    padding: 0 1rem
    .info-row
      display: flex
      justify-content: space-between
      border-bottom: 1px solid #eee
      padding: 1rem 0
      &:last-of-type
        border: 0
      .label
        color: #666
        width: 100px
      .value
        flex: 1
      .change
        text-align: right
        font-size: 0.75rem
      a
        color: #1990c6
  @media (max-width: 767.98px)
    .checkout-review-info
      .info-row
        flex-wrap: wrap
        .label
          width: 70%
        .value
          width: 100%
          order: 3
        .change
          width: 30%
`)
