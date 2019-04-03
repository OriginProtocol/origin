import React from 'react'
import Price from 'components/Price'
import dayjs from 'dayjs'
import { fbt } from 'fbt-runtime'

const OfferDetails = ({ offer }) => (
  <ul className="offer-details list-unstyled">
    {offer.listing.__typename === 'FractionalListing' ||
    offer.listing.__typename === 'FractionalHourlyListing' ||
    offer.quantity === 1 ? null : (
      <>
        <li className="price-unit">
          <span>
            <fbt desc="OfferDetails.pricePerUnit">Price / unit</fbt>
          </span>
          <span>
            <Price price={offer.listing.price} />
          </span>
        </li>
        <li className="quantity">
          <span>
            <fbt desc="OfferDetails.quantity">Quantity</fbt>
          </span>
          <span>{offer.quantity}</span>
        </li>
      </>
    )}
    {offer.startDate && offer.listing.__typename === 'FractionalListing' && (
      <li className="start-date">
        <span>
          <fbt desc="OfferDetails.checkIn">Check in</fbt>
        </span>
        <span>{dayjs(offer.startDate).format('MMM. D, YYYY ')}</span>
      </li>
    )}
    {offer.endDate && offer.listing.__typename === 'FractionalListing' && (
      <li className="end-date">
        <span>
          <fbt desc="OfferDetails.checkOut">Check out</fbt>
        </span>
        <span>{dayjs(offer.endDate).format('MMM. D, YYYY')}</span>
      </li>
    )}
    {offer.startDate && offer.listing.__typename === 'FractionalHourlyListing' && (
      <li className="start-date">
        <span>
          <fbt desc="OfferDetails.rentalBegin">Rental begin</fbt>
        </span>
        <span>{dayjs(offer.startDate).format('MMM. D, YYYY h:00a')}</span>
      </li>
    )}
    {offer.endDate && offer.listing.__typename === 'FractionalHourlyListing' && (
      <li className="end-date">
        <span>
          <fbt desc="OfferDetails.rentalEnd">Rental end</fbt>
        </span>
        <span>{dayjs(offer.endDate).format('MMM. D, YYYY h:00a')}</span>
      </li>
    )}
    <li className="total-price">
      <span>
        {offer.quantity > 1 ? (
          <fbt desc="OfferDetails.totalPrice">Total Price</fbt>
        ) : (
          <fbt desc="OfferDetails.price">Price</fbt>
        )}
      </span>
      <span>
        <Price
          price={{
            ...offer.listing.price,
            amount: offer.listing.price.amount * offer.quantity
          }}
        />
      </span>
    </li>
    <li className="offer-date">
      <span>
        <fbt desc="OfferDetails.offerDate">Offer Date</fbt>
      </span>
      <span>
        {offer.createdEvent
          ? dayjs.unix(offer.createdEvent.timestamp).format('MMM. D, YYYY')
          : ''}
      </span>
    </li>
    <li className="offer-number">
      <span>
        <fbt desc="OfferDetails.offerNumber">Offer Number</fbt>
      </span>
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
    border-radius: var(--default-radius)
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
        span
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
