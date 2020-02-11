import React, { useState } from 'react'
import get from 'lodash/get'

import CartIcon from 'components/Icon/Cart'
import Caret from 'components/Icon/Caret'
import formatAddress from 'utils/formatAddress'
import formatPrice from 'utils/formatPrice'

const OrderDetail = ({ cart }) => {
  const [summary, showSummary] = useState(false)

  console.log(cart)

  return (
    <div className="checkout">
      <div className="checkout-confirmation">
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
      <div className="mt-4">
        <h5 className="mb-3">Order Summary</h5>
        <a
          className={`toggle-order-summary d-md-none${
            summary ? ' active' : ''
          }`}
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
              <div className="item" key={idx}>
                <div className="image">
                  {/* <VariantPic variant={variant} product={product} /> */}
                  <span>{item.quantity}</span>
                </div>
                <div className="title">
                  <div>{item.product}</div>
                  {/* <VariantOptions variant={variant} product={product} /> */}
                </div>
                {/* <div className="price">{formatPrice(item.quantity * variant.price)}</div> */}
              </div>
            ))}
          </div>
          {/* {discountForm ? <Discount cart={cart} /> : null} */}
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
                  <b>
                    {formatPrice(get(cart, 'shipping.amount'), { free: true })}
                  </b>
                </div>
              ) : (
                <div>Calculated at next step</div>
              )}
            </div>
            {!cart.discount ? null : (
              <div>
                <div>{`Discount: ${get(
                  cart,
                  'discountObj.code',
                  ''
                ).toUpperCase()}`}</div>
                <div>
                  <b>{formatPrice(cart.discount)}</b>
                </div>
              </div>
            )}
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
      </div>
    </div>
  )
}

export default OrderDetail

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
  .sub-total,.total,.discount
    margin-top: 1rem
    padding-top: 1rem
    border-top: 1px solid #ddd
    > div
      display: flex
      justify-content: space-between
      margin-bottom: 0.5rem
  .total
    font-size: 1.25rem

@media (max-width: 767.98px)
  .toggle-order-summary
    display: flex
    justify-content: space-between
    .toggle
      color: #1990c6
    .icon-caret
      fill: #1990c6
      margin-left: 0.5rem
    .icon-cart
      margin-right: 0.5rem
      width: 1.5rem
    &.active
      .icon-caret
        transform: scaleY(-1)
  .order-summary
    margin-top: 2rem
    display: none
    &.show
      display: block
`)
