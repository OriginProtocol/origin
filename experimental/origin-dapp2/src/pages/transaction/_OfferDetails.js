import React from 'react'
import TokenPrice from 'components/TokenPrice'
import dayjs from 'dayjs'

const OfferDetails = ({ offer }) => (
  <ul className="offer-details list-unstyled">
    {offer.listing.__typename === 'FractionalListing' ? null : (
      <>
        {offer.quantity === 1 ? null : (
          <li className="price-unit">
            <span>Price / unit</span>
            <span>
              <TokenPrice {...offer.listing.price} />
            </span>
          </li>
        )}
        <li className="quantity">
          <span>Quantity</span>
          <span>{offer.quantity}</span>
        </li>
      </>
    )}
    {!offer.startDate ? null : (
      <li className="start-date">
        <span>Check in</span>
        <span>{dayjs(offer.startDate).format('MMM. D, YYYY')}</span>
      </li>
    )}
    {!offer.endDate ? null : (
      <li className="end-date">
        <span>Check out</span>
        <span>{dayjs(offer.endDate).format('MMM. D, YYYY')}</span>
      </li>
    )}
    <li className="total-price">
      <span>Total Price</span>
      <span>
        <TokenPrice {...offer} />
      </span>
    </li>
    <li className="payment-status">
      <span>Payment Status</span>
      <span>{offer.statusStr}</span>
    </li>
    <li className="offer-date">
      <span>Offer Date</span>
      <span>
        {offer.createdEvent
          ? dayjs.unix(offer.createdEvent.timestamp).format('MMM. D, YYYY')
          : ''}
      </span>
    </li>
    <li className="offer-number">
      <span>Offer Number</span>
      <span>{offer.id}</span>
    </li>
    {/*
    <li className="security-deposit">
      <span>Security Deposit</span>
      <span>$200.00</span>
    </li>
    <li className="damages">
      <span>Damages</span>
      <span>$100.00</span>
    </li>
    */}
  </ul>
)

export default OfferDetails

require('react-styl')(`
  .offer-details
    background: var(--pale-grey-eight)
    border-radius: 5px
    font-size: 18px
    font-weight: normal
    padding: 1rem 1.5rem
    li
      display: flex;
      justify-content: space-between;
      padding: 0.375rem 0 0.375rem 1.25rem
      span:nth-child(1)
        color: var(--dusk)
      span:nth-child(2)
        color: #000
      background-position: left center
      background-repeat: no-repeat
      background-size: 0.75rem
      &.price-unit
        background-image: url(images/order/price-unit-icon.svg)
      &.quantity
        background-image: url(images/order/quantity-icon.svg)
      &.total-price
        background-image: url(images/order/total-price-icon.svg)
      &.payment-status
        background-image: url(images/order/payment-status-icon.svg)
      &.offer-date
        background-image: url(images/order/offer-date-icon.svg)
      &.offer-number
        background-image: url(images/order/offer-number-icon.svg)
      &.start-date
        background-image: url(images/order/start-date-icon.svg)
      &.end-date
        background-image: url(images/order/end-date-icon.svg)
      &.security-deposit
        background-image: url(images/order/security-deposit-icon.svg)
      &.damages
        background-image: url(images/order/damages-icon.svg)

`)
