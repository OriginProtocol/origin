import React, { useCallback, useEffect } from 'react'

import { fbt } from 'fbt-runtime'

import { withRouter } from 'react-router-dom'

import get from 'lodash/get'

import DocumentTitle from 'components/DocumentTitle'
import MobileModalHeader from 'components/MobileModalHeader'

import Link from 'components/Link'
import AcceptedTokenListItem from 'components/AcceptedTokenListItem'

import withIsMobile from 'hoc/withIsMobile'

import withMultiUnitData from './listing-types/multi-unit/withMultiUnitData'
import withSingleUnitData from './listing-types/single-unit/withSingleUnitData'
import withFractionalData from './listing-types/fractional/withFractionalData'
import withFractionalHourlyData from './listing-types/fractional-hourly/withFractionalHourlyData'
import Price from 'components/Price'

import InsufficientBalance from './_InsufficientBalance'
import TokenExchangeNote from './_TokenExchangeNote'

import getAvailabilityCalculator from 'utils/getAvailabilityCalculator'

const PaymentAmountRaw = ({
  paymentMethod,
  setPaymentMethod,
  totalPrice,
  tokenStatus,
  isMobile,
  history,
  next,
  token
}) => {
  const tokenObj = tokenStatus[paymentMethod]

  useEffect(() => {
    // Set suggested token as default token
    if (!paymentMethod) {
      setPaymentMethod(token)
    }
  }, [paymentMethod, token])

  if (!tokenObj || tokenObj.loading) {
    return (
      <div className="actions">
        <button className="btn btn-primary btn-rounded" disabled={true}>
          <fbt desc="Loading...">Loading...</fbt>
        </button>
      </div>
    )
  }

  let message = null
  let canTransact = true

  if (!tokenObj.hasBalance) {
    canTransact = false
    // When you don't have enough balance
    switch (paymentMethod) {
      case 'token-DAI':
        if (tokenStatus['token-ETH'].hasBalance) {
          // Has ETH. Can exchange that to DAI
          message = <TokenExchangeNote />
          canTransact = true
        } else {
          // Not enough ETH either. :/
          message = <InsufficientBalance token={paymentMethod} />
        }
        break

      case 'token-ETH':
      case 'token-OGN':
      case 'token-OKB':
      default:
        message = <InsufficientBalance token={paymentMethod} />
    }
  }

  return (
    <>
      <div className="total-payment-amount">
        <div className="label">
          <fbt desc="PaymentMethod.PaymentAmount">Payment Amount</fbt>
        </div>
        <div className="value">
          <Price price={totalPrice} target={paymentMethod} />
        </div>
      </div>
      {message}

      <div className="actions">
        {canTransact ? (
          <Link className="btn btn-primary btn-rounded" to={next}>
            <fbt desc="Continue">Continue</fbt>
          </Link>
        ) : (
          <button className="btn btn-primary btn-rounded" disabled={true}>
            <fbt desc="Continue">Continue</fbt>
          </button>
        )}
        {isMobile ? null : (
          <button
            className="btn btn-outline-primary btn-rounded"
            onClick={() => history.goBack()}
          >
            <fbt desc="Back">Back</fbt>
          </button>
        )}
      </div>
    </>
  )
}

// TODO: Is there a better way to do this?
const MultiUnitPaymentAmount = withMultiUnitData(PaymentAmountRaw)
const FractionalPaymentAmount = withFractionalData(PaymentAmountRaw)
const FractionalHourlyPaymentAmount = withFractionalHourlyData(PaymentAmountRaw)
const SingleUnitPaymentAmount = withSingleUnitData(PaymentAmountRaw)

/**
 * @returns PaymentAmountRaw component wrapped with the
 * appropriate data for the listing type
 */
const PaymentAmount = props => {
  const { listing } = props

  const singleUnit =
    listing.__typename === 'UnitListing' && listing.unitsTotal === 1
  const multiUnit = listing.multiUnit
  const isFractional = listing.__typename === 'FractionalListing'
  const isFractionalHourly = listing.__typename === 'FractionalHourlyListing'
  const isService = listing.__typename === 'ServiceListing'

  switch (true) {
    case multiUnit:
    case isService:
      return <MultiUnitPaymentAmount {...props} />

    case isFractional:
      return <FractionalPaymentAmount {...props} />

    case isFractionalHourly:
      return <FractionalHourlyPaymentAmount {...props} />

    case singleUnit:
    default:
      return <SingleUnitPaymentAmount {...props} />
  }
}

const PaymentMethods = ({
  listing,
  quantity,
  bookingRange,
  paymentMethod,
  setPaymentMethod,
  isMobile,
  history,
  next
}) => {
  const acceptedTokens = get(listing, 'acceptedTokens', []).map(t => t.id)

  const setTokenCallback = useCallback(token => setPaymentMethod(token))

  const title = <fbt desc="PaymentMethod.title">Payment Method</fbt>

  return (
    <div className="container payment-methods-page">
      <DocumentTitle>
        {title} | {listing.title}
      </DocumentTitle>
      {!isMobile ? (
        <h1>{title}</h1>
      ) : (
        <MobileModalHeader onBack={() => history.goBack()}>
          {title}
        </MobileModalHeader>
      )}
      <div className="payment-methods-content">
        <div className="my-4">
          <fbt desc="PaymentMethod.acceptedCurrencies">This seller accepts</fbt>
        </div>
        {acceptedTokens.map(token => (
          <AcceptedTokenListItem
            key={token}
            token={token}
            selected={paymentMethod === token}
            onSelect={setTokenCallback}
            hideTooltip={true}
          />
        ))}
        <PaymentAmount
          listing={listing}
          quantity={quantity}
          range={bookingRange}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          acceptedTokens={acceptedTokens}
          history={history}
          next={next}
          isMobile={isMobile}
          availability={getAvailabilityCalculator(listing)}
        />
      </div>
    </div>
  )
}

export default withRouter(withIsMobile(PaymentMethods))

require('react-styl')(`
  .payment-methods-page
    display: flex
    flex-direction: column
    height: 100%
    padding: 0
    h1
      margin-top: 5rem
      text-align: center
    .payment-methods-content
      display: flex
      max-width: 550px
      width: 550px
      margin: 0 auto
      flex-direction: column
      flex: 1
      padding: 0 1rem
      text-align: center
      .actions
        padding-top: 1.5rem
        display: flex
        flex-direction: row-reverse
        .btn
          width: 100%
          padding: 0.875rem 0
          margin: 1rem 1rem 0 1rem
          border-radius: 50px

  .total-payment-amount
    display: flex
    flex-direction: row
    font-weight: bold
    padding-top: 1.25rem
    margin-top: 2.5rem
    border-top: 1px solid #dde6ea
    text-align: left
    .label
      flex: 1 0 0
    .value
      flex: 1 0 0
      text-align: right

  @media (max-width: 767.98px)
    .payment-methods-page
      .payment-methods-content
        max-width: 100%
        width: 100%
        .actions
          padding: 1rem 0
          margin-top: auto
          flex-direction: column
          .btn
            margin-left: 0
            margin-right: 0
`)
