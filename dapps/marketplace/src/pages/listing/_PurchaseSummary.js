import React from 'react'

const PurchaseSummary = ({ listing, quantity, prices, token, tokenStatus, shippingAddress, bookingRange }) => {
  return (
    <div className="summary">
      <div className="summary-row">
        <div className="summary-name">Purchase Item</div>
        <div className="summary-value">{listing.title}</div>
      </div>
      {quantity && (
        <div className="summary-row">
          <div className="summary-name">Quantity</div>
          <div className="summary-value">{quantity}</div>
        </div>
      )}
      <div className="summary-row">
        <div className="summary-name">Total price</div>
        <div className="summary-value">$0.95</div>
      </div>
      <div className="summary-row">
        <div className="summary-name">Payment</div>
        <div className="summary-value">124 ETH</div>
      </div>
    </div>
  )
}

export default PurchaseSummary