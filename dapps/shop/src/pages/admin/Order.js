import React from 'react'
import { useRouteMatch } from 'react-router-dom'
import get from 'lodash/get'

import useOrder from 'utils/useOrder'
import formatAddress from 'utils/formatAddress'
import Summary from '../checkout/Summary'

const OrderDetails = ({ cart }) => {
  if (!cart) {
    return <div>Loading...</div>
  }

  return (
    <div className="checkout-confirmation">
      {!cart.offerId ? null : <h3>{`Order #${cart.offerId}`}</h3>}

      <div className="customer-info">
        <div className="row mt-3">
          <div className="col-md-6">
            <h5>Contact information</h5>
            <div className="value">{get(cart, 'userInfo.email')}</div>
          </div>
          <div className="col-md-6">
            <h5>Payment method</h5>
            <div className="value">{get(cart, 'paymentMethod.label')}</div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-6">
            <h5>Shipping address</h5>
            <div className="value">
              {formatAddress(cart.userInfo).map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
          <div className="col-md-6">
            <h5>Billing address</h5>
            <div className="value">
              {formatAddress(cart.userInfo).map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-6">
            <h5>Shipping method</h5>
            {get(cart, 'shipping.label')}
          </div>
        </div>
      </div>
    </div>
  )
}

const AdminOrder = () => {
  const match = useRouteMatch('/admin/orders/:orderId')
  const order = useOrder(match.params.orderId)
  if (!order) {
    return null
  }
  return (
    <div className="checkout">
      <OrderDetails cart={order.data} />
      <div className="mt-4">
        <h5 className="mb-3">Order Summary</h5>
        <Summary cart={order.data} />
      </div>
    </div>
  )
}

export default AdminOrder
