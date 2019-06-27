import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import AcceptOffer from './mutations/AcceptOffer'
import RejectOffer from './mutations/RejectOffer'
import WithdrawOffer from './mutations/WithdrawOffer'
import FinalizeOffer from './mutations/FinalizeOffer'
import DisputeOffer from './mutations/DisputeOffer'

import StarRating from 'components/StarRating'
import SendMessage from 'components/SendMessage'
import Stages from 'components/TransactionStages'

import OfferAcceptedSeller from './_OfferAcceptedSeller'
import OfferAcceptedBuyer from './_OfferAcceptedBuyer'

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
    return <TransactionStages {...props} />
  }
  if (offer.status === 3) {
    return <Disputed {...props} />
  }
  if (offer.status === 5) {
    return <DisputeResolved {...props} />
  }
  if (isSeller) {
    if (offer.status === 4) {
      return <Finalized party="seller" {...props} />
    } else if (offer.status === 2) {
      if (offer.finalizes < +new Date() / 1000) {
        return <SellerFinalize {...props} refetch={refetch} />
      } else {
        return <OfferAcceptedSeller {...props} />
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
    return <Finalized party="buyer" {...props} />
  }

  if (offer.status === 2) {
    if (isBuyer || isSeller) {
      //return <ReviewAndFinalize {...props} refetch={refetch} />
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
    <div className="top">
      <h4>
        <span className="positive-emphasis">
          <fbt desc="Progress.congratulations">Congratulations!</fbt>{' '}
        </span>
        <fbt desc="Progress.offerHasBeenMade">An offer has been made on this listing.</fbt>
      </h4>
      <Stages className="mt-4" mini="true" offer={offer} />
      <div className="mt-4">
        <fbt desc="Progress.fundsInEscrow">The buyer's funds are being held in escrow. Click below to accept or reject this offer.</fbt>
      </div>
      <div className="actions">
        <RejectOffer
          offer={offer}
          className="btn btn-outline-danger"
          refetch={refetch}
        >
          <fbt desc="Progress.declineOffer">Decline Offer</fbt>
        </RejectOffer>
        <AcceptOffer
          offer={offer}
          className="btn btn-primary"
          refetch={refetch}
        >
          <fbt desc="Progress.acceptOffer">Accept Offer</fbt>
        </AcceptOffer>
      </div>
    </div>
  </div>
)

class ReviewAndFinalize extends Component {
  state = { rating: 0, review: '' }
  render() {
    const { offer, loading, party } = this.props
    return (
      <div className={`transaction-progress${loading ? ' loading' : ''}`}>
        <div className="top">
          <h4>Next Step:</h4>
          <div className="next-step">
            <fbt desc="Progress.leaveREview">
              Leave a review and finalize the transaction
            </fbt>
          </div>
          <div className="help">Click the appropriate button</div>
          <div className="review">
            <div>
              <fbt desc="Progress.rateYourExperience">
                How would you rate your experience?
              </fbt>
            </div>
            <StarRating
              active={this.state.rating}
              onChange={rating => this.setState({ rating })}
            />
            <div>
              <fbt desc="Progress.reviewYourExperience">
                Describe your experience transacting with this seller.
              </fbt>
            </div>
            <textarea
              className="form-control"
              value={this.state.review}
              onChange={e => this.setState({ review: e.target.value })}
            />
          </div>
          <div className="d-flex flex-column">
            <FinalizeOffer
              disabled={this.state.rating === 0}
              rating={this.state.rating}
              review={this.state.review}
              offer={this.props.offer}
              refetch={this.props.refetch}
              from={offer.buyer.id}
              className="btn btn-primary"
            >
              <fbt desc="Progress.finalize">Finalize</fbt>
            </FinalizeOffer>
            <DisputeOffer
              from={party}
              offer={this.props.offer}
              className="btn btn-link withdraw mt-3"
            >
              <fbt desc="Progress.reportProblem">Report a Problem</fbt>
            </DisputeOffer>
          </div>
        </div>
        <Stages mini="true" offer={offer} />
      </div>
    )
  }
}

const SellerFinalize = ({ offer, refetch, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>Next Step:</h4>
      <div className="next-step">
        <fbt desc="Progress.completeAndCollect">
          Complete the sale to collect your funds
        </fbt>
      </div>
      <div className="help">
        <fbt desc="Progress.fundsHeld">
          Funds are being held in escrow until the sale is completed. Click
          below to collect your funds
        </fbt>
      </div>
      <div className="d-flex flex-column">
        <FinalizeOffer
          offer={offer}
          refetch={refetch}
          from={offer.listing.seller.id}
          className="btn btn-primary"
        >
          <fbt desc="Progress.completeSale">Complete Sale</fbt>
        </FinalizeOffer>
      </div>
    </div>
    <Stages mini="true" offer={offer} />
  </div>
)

const MessageSeller = ({ offer, refetch, loading, party }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>
        <fbt desc="Progress.giveShipping">
          Give your shipping address to seller
        </fbt>
      </h4>
      <Stages className="mt-4" mini="true" offer={offer} />
      <div className="mt-4">
        <fbt desc="Progress.giveShippingAddress">
          Make sure the seller knows where to send your item.
        </fbt>
        <SendMessage to={offer.listing.seller.id} className="btn btn-link ml-2">
          <fbt desc="Progress.messageSeller">Message Seller</fbt>
        </SendMessage>
      </div>
      <div className="mr-auto">
        <WithdrawOffer offer={offer} refetch={refetch} from={party} />
      </div>
    </div>
  </div>
)

const WaitForSeller = ({ offer, refetch, loading, party }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>
        <fbt desc="Progress.waitForSeller">Wait for seller</fbt>
      </h4>
      <Stages className="my-4" mini="true" offer={offer} />
      <div className="help">
        <fbt desc="Progress.sellerWillReview">
          The seller will review your booking
        </fbt>
      </div>
      <WithdrawOffer className="mr-auto" offer={offer} refetch={refetch} from={party} />
    </div>
  </div>
)

const OfferWithdrawn = ({ offer, viewedBy, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>
        {viewedBy === 'seller'
          ? fbt('This offer has been canceled.', 'Progress.offerHasBeenCanceled')
          : fbt(`You've canceled this purchase.`, 'Progress.youCanceledThisPurchase')
        }        
      </h4>
      <Stages className="my-4" mini="true" offer={offer} />
      <div className="help mb-0">
        {viewedBy === 'seller'
          ? fbt(`The buyer's funds have been refunded.`, 'Progress.buyerFundsHaveBeendRefunded')
          : fbt('Your funds have been refunded.', 'Progress.yourFundsHaveBeenRefunded')
        }
      </div>
    </div>
  </div>
)

const OfferRejected = ({ offer, viewedBy, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>
        {viewedBy === 'seller'
          ? fbt(`You've declined this offer.`, 'Progress.youDeclinedOffer')
          : fbt(`Your offer has been declined by the seller.`, 'Progress.sellerDeclinedOffer')
        }
      </h4>
      <Stages className="mt-4" mini="true" offer={offer} />
      <div className="help mb-0 mt-3">
        {viewedBy === 'seller'
          ? fbt(`The buyer's funds have been refunded.`, 'Progress.buyerFundsRefunded')
          : fbt(
              'Your funds have been refunded.',
              'Progress.yourFundsRefunded'
            )
        }
      </div>
    </div>
  </div>
)

const Disputed = ({ offer, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>
        <fbt desc="Progress.offerDisputed">Offer Disputed</fbt>
      </h4>
      <div className="help mb-0">
        <fbt desc="Progress.waitToBeContacted">
          Wait to be contacted by an Origin team member
        </fbt>
      </div>
    </div>
    <Stages mini="true" offer={offer} />
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

const Finalized = ({ offer, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>
        <fbt desc="Progress.transactionFinalized">Transaction Finalized</fbt>
      </h4>
      <div className="help mb-0">
        <fbt desc="Progress.transactionSuccess">
          This transaction has been successfully finalized and funds have been
          released to the seller.
        </fbt>
      </div>
    </div>
    <Stages mini="true" offer={offer} />
  </div>
)

const TransactionStages = ({ offer, loading }) => (
  <div className={`transaction-progress view-only${loading ? ' loading' : ''}`}>
    <Stages mini="true" offer={offer} />
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
      padding-top: 0
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
      font-size: 14px
      margin-bottom: 1.5rem
    .review
      font-size: 18px
      color: var(--dusk)
      font-weight: normal
      margin-bottom: 2rem
      text-align: center;
      .star-rating
        margin: 0.5rem 0 2rem 0
      textarea
        margin-top: 0.5rem
    .actions
      display: flex
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
      &::after
        content: " \\203A"
      &.withdraw
        font-size: 12px
        padding-top: 0
        font-weight: normal
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
        margin-right: 50%
        transform: translateX(50%)
        z-index: -1
        width: 100vw
        height: 100%
      .top
        padding: 30px 0px
        width: 100%
      .actions
        flex-direction: column-reverse
        button:last-of-type
          margin-bottom: 10px
`)
