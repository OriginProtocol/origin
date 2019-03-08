import React, { Component } from 'react'

import AcceptOffer from './mutations/AcceptOffer'
import RejectOffer from './mutations/RejectOffer'
import WithdrawOffer from './mutations/WithdrawOffer'
import FinalizeOffer from './mutations/FinalizeOffer'
import DisputeOffer from './mutations/DisputeOffer'

import StarRating from 'components/StarRating'
import SendMessage from 'components/SendMessage'
import Stages from 'components/TransactionStages'

import WaitForFinalize from './_WaitForFinalize'

const TransactionProgress = ({ offer, wallet, refetch, loading }) => {
  const props = { offer, loading }
  if (offer.status === 3) {
    return <Disputed {...props} />
  }
  if (offer.status === 5) {
    return <DisputeResolved {...props} />
  }
  if (offer.listing.seller.id === wallet) {
    if (offer.status === 4) {
      return <Finalized party="seller" {...props} />
    } else if (offer.status === 2) {
      return <WaitForFinalize {...props} />
    } else if (offer.status === 0) {
      if (offer.withdrawnBy && offer.withdrawnBy.id !== offer.buyer.id) {
        return <OfferRejected party="seller" {...props} />
      } else {
        return <OfferWithdrawn party="seller" {...props} />
      }
    } else {
      return <AcceptOrReject {...props} refetch={refetch} />
    }
  } else if (offer.status === 4) {
    return <Finalized party="buyer" {...props} />
  }

  if (offer.status === 2) {
    return <ReviewAndFinalize {...props} refetch={refetch} />
  } else if (offer.status === 0) {
    if (offer.withdrawnBy && offer.withdrawnBy.id !== offer.buyer.id) {
      return <OfferRejected party="buyer" {...props} />
    } else {
      return <OfferWithdrawn party="buyer" {...props} />
    }
  } else if (offer.listing.__typename === 'FractionalListing') {
    return <WaitForSeller {...props} refetch={refetch} />
  } else {
    return <MessageSeller {...props} refetch={refetch} />
  }
}

const AcceptOrReject = ({ offer, refetch, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>Next Step:</h4>
      <div className="next-step">Accept or Reject Offer</div>
      <div className="help">Click the appropriate button</div>
      <div className="actions">
        <RejectOffer
          offer={offer}
          className="btn btn-outline-danger"
          refetch={refetch}
        >
          Reject Offer
        </RejectOffer>
        <AcceptOffer
          offer={offer}
          className="btn btn-primary"
          refetch={refetch}
        >
          Accept Offer
        </AcceptOffer>
      </div>
    </div>
    <Stages offer={offer} />
  </div>
)

class ReviewAndFinalize extends Component {
  state = { rating: 0, review: '' }
  render() {
    const { offer, loading } = this.props
    return (
      <div className={`transaction-progress${loading ? ' loading' : ''}`}>
        <div className="top">
          <h4>Next Step:</h4>
          <div className="next-step">
            Leave a review and finalize the transaction
          </div>
          <div className="help">Click the appropriate button</div>
          <div className="review">
            <div>How would you rate your experience?</div>
            <StarRating
              active={this.state.rating}
              onChange={rating => this.setState({ rating })}
            />
            <div>Anything you&apos;d like to comment on?</div>
            <textarea
              className="form-control"
              value={this.state.review}
              onChange={e => this.setState({ review: e.target.value })}
            />
          </div>
          <div className="d-flex flex-column">
            <FinalizeOffer
              rating={this.state.rating}
              review={this.state.review}
              offer={this.props.offer}
              refetch={this.props.refetch}
              className="btn btn-primary"
            >
              Finalize
            </FinalizeOffer>
            <DisputeOffer
              offer={this.props.offer}
              className="btn btn-link withdraw mt-3"
            >
              Report a Problem
            </DisputeOffer>
          </div>
        </div>
        <Stages offer={offer} />
      </div>
    )
  }
}

const MessageSeller = ({ offer, refetch, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>Next Step</h4>
      <div className="next-step">Give your shipping address to seller</div>
      <div className="help">Click the button to open messaging</div>
      <SendMessage to={offer.listing.seller.id} className="btn btn-link">
        Message Seller &rsaquo;
      </SendMessage>
      <WithdrawOffer offer={offer} refetch={refetch} />
    </div>
    <Stages offer={offer} />
  </div>
)

const WaitForSeller = ({ offer, refetch, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>Next Step</h4>
      <div className="next-step">Wait for seller</div>
      <div className="help">The seller will review your booking</div>
      <WithdrawOffer offer={offer} refetch={refetch} />
    </div>
    <Stages offer={offer} />
  </div>
)

const OfferWithdrawn = ({ offer, party, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>Offer Withdrawn</h4>
      <div className="help mb-0">
        {party === 'seller'
          ? 'The buyer withdrew their offer'
          : 'You withdrew your offer'}
      </div>
    </div>
    <Stages offer={offer} />
  </div>
)

const OfferRejected = ({ offer, party, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>Offer Rejected</h4>
      <div className="help mb-0">
        {party === 'seller'
          ? 'You rejected this offer'
          : 'Your offer was rejected by the seller'}
      </div>
    </div>
    <Stages offer={offer} />
  </div>
)

const Disputed = ({ offer, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>Offer Disputed</h4>
      <div className="help mb-0">
        Wait to be contacted by an Origin team member
      </div>
    </div>
    <Stages offer={offer} />
  </div>
)

const DisputeResolved = ({ offer, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>Dispute Resolved</h4>
      <div className="help mb-0">Origin have resolved this dispute</div>
    </div>
    <Stages offer={offer} />
  </div>
)

const Finalized = ({ offer, loading }) => (
  <div className={`transaction-progress${loading ? ' loading' : ''}`}>
    <div className="top">
      <h4>Transaction Finalized</h4>
      <div className="help mb-0">
        This transaction has been successfully finalized and funds have been
        released to the seller.
      </div>
    </div>
    <Stages offer={offer} />
  </div>
)

export default TransactionProgress

require('react-styl')(`
  .transaction-progress
    border: 2px solid black
    border-radius: var(--default-radius)
    padding-top: 1.5rem
    display: flex
    flex-direction: column
    align-items: center
    margin-bottom: 2.5rem
    position: relative
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
      padding: 0 1rem
      display: flex
      flex-direction: column
      align-items: center
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
      text-align: center
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
      .btn
        margin: 0 0.5rem 1rem 0.5rem
    .btn
      padding: 0.75rem 3rem
      border-radius: 2rem
      font-size: 18px
      &.withdraw
        font-size: 12px
        padding-top: 0
        font-weight: normal
    .stages
      background-color: var(--pale-grey-eight)
      border-radius: 0 0 5px 5px
      margin-top: 1rem
      padding: 1rem

  @media (max-width: 767.98px)
    .transaction-progress
      .actions
        flex-direction: column-reverse
`)
