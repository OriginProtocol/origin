import React, { Component } from 'react'

import AcceptOffer from './mutations/AcceptOffer'
import RejectOffer from './mutations/RejectOffer'
import WithdrawOffer from './mutations/WithdrawOffer'
import FinalizeOffer from './mutations/FinalizeOffer'
import DisputeOffer from './mutations/DisputeOffer'

import WaitForFinalize from './_WaitForFinalize'
import EventTick from './_EventTick'
import StarRating from 'components/StarRating'
import SendMessage from 'components/SendMessage'

const TransactionProgress = ({ offer, wallet, refetch }) => {
  if (offer.status === 4) {
    return <Finalized offer={offer} />
  }
  if (offer.status === 3) {
    return <Disputed offer={offer} />
  }
  if (offer.status === 5) {
    return <DisputeResolved offer={offer} />
  }
  if (offer.listing.seller.id === wallet) {
    if (offer.status === 2) {
      return <WaitForFinalize offer={offer} />
    } else if (offer.status === 0) {
      if (offer.withdrawnBy && offer.withdrawnBy.id !== offer.buyer.id) {
        return <OfferRejected party="seller" offer={offer} />
      } else {
        return <OfferWithdrawn party="seller" offer={offer} />
      }
    } else {
      return <AcceptOrReject offer={offer} refetch={refetch} />
    }
  }
  if (offer.status === 2) {
    return <ReviewAndFinalize offer={offer} refetch={refetch} />
  } else if (offer.status === 0) {
    if (offer.withdrawnBy && offer.withdrawnBy.id !== offer.buyer.id) {
      return <OfferRejected party="buyer" offer={offer} />
    } else {
      return <OfferWithdrawn party="buyer" offer={offer} />
    }
  } else if (offer.listing.__typename === 'FractionalListing') {
    return <WaitForSeller offer={offer} refetch={refetch} />
  } else {
    return <MessageSeller offer={offer} refetch={refetch} />
  }
}

const AcceptOrReject = ({ offer, refetch }) => (
  <div className="transaction-progress">
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
    <div className="stages">
      <EventTick className="active" event={offer.createdEvent}>
        Offer Placed
      </EventTick>
      <EventTick>Offer Accepted</EventTick>
      <EventTick>Received by buyer</EventTick>
      <EventTick>Funds withdrawn</EventTick>
    </div>
  </div>
)

class ReviewAndFinalize extends Component {
  state = { rating: 0, review: '' }
  render() {
    const offer = this.props.offer
    return (
      <div className="transaction-progress">
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
        <div className="stages">
          <EventTick className="active bg" event={offer.createdEvent}>
            Offer Placed
          </EventTick>
          <EventTick className="active bgl" event={offer.acceptedEvent}>
            Offer Accepted
          </EventTick>
          <EventTick>Received by buyer</EventTick>
        </div>
      </div>
    )
  }
}

const MessageSeller = ({ offer, refetch }) => (
  <div className="transaction-progress">
    <div className="top">
      <h4>Next Step</h4>
      <div className="next-step">Give your shipping address to seller</div>
      <div className="help">Click the button to open messaging</div>
      <SendMessage to={offer.listing.seller.id} className="btn btn-link">
        Message Seller &rsaquo;
      </SendMessage>
      <WithdrawOffer offer={offer} refetch={refetch} />
    </div>
    <div className="stages">
      <EventTick className="active" event={offer.createdEvent}>
        Offer Placed
      </EventTick>
      <EventTick>Offer Accepted</EventTick>
      <EventTick>Received by buyer</EventTick>
    </div>
  </div>
)

const WaitForSeller = ({ offer, refetch }) => (
  <div className="transaction-progress">
    <div className="top">
      <h4>Next Step</h4>
      <div className="next-step">Wait for seller</div>
      <div className="help">The seller will review your booking</div>
      <WithdrawOffer offer={offer} refetch={refetch} />
    </div>
    <div className="stages">
      <EventTick className="active" event={offer.createdEvent}>
        Offer Placed
      </EventTick>
      <EventTick>Offer Accepted</EventTick>
      <EventTick>Received by buyer</EventTick>
    </div>
  </div>
)

const OfferWithdrawn = ({ offer, party }) => (
  <div className="transaction-progress">
    <div className="top">
      <h4>Offer Withdrawn</h4>
      <div className="help mb-0">
        {party === 'seller'
          ? 'The buyer withdrew their offer'
          : 'You withdrew your offer'}
      </div>
    </div>
    <div className="stages">
      <EventTick className="active bg" event={offer.createdEvent}>
        Offer Placed
      </EventTick>
      <EventTick className="active bg" event={offer.withdrawnEvent}>
        Offer Withdrawn
      </EventTick>
    </div>
  </div>
)

