import React from 'react'
import { fbt } from 'fbt-runtime'
import get from 'lodash/get'

import Price from 'components/Price'

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
      <div className="summary">
        <fbt desc="Loading...">Loading...</fbt>
      </div>
    )
  }

  return (
    <div className="summary">
      <div className="summary-row">
        <div className="summary-name">
          <fbt desc="PurchaseSummary.name">Item</fbt>
        </div>
        <div className="summary-value">{listing.title}</div>
      </div>
      {listing.multiUnit && quantity && (
        <div className="summary-row">
          <div className="summary-name">
            <fbt desc="PurchaseSummary.Quantity">Quantity</fbt>
          </div>
          <div className="summary-value">{quantity}</div>
        </div>
      )}
      {startDate && (
        <div className="summary-row">
          <div className="summary-name">
            <fbt desc="PurchaseSummary.checkIn">Check In</fbt>
          </div>
          <div className="summary-value">{startDate}</div>
        </div>
      )}
      {endDate && (
        <div className="summary-row">
          <div className="summary-name">
            <fbt desc="PurchaseSummary.checkOut">Check Out</fbt>
          </div>
          <div className="summary-value">{endDate}</div>
        </div>
      )}
      {shippingAddress && (
        <div className="summary-row">
          <div className="summary-name">
            <fbt desc="PurchaseSummary.shippingAddress">Shipping Address</fbt>
          </div>
          <div className="summary-value">
            <div>{shippingAddress.name}</div>
            <div>{shippingAddress.address1}</div>
            <div>{shippingAddress.address2}</div>
            <div>{shippingAddress.city}</div>
            <div>{`${shippingAddress.stateProvinceRegion} ${shippingAddress.postalCode}`}</div>
            <div>{shippingAddress.country}</div>
            <div>{shippingAddress.instructions}</div>
          </div>
        </div>
      )}
      <div className="summary-row">
        <div className="summary-name">
          <fbt desc="PurchaseSummary.totalPrice">Total Price</fbt>
        </div>
        <div className="summary-value">
          <Price price={totalPrice} />
        </div>
      </div>
      <div className="summary-row">
        <div className="summary-name">
          <fbt desc="PurchaseSummary.Payment">Payment</fbt>
        </div>
        <div className="summary-value">
          <Price price={totalPrice} target={paymentMethod} />
        </div>
      </div>
    </div>
  )
}

export default PurchaseSummary
