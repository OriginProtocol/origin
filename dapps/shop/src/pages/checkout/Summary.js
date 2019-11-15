import React, { useState } from 'react'
import get from 'lodash/get'

import CartIcon from 'components/icons/Cart'
import Caret from 'components/icons/Caret'
import formatPrice from 'utils/formatPrice'

import CheckoutItem from './CheckoutItem'

const OrderSummary = ({ cart }) => {
  if (!cart || !cart.items) return null

  const [summary, showSummary] = useState(false)

  return (
    <>
      <a
        className={`toggle-order-summary d-md-none${summary ? ' active' : ''}`}
        href="#"
        onClick={e => {
          e.preventDefault()
          showSummary(!summary)
        }}
      >
        <div className="toggle">
          <CartIcon />
          {`${summary ? 'Hide' : 'Show'} order summary`}
          <Caret />
        </div>
        <div>
          <b>{formatPrice(cart.total)}</b>
        </div>
      </a>
      <div className={`order-summary ${summary ? ' show' : ''}`}>
        <div className="items">
          {cart.items.map((item, idx) => (
            <CheckoutItem key={idx} item={item} />
          ))}
        </div>
        <div className="sub-total">
          <div>
            <div>Subtotal</div>
            <div>
              <b>{formatPrice(cart.subTotal)}</b>
            </div>
          </div>
          <div>
            <div>Shipping</div>
            {cart.shipping ? (
              <div>
                <b>{formatPrice(get(cart, 'shipping.amount'))}</b>
              </div>
            ) : (
              <div>Calculated at next step</div>
            )}
          </div>
        </div>
        <div className="total">
          <div>
            <div>Total</div>
            <div>
              <b>{formatPrice(cart.total)}</b>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderSummary

require('react-styl')(`
  .order-summary
    max-width: 430px
    .item
      display: flex
      align-items: center
      margin-bottom: 1rem
      width: 100%
      .title
        font-weight: bold
        flex: 1
        padding-right: 1rem
        .cart-options
          font-size: 0.8rem
          font-weight: normal
      .price
        font-weight: bold
      .image
        position: relative
        margin-right: 1rem
        .product-pic
          border-radius: 0.5rem
          border: 1px solid #ddd
          min-width: 3rem
        span
          position: absolute
          display: block
          top: -0.5rem
          right: -0.5rem
          padding: 0.125rem 0.5rem
          background: #999
          color: #fff
          border-radius: 1rem
          font-size: 0.75rem
    img
      max-width: 60px
    .sub-total,.total
      margin-top: 1rem
      padding-top: 1rem
      border-top: 1px solid #ddd
      > div
        display: flex
        justify-content: space-between
        margin-bottom: 0.5rem
    .total
      font-size: 1.25rem

`)
