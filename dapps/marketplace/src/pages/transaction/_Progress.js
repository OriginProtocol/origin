import React from 'react'
import { fbt } from 'fbt-runtime'

import AcceptOffer from './mutations/AcceptOffer'
import RejectOffer from './mutations/RejectOffer'
import WithdrawOffer from './mutations/WithdrawOffer'
import FinalizeOffer from './mutations/FinalizeOffer'

import Stages from 'components/TransactionStages'

import OfferAcceptedSeller from './_OfferAcceptedSeller'
import OfferAcceptedBuyer from './_OfferAcceptedBuyer'
import ReviewAndFinalization from './_ReviewAndFinalization'

import ShippingAddress from './_ShippingAddress'

const TransactionProgress = ({
  offer,
  isSeller,
  isBuyer,
  party,
  refetch,
  loading
}) => {
  const props = { offer, loading, party }
  if (!isBuyer && !isSeller) {
    return null
  }
  if (offer.status === 3) {
    return <Disputed {...props} />
  }
  if (offer.status === 5) {
    return <DisputeResolved {...props} />
  }
  if (isSeller) {
    if (offer.status === 4) {
      return (
        <ReviewAndFinalization refetch={refetch} viewedBy="seller" {...props} />
      )
    } else if (offer.status === 2) {
      if (offer.finalizes < +new Date() / 1000) {
        return <SellerFinalize {...props} refetch={refetch} />
      } else {
        return <OfferAcceptedSeller {...props} refetch={refetch} />
      }
    } else if (offer.status === 0) {
      if (offer.withdrawnBy && offer.withdrawnBy.id !== offer.buyer.id) {
        return <OfferRejected viewedBy="seller" {...props} />
      } else {
        return <OfferWithdrawn viewedBy="seller" {...props} />
      }
    } else {
      return <AcceptOrReject {...props} refetch={refetch} />
    }
  } else if (offer.status === 4) {
    return (
      <ReviewAndFinalization refetch={refetch} viewedBy="buyer" {...props} />
    )
  }

  if (offer.status === 2) {
    if (isBuyer || isSeller) {
      return <OfferAcceptedBuyer {...props} refetch={refetch} />
    }
    return <TransactionStages {...props} />
  } else if (offer.status === 0) {
    if (offer.withdrawnBy && offer.withdrawnBy.id !== offer.buyer.id) {
      return <OfferRejected viewedBy="buyer" {...props} />
    } else {
      return <OfferWithdrawn viewedBy="buyer" {...props} />
    }
  } else if (offer.listing.__typename === 'FractionalListing') {
    return <WaitForSeller {...props} refetch={refetch} />
  } else if (offer.listing.__typename === 'FractionalHourlyListing') {
    return <WaitForSeller {...props} refetch={refetch} />
  } else {
    return <MessageSeller {...props} refetch={refetch} />
  }
}

