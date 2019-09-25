import React from 'react'
import { fbt } from 'fbt-runtime'

import DisputeOffer from './mutations/DisputeOffer'
import Stages from 'components/TransactionStages'

import ShippingAddress from './_ShippingAddress'

const OfferAcceptedSeller = ({ offer, refetch }) => {
  return (
    <div className="transaction-progress">
      <div className="tx-progress-wrapper">
        <div className="tx-receipt-status top">
          <h4>
            <fbt desc="WaitForFinalize.youVeAcceptedOffer">
              You&apos;ve accepted this offer.
            </fbt>
          </h4>
          <Stages className="mt-4" mini="true" offer={offer} />
          <div className="help mt-3 mb-0">
            <fbt desc="WaitForFinalize.makeSureYouFullfillOrder">
              Make sure to fulfill the order promptly. Message the buyer if
              there is any information that you need.
            </fbt>
          </div>

          <DisputeOffer
            offer={offer}
            refetch={refetch}
            from={offer.listing.seller.id}
            className="btn btn-link withdraw mt-3 mr-auto"
          >
            <fbt desc="WaitForFinalize.reportProblme">Report a Problem</fbt>
          </DisputeOffer>
        </div>
        <ShippingAddress offer={offer} />
      </div>
    </div>
  )
}

export default OfferAcceptedSeller

require('react-styl')(`
  .offer-accepted-seller
    max-width: 580px

    .content
      height: 100%
      text-align: left
      h2
        text-align: center
      .step
        background: var(--dark)
        color: var(--white)
        min-width: 1.6rem
        padding: 0.2rem 0.5rem
        height: 1.6rem
        border-radius: 2rem
        line-height: 1.6rem
        text-align: center
        margin-right: 0.5rem
      .checklist
        padding-bottom: 2rem
        > div
          margin-bottom: 1rem
        span
          &.text
            display: table-cell
            padding-left: 0.5rem

    .table-cell
      display: table-cell

    .btn-outline-light
      width: 50%
      align-self: center

  @media (max-width: 576px)
    .offer-accepted-seller
      padding: 1rem !important
`)
