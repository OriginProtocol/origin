import React from 'react'
import get from 'lodash/get'
import dayjs from 'dayjs'

import Summary from '../../checkout/Summary'

import formatAddress from 'utils/formatAddress'

const AdminOrderDetails = ({ order }) => {
  const cart = get(order, 'data')
  if (!cart) {
    return <div>Loading...</div>
  }

  const phone = get(cart, 'userInfo.phone')

  return (
    <div className="order-details">
      <div className="customer-info">
        <div>Date</div>
        <div>{dayjs(order.createdAt).format('MMM D, h:mm A')}</div>
        <div>Customer</div>
        <div>
          <div>{get(cart, 'userInfo.email')}</div>
          <div>{!phone ? null : `☎ ${phone}`}</div>
        </div>
        <div>Payment</div>
        <div>{get(cart, 'paymentMethod.label')}</div>
        <div>Shipping</div>
        <div>{get(cart, 'shipping.label')}</div>
        <div>Ship to</div>
        <div>
          {formatAddress(cart.userInfo).map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
        <div>Bill to</div>
        <div>
          {cart.userInfo.billingDifferent
            ? formatAddress(cart.userInfo, 'billing').map((line, idx) => (
                <div key={idx}>{line}</div>
              ))
            : 'Same as shipping address'}
        </div>
      </div>
      <div className="mb-4">
        <h5 className="mb-3">Order Summary</h5>
        <Summary cart={cart} />
      </div>
    </div>
  )
}

export default AdminOrderDetails

require('react-styl')(`
  .admin
    .order-details
      display: flex
      flex-wrap: wrap-reverse
      margin-top: 2rem
      color: #000
      > div:nth-child(2)
        flex: 2
      .order-summary
        max-width: 350px
      .customer-info
        flex: 2
        margin-right: 3rem
        display: grid
        grid-column-gap: 1.5rem
        grid-row-gap: 1.5rem
        grid-template-columns: 5rem 1fr
        > div:nth-child(odd)
          font-weight: 600
`)
