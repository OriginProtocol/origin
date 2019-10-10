import React from 'react'
import { fbt } from 'fbt-runtime'

import Price from 'components/Price'

const SummaryItem = ({ label, value, columnar }) => {
  return (
    <div className={`summary-item${columnar ? ' columnar' : ''}`}>
      <div className="summary-name">{label}</div>
      <div className="summary-value">{value}</div>
    </div>
  )
}

const PurchaseSummary = ({
  listing,
  quantity,
  totalPrice,
  shippingAddress,
  startDate,
  endDate,
  paymentMethod,
  tokenStatus = {}
}) => {
  const { loading } = tokenStatus

  if (loading) {
    return (
      <div className="purchase-summary">
        <fbt desc="Loading...">Loading...</fbt>
      </div>
    )
  }

  return (
    <div className="purchase-summary">
      <div className="listing-title">{listing.title}</div>
      {listing.multiUnit && quantity && (
        <SummaryItem
          label={<fbt desc="PurchaseSummary.Quantity">Quantity</fbt>}
          value={quantity}
        />
      )}
      {startDate && (
        <SummaryItem
          label={<fbt desc="PurchaseSummary.checkIn">Check In</fbt>}
          value={startDate}
        />
      )}
      {endDate && (
        <SummaryItem
          label={<fbt desc="PurchaseSummary.checkOut">Check Out</fbt>}
          value={endDate}
        />
      )}
      <SummaryItem
        label={<fbt desc="PurchaseSummary.totalPrice">Total Price</fbt>}
        value={<Price price={totalPrice} />}
      />
      <SummaryItem
        label={<fbt desc="PurchaseSummary.Payment">Payment</fbt>}
        value={<Price price={totalPrice} target={paymentMethod} />}
      />
      {shippingAddress && (
        <SummaryItem
          label={
            <fbt desc="PurchaseSummary.shippingAddress">Shipping Address</fbt>
          }
          value={
            <>
              <div>{shippingAddress.name}</div>
              <div>{shippingAddress.address1}</div>
              <div>{shippingAddress.address2}</div>
              <div>{shippingAddress.city}</div>
              <div>{`${shippingAddress.stateProvinceRegion} ${shippingAddress.postalCode}`}</div>
              <div>{shippingAddress.country}</div>
              <div>{shippingAddress.instructions}</div>
            </>
          }
          columnar
        />
      )}
    </div>
  )
}

export default PurchaseSummary

require('react-styl')(`
  .purchase-summary
    padding: 1.25rem
    background-color: #f3f7f9
    border: solid 1px #eaf0f3
    border-radius: 10px
    margin-bottom: 1.5rem
    margin-bottom: 0.5rem
    margin: 0 auto
    width: 100%
    .listing-title
      font-size: 24px
      font-weight: bold
      text-align: left
      margin-bottom: 1rem
    .summary-item
      display: flex
      width: 100%
      margin-bottom: 1rem
      .summary-name
        font-size:  1.125rem
        flex: 50% 0 0
        text-align: left
      .summary-value
        flex: 50% 0 0
        font-size: 1.125rem
        font-weight: 700
        text-align: right
      &.columnar
        flex-direction: column
        border-top: solid 1px #eaf0f3
        padding-top: 1rem
        .summary-name
          font-weight: 700
          flex: 1
        .summary-value
          text-align: left
          font-weight: normal
          flex: 1
          line-height: 1.5

  @media (max-width: 767.98px)
    .purchase-summary
      border-radius: 0
`)