const AcceptOrReject = ({ offer, refetch, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="tx-progress-wrapper">
      <div className="tx-receipt-status top">
        <h4>
          <span className="positive-emphasis">
            <fbt desc="Progress.congratulations">Congratulations!</fbt>{' '}
          </span>
          <fbt desc="Progress.offerHasBeenMade">
            An offer has been made on this listing.
          </fbt>
        </h4>
        <Stages className="mt-4" mini="true" offer={offer} />
        <div className="mt-4">
          <fbt desc="Progress.fundsInEscrow">
            The buyer&apos;s funds are being held in escrow. Click below to
            accept or reject this offer.
          </fbt>
        </div>
        <div className="accept-actions">
          <AcceptOffer
            offer={offer}
            className="btn btn-primary mr-md-auto"
            refetch={refetch}
          >
            <fbt desc="Progress.acceptOffer">Accept Offer</fbt>
          </AcceptOffer>
          <RejectOffer
            offer={offer}
            className="btn btn-link mr-auto danger small mt-3"
            refetch={refetch}
          >
            <fbt desc="Progress.declineOffer">Decline Offer</fbt>
          </RejectOffer>
        </div>
      </div>
      <ShippingAddress offer={offer} />
    </div>
  </div>
)

const SellerFinalize = ({ offer, refetch, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="tx-progress-wrapper">
      <div className="tx-receipt-status top">
        <h4>
          <fbt desc="Progress.completeSaleAndCollect">Collect your funds.</fbt>
        </h4>
        <Stages className="mt-4" mini="true" offer={offer} />
        <div className="help mt-4">
          <fbt desc="Progress.completeSaleTransferFunds">
            Complete this sale by transferring the buyer&apos;s funds out of
            escrow.
          </fbt>
        </div>
        <div className="d-flex flex-column mr-md-auto">
          <FinalizeOffer
            offer={offer}
            refetch={refetch}
            from={offer.listing.seller.id}
            className="btn btn-primary"
          >
            <fbt desc="Progress.collectFunds">Collect Funds</fbt>
          </FinalizeOffer>
        </div>
      </div>
      <ShippingAddress offer={offer} />
    </div>
  </div>
)

const MessageSeller = ({ offer, refetch, loading, party }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="tx-progress-wrapper">
      <div className="tx-receipt-status top">
        <h4>
          {fbt(
            `You've made an offer. Wait for the seller to accept it.`,
            'Progress.youVeMadeOffer'
          )}
        </h4>
        <Stages className="mt-4" mini="true" offer={offer} />
        <div className="mt-4">
          <fbt desc="Progress.weWillNotifyYou">
            We will notify you once your offer is accepted. Your funds will be
            released 14 days later.
          </fbt>
        </div>
        <div className="mr-auto mt-3">
          <WithdrawOffer offer={offer} refetch={refetch} from={party} />
        </div>
      </div>
      <ShippingAddress offer={offer} />
    </div>
  </div>
)

const WaitForSeller = ({ offer, refetch, loading, party }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="tx-progress-wrapper">
      <div className="tx-receipt-status top">
        <h4>
          <fbt desc="Progress.waitForSeller">Wait for seller</fbt>
        </h4>
        <Stages className="my-4" mini="true" offer={offer} />
        <div className="help">
          <fbt desc="Progress.sellerWillReview">
            The seller will review your booking
          </fbt>
        </div>
        <WithdrawOffer
          className="mr-auto"
          offer={offer}
          refetch={refetch}
          from={party}
        />
      </div>
      <ShippingAddress offer={offer} />
    </div>
  </div>
)

const OfferWithdrawn = ({ offer, viewedBy, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="tx-progress-wrapper">
      <div className="tx-receipt-status top">
        <h4>
          {viewedBy === 'seller'
            ? fbt(
                'This offer has been canceled.',
                'Progress.offerHasBeenCanceled'
              )
            : fbt(
                `You've canceled this purchase.`,
                'Progress.youCanceledThisPurchase'
              )}
        </h4>
        <Stages className="my-4" mini="true" offer={offer} />
        <div className="help mb-0">
          {viewedBy === 'seller'
            ? fbt(
                `The buyer's funds have been refunded.`,
                'Progress.buyerFundsHaveBeendRefunded'
              )
            : fbt(
                'Your funds have been refunded.',
                'Progress.yourFundsHaveBeenRefunded'
              )}
        </div>
      </div>
      <ShippingAddress offer={offer} />
    </div>
  </div>
)

const OfferRejected = ({ offer, viewedBy, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="tx-progress-wrapper">
      <div className="tx-receipt-status top">
        <h4>
          {viewedBy === 'seller'
            ? fbt(`You've declined this offer.`, 'Progress.youDeclinedOffer')
            : fbt(
                `Your offer has been declined by the seller.`,
                'Progress.sellerDeclinedOffer'
              )}
        </h4>
        <Stages className="mt-4" mini="true" offer={offer} />
        <div className="help mb-0 mt-3">
          {viewedBy === 'seller'
            ? fbt(
                `The buyer's funds have been refunded.`,
                'Progress.buyerFundsRefunded'
              )
            : fbt(
                'Your funds have been refunded.',
                'Progress.yourFundsRefunded'
              )}
        </div>
      </div>
      <ShippingAddress offer={offer} />
    </div>
  </div>
)

const Disputed = ({ offer, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>
        <fbt desc="Progress.offerDisputed">Offer Disputed</fbt>
      </h4>
      <div className="help mb-0 mt-2">
        <fbt desc="Progress.waitToBeContacted">
          Wait to be contacted by an Origin team member
        </fbt>
      </div>
    </div>
    <Stages className="mt-4" mini="true" offer={offer} />
  </div>
)

const DisputeResolved = ({ offer, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>
        <fbt desc="Progress.disputeResolved">Dispute Resolved</fbt>
      </h4>
      <div className="help mb-0">
        <fbt desc="Progress.originResolved">
          Origin has resolved this dispute
        </fbt>
      </div>
    </div>
    <Stages mini="true" offer={offer} />
  </div>
)

const TransactionStages = ({ offer, loading }) => (
  <div className={`transaction-progress view-only${loading ? ' loading' : ''}`}>
    <div className="top">
      <Stages mini="true" offer={offer} />
    </div>
  </div>
)

export default TransactionProgress

require('react-styl')(`
  .transaction-progress
    font-size: 18px
    font-weight: normal
    color: #000000
    border: solid 1px #eaf0f3
    border-radius: 10px
    background-color: #f3f7f9
    padding: 1.9rem
    display: flex
    flex-direction: column
    align-items: center
    margin-bottom: 2.5rem
    position: relative
    &.view-only
      .stages
        margin-top: 0
        border-radius: 5px
    &.loading
      &::before
        content: ""
        position: absolute
        top: 0
        bottom: 0
        left: 0
        right: 0
        background: rgba(255, 255, 255, 0.75)
        z-index: 10
      &::after
        content: ""
        background: url(images/spinner-animation-dark.svg) no-repeat center
        background-size: cover
        position: absolute
        top: calc(50% - 1.5rem)
        left: calc(50% - 1.5rem)
        width: 3rem
        height: 3rem
        z-index: 11

    .top
      display: flex
      width: 100%
      flex-direction: column
    .positive-emphasis
      color: var(--greenblue)
    h4
      font-weight: bold
      font-size: 24px
      margin-bottom: 0
      font-family: var(--default-font)
    .next-step
      font-size: 24px
      font-weight: normal
      line-height: normal
      margin-bottom: 0.25rem
      text-align: center
    .help
      font-size: 18px
      margin-bottom: 1.5rem
    .actions
      display: flex
      padding-top: 1rem
      .btn
        margin-right: 1rem
    .accept-actions
      display: flex
      flex-direction: column
      padding-top: 1rem
      .btn
        margin-right: 1rem
    .btn
      padding: 0.75rem 3rem
      border-radius: 2rem
    .btn-link
      padding: 0 0.5rem 0 0
      text-decoration: none
      font-size: 18px
      font-weight: bold
      &.danger
        color: #dc3545
        &.small
          font-size: 16px
      &::after
        content: " ›"
      &.withdraw
        font-size: 18px
        padding-top: 0
        font-weight: normal
        &.small
          font-size: 14px
    .stages
      background-color: var(--pale-grey-eight)
      border-radius: 0 0 5px 5px
      margin-top: 1rem
      padding-top: 1rem
      padding-bottom: 1rem

  @media (max-width: 767.98px)
    .transaction-progress
      border: 0px
      padding: 0rem
      position: relative
      &::after
        border: solid 1px #eaf0f3
        content: ""
        background-color: #f3f7f9
        position: absolute
        margin-left: 50%
        transform: translateX(-50%)
        z-index: -1
        width: 100vw
        height: 100%
      &::before
        border: solid 1px #eaf0f3
        content: ""
        background-color: #f3f7f9
        position: absolute
        left: 50%
        z-index: -1
        width: 50vw
        height: 100%
      .top
        padding: 30px 0px
        width: 100%
      .actions
        flex-direction: column-reverse
        button:last-of-type
          margin-bottom: 10px
      .accept-actions
        button:last-of-type
          margin-bottom: 10px
`)
