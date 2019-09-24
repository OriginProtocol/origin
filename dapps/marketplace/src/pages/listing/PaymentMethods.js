import React, { useState, useCallback } from 'react'

import { fbt } from 'fbt-runtime'

import { withRouter } from 'react-router-dom'

import get from 'lodash/get'

import DocumentTitle from 'components/DocumentTitle'
import MobileModalHeader from 'components/MobileModalHeader'

import Link from 'components/Link'
import AcceptedTokenListItem from 'components/AcceptedTokenListItem'

import withIsMobile from 'hoc/withIsMobile'

// Default token to select by order of preference
const defaultTokens = ['token-DAI', 'token-ETH', 'token-OGN']

/**
 * Returns the default currency to be selected for a listing
 * @param {Array} acceptedTokens An array of accepted tokens
 */
const getDefaultToken = acceptedTokens => {
  if (!acceptedTokens.length) {
    return null
  }

  if (acceptedTokens.length === 1) {
    return acceptedTokens[0]
  }

  for (const token of defaultTokens) {
    if (acceptedTokens.includes(token)) {
      return token
    }
  }

  // This should never happen
  return null
}

const PaymentMethods = ({
  listing,
  quantity,
  bookingRange,
  isMobile,
  history
}) => {
  const acceptedTokens = get(listing, 'acceptedTokens', [])
    .map(t => t.id)

  const [selectedToken, setSelectedToken] = useState(getDefaultToken(acceptedTokens))

  const setTokenCallback = useCallback(token => setSelectedToken(token))

  const title = <fbt desc="PaymentMethod.title">Payment Method</fbt>

  const nextLink = `/listing/${listing.id}/${
    listing.requiresShipping ? 'shipping' : 'confirm'
  }`

  return (
    <div className="container payment-methods-page">
      <DocumentTitle>
        {title} | {listing.title}
      </DocumentTitle>
      {!isMobile ? (
        <h1>
          {title}
        </h1>
      ) : (
        <MobileModalHeader onBack={() => history.goBack()}>
          {title}
        </MobileModalHeader>
      )}
      <div className="payment-methods-content">
        <div className="my-4">
          <fbt desc="PaymentMethod.acceptedCurrencies">
            This seller accepts
          </fbt>
        </div>
        {
          acceptedTokens.map(token => (
            <AcceptedTokenListItem
              key={token}
              token={token}
              selected={selectedToken === token}
              onSelect={setTokenCallback}
              hideTooltip={true}
            />
          ))
        }
        <div className="total-payment">
          
        </div>
        <div className="actions">
          <Link className="btn btn-primary btn-rounded" to={nextLink}>
            <fbt desc="Continue">Continue</fbt>
          </Link>
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
