import React from 'react'

import { fbt } from 'fbt-runtime'

import Price from 'components/Price'

const PurchaseSummary = ({
  listing,
  quantity,
  totalPrice,
  token,
  shippingAddress,
  startDate,
  endDate,
  tokenStatus
}) => {
  const { hasBalance, hasEthBalance, loading } = tokenStatus || {}

  if (loading) {
    return (
      <div className="summary">
        <fbt desc="Loading...">Loading...</fbt>
      </div>
    )
  }

  const acceptedTokens = listing.acceptedTokens

  const isEth = token === 'token-ETH'
  const isDai = token === 'token-DAI'
  const acceptsDai = acceptedTokens.find(t => t.id === 'token-DAI')

  const needsSwap = isDai && acceptsDai && !hasBalance && hasEthBalance

  const displayToken = isEth || needsSwap ? 'token-ETH' : 'token-DAI'

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
            <div>{shippingAddress.other}</div>
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
          <Price price={totalPrice} target={displayToken} />
        </div>
      </div>
    </div>
  )
}

export default PurchaseSummary
