import React, { useState, useCallback } from 'react'

import { fbt } from 'fbt-runtime'

import pick from 'lodash/pick'

import { withRouter } from 'react-router-dom'

import DocumentTitle from 'components/DocumentTitle'
import Redirect from 'components/Redirect'
import MobileModalHeader from 'components/MobileModalHeader'

import withIsMobile from 'hoc/withIsMobile'

import { BuySingleUnitMutation } from './_BuySingleUnit'
import { BuyMultiUnitMutation } from './_BuyMultiUnit'



const ConfirmPurchase = ({ listing, quantity, prev, isMobile, history, refetch, shippingAddress, bookingRange }) => {
  const singleUnit = !listing.multiUnit && listing.__typename === 'UnitListing'
  const multiUnit = listing.multiUnit && listing.__typename === 'UnitListing'
  const isFractional = listing.__typename === 'FractionalListing'
  const isFractionalHourly = listing.__typename === 'FractionalHourlyListing'

  let BuyMutationComponent
  switch (true) {
    case multiUnit:
      BuyMutationComponent = BuyMultiUnitMutation
      break

    case singleUnit:
    default:
      BuyMutationComponent = BuySingleUnitMutation
      break
  }

  return (
    <div className="container confirm-purchase-page">
      <DocumentTitle>
        <fbt desc="Confirm Purchase">Confirm Purchase</fbt> | {listing.title}
      </DocumentTitle>
      {!isMobile ? (
        <h1>
          <fbt desc="ConfirmPurchase.title">Please confirm your purchase</fbt>
        </h1>
      ) : (
        <MobileModalHeader
          onBack={() => {
            history.goBack()
          }}
        >
          <fbt desc="ConfirmPurchase.mobileTitle">Confirm Purchase</fbt>
        </MobileModalHeader>
      )}
      <div className="confirm-purchase-content">
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
        <div className="actions">
          <BuyMutationComponent
            listing={listing}
            refetch={refetch}
            quantity={quantity}
            bookingRange={bookingRange}
            shippingAddress={shippingAddress}
          />
          {isMobile ? null : (
            <button
              className="btn btn-outline-primary btn-rounded"
              onClick={() => history.goBack()}
            >
              <fbt desc="Cancel">Cancel</fbt>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default withRouter(withIsMobile(ConfirmPurchase))

require('react-styl')(`
  .confirm-purchase-page
    display: flex
    flex-direction: column
    height: 100%
    padding: 0
    h1
      margin-top: 5rem
      text-align: center
    .confirm-purchase-content
      display: flex
      max-width: 550px
      width: 550px
      margin: 0 auto
      flex-direction: column
      flex: 1
      .summary
        text-align: center
        padding: 1.25rem
        background-color: #f3f7f9
        border: solid 1px #eaf0f3
        border-radius: 10px
        margin-bottom: 1.5rem
        margin-bottom: 0.5rem
        margin: 0 auto
        width: 100%
        .summary-row
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
      .actions
        padding-top: 1.5rem
        .btn
          width: 100%
          padding: 0.875rem 0
          margin-top: 1rem
          border-radius: 50px
  @media (max-width: 767.98px)
    .confirm-purchase-page
      .confirm-purchase-content
        max-width: 100%
        width: 100%
        .summary
          border-radius: 0
        .actions
          padding: 1rem
          margin-top: auto
`)
