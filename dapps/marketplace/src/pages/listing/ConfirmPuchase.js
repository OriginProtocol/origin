import React from 'react'

import { fbt } from 'fbt-runtime'

import { withRouter } from 'react-router-dom'

import DocumentTitle from 'components/DocumentTitle'
import MobileModalHeader from 'components/MobileModalHeader'
import Redirect from 'components/Redirect'

import withIsMobile from 'hoc/withIsMobile'

import getAvailabilityCalculator from 'utils/getAvailabilityCalculator'

import BuySingleUnitMutation from './listing-types/single-unit/BuySingleUnitMutation'
import SingleUnitSummary from './listing-types/single-unit/SingleUnitSummary'

import BuyMultiUnitMutation from './listing-types/multi-unit/BuyMultiUnitMutation'
import MultiUnitSummary from './listing-types/multi-unit/MultiUnitSummary'

import BuyFractionalHourlyMutation from './listing-types/fractional-hourly/BuyFractionalHourlyMutation'
import FractionalHourlySummary from './listing-types/fractional-hourly/FractionalHourlySummary'

import BuyFractionalMutation from './listing-types/fractional/BuyFractionalMutation'
import FractionalSummary from './listing-types/fractional/FractionalSummary'

const ConfirmPurchase = ({
  listing,
  quantity,
  isMobile,
  history,
  refetch,
  shippingAddress,
  bookingRange,
  paymentMethod
}) => {
  if (!paymentMethod) {
    return <Redirect to={`/listing/${listing.id}/payment`} />
  }

  const singleUnit =
    listing.__typename === 'UnitListing' && listing.unitsTotal === 1
  const multiUnit = listing.multiUnit
  const isFractional = listing.__typename === 'FractionalListing'
  const isFractionalHourly = listing.__typename === 'FractionalHourlyListing'
  const isService = listing.__typename === 'ServiceListing'

  let BuyMutationComponent, SummaryComponent

  const availability = getAvailabilityCalculator(listing)

  switch (true) {
    case multiUnit:
    case isService:
      BuyMutationComponent = BuyMultiUnitMutation
      SummaryComponent = MultiUnitSummary
      break

    case isFractional:
      BuyMutationComponent = BuyFractionalMutation
      SummaryComponent = FractionalSummary
      break

    case isFractionalHourly:
      BuyMutationComponent = BuyFractionalHourlyMutation
      SummaryComponent = FractionalHourlySummary
      break

    case singleUnit:
    default:
      BuyMutationComponent = BuySingleUnitMutation
      SummaryComponent = SingleUnitSummary
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
        <MobileModalHeader onBack={() => history.goBack()}>
          <fbt desc="ConfirmPurchase.mobileTitle">Confirm Purchase</fbt>
        </MobileModalHeader>
      )}
      <div className="confirm-purchase-content">
        <SummaryComponent
          listing={listing}
          quantity={quantity}
          range={bookingRange}
          shippingAddress={shippingAddress}
          availability={availability}
          paymentMethod={paymentMethod}
        />
        <div className="actions">
          <BuyMutationComponent
            listing={listing}
            refetch={refetch}
            quantity={quantity}
            range={bookingRange}
            shippingAddress={shippingAddress}
            availability={availability}
            paymentMethod={paymentMethod}
          />
          {isMobile ? null : (
            <button
              className="btn btn-outline-primary btn-rounded"
              onClick={() => history.goBack()}
            >
              <fbt desc="Back">Back</fbt>
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
      .actions
        padding-top: 1.5rem
        display: flex
        flex-direction: row-reverse
        .btn
          width: 100%
          padding: 0.875rem 0
          margin: 1rem 1rem 0 1rem
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
          flex-direction: column
          .btn
            margin-left: 0
            margin-right: 0
`)
