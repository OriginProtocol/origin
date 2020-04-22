import React, { useState } from 'react'
import get from 'lodash/get'

import CartIcon from 'components/icons/Cart'
import Caret from 'components/icons/Caret'
import formatPrice from 'utils/formatPrice'
import useConfig from 'utils/useConfig'

import CheckoutItem from './CheckoutItem'
import Discount from './Discount'
import Donation from './Donation'

function summaryNote(note, cart) {
  const donation = cart.donation || 0
  return note.replace(/\{subTotal\}/g, formatPrice(cart.subTotal + donation))
}

const OrderSummary = ({ cart, discountForm = false, donationForm = false }) => {
  const { config } = useConfig()
  if (!cart || !cart.items) return null
  const donateTo = get(config, 'donations.name')

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
        <div className="txt">
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
        {discountForm ? <Discount cart={cart} /> : null}
        {donationForm ? <Donation cart={cart} /> : null}
        <div className="sub-total">
          <div>
            <div>Subtotal</div>
            <div>
              <b>{formatPrice(cart.subTotal)}</b>
            </div>
          </div>
          {!cart.donation ? null : (
            <div>
              <div>{`Donation${donateTo ? ` to ${donateTo}` : ''}`}</div>
              <div>
                <b>{formatPrice(cart.donation)}</b>
              </div>
            </div>
          )}
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
        {!config.cartSummaryNote ? null : (
          <div
            dangerouslySetInnerHTML={{
              __html: summaryNote(config.cartSummaryNote, cart)
            }}
            className="note"
          />
        )}
      </div>
    </>
  )
}

export default OrderSummary

require('react-styl')(`
  .order-summary
    max-width: 430px
    .note
      text-align: center
      border: 1px solid #000
      border-radius: 2px
      margin-top: 1rem
      padding: 0.5rem
      a
        color: #007fff

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
    .sub-total,.total,.discount,.donation
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