const OfferRejected = ({ offer, party }) => (
  <div className="transaction-progress">
    <div className="top">
      <h4>Offer Rejected</h4>
      <div className="help mb-0">
        {party === 'seller'
          ? 'You rejected this offer'
          : 'Your offer was rejected by the seller'}
      </div>
    </div>
    <div className="stages">
      <EventTick className="active bg" event={offer.createdEvent}>
        Offer Placed
      </EventTick>
      <EventTick className="active bg" event={offer.withdrawnEvent}>
        Offer Rejected
      </EventTick>
    </div>
  </div>
)

const Disputed = ({ offer }) => (
  <div className="transaction-progress">
    <div className="top">
      <h4>Offer Disputed</h4>
      <div className="help mb-0">
        Wait to be contacted by an Origin team member
      </div>
    </div>
    <div className="stages">
      <EventTick className="active bg" event={offer.createdEvent}>
        Offer Placed
      </EventTick>
      <EventTick className="active bg" event={offer.acceptedEvent}>
        Offer Accepted
      </EventTick>
      <EventTick className="danger bgl" event={offer.disputedEvent}>
        Dispute Started
      </EventTick>
      <EventTick>Ruling Made</EventTick>
    </div>
  </div>
)

const DisputeResolved = ({ offer }) => (
  <div className="transaction-progress">
    <div className="top">
      <h4>Dispute Resolved</h4>
      <div className="help mb-0">Origin have resolved this dispute</div>
    </div>
    <div className="stages">
      <EventTick className="active bg" event={offer.createdEvent}>
        Offer Placed
      </EventTick>
      <EventTick className="active bg" event={offer.acceptedEvent}>
        Offer Accepted
      </EventTick>
      <EventTick className="danger bg" event={offer.disputedEvent}>
        Dispute Started
      </EventTick>
      <EventTick className="active bg" event={offer.rulingEvent}>
        Ruling Made
      </EventTick>
    </div>
  </div>
)

const Finalized = ({ offer }) => (
  <div className="transaction-progress">
    <div className="top">
      <h4>Transaction Finalized</h4>
      <div className="help mb-0">
        This transaction has been successfully finalized and funds have been
        released to the seller.
      </div>
    </div>
    <div className="stages">
      <EventTick className="active bg" event={offer.createdEvent}>
        Offer Placed
      </EventTick>
      <EventTick className="active bg" event={offer.acceptedEvent}>
        Offer Accepted
      </EventTick>
      <EventTick className="active bg" event={offer.finalizedEvent}>
        Received by buyer
      </EventTick>
    </div>
  </div>
)

export default TransactionProgress

require('react-styl')(`
  .transaction-progress
    border: 2px solid black
    border-radius: 5px
    padding-top: 1.5rem
    display: flex
    flex-direction: column
    align-items: center
    margin-bottom: 2.5rem
    .top
      padding: 0 1rem
      display: flex
      flex-direction: column
      align-items: center
    h4
      font-weight: bold
      font-size: 24px
      margin-bottom: 0
      font-family: Lato
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
      width: 100%
      margin-top: 1rem
      padding: 1rem
      display: flex
      justify-content: space-evenly
      align-items: flex-start
      font-size: 14px
      color: var(--dark)
      font-weight: normal
      position: relative
      > div
        flex: 1
        display: flex
        flex-direction: column
        align-items: center
        position: relative
        text-align: center
        line-height: normal
        padding: 0 0.25rem
        &::before
          content: ""
          background-color: var(--pale-grey-two)
          background-size: 0.75rem
          border-radius: 2rem
          width: 1.2rem
          height: 1.2rem
          margin-bottom: 0.25rem
          z-index: 5
        &::after
          content: ""
          background-color: var(--pale-grey-two)
          height: 5px
          left: 0
          right: 0
          top: 0.45rem
          position: absolute
          z-index: 4
        &.active::before
          background: var(--greenblue) url(images/checkmark.svg) center no-repeat
        &.danger::before
          background: var(--orange-red)
          content: "!";
          font-weight: 900;
          color: var(--white);
          text-align: center;
          font-size: 14px;
          line-height: 19px;
        &:first-child::after
          left: 50%
        &:last-child::after
          right: 50%
        &.bg::after
          background: var(--greenblue)
        &.bgl::after
          background-image: linear-gradient(to right, var(--greenblue), var(--greenblue) 50%, var(--pale-grey-two) 50%, var(--pale-grey-two))
  @media (max-width: 575.98px)
    .transaction-progress
      .actions
        flex-direction: column-reverse
`)
