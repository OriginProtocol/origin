import React, { Component, Fragment } from 'react'

import AcceptOffer from './mutations/AcceptOffer'
import FinalizeOffer from './mutations/FinalizeOffer'
import StarRating from 'components/StarRating'
import Modal from 'components/Modal'

import { mobileDevice } from 'utils/mobile'

class TransactionProgress extends Component {
  constructor(props) {
    super(props)

    this.state = { open: false,  shouldClose: false }
  }

  render() {
    const { offer, wallet } = this.props
    const { shouldClose, open } = this.state
    const mobile = mobileDevice() ? 'mobile' : ''

    if (offer.status === 4) {
      return <Finalized />
    }
    if (offer.listing.seller.id === wallet) {
      if (offer.status === 2) {
        return (
          <Fragment>
            <WaitForFinalize offer={offer} openModal={() => this.setState({ open: true })}/>
            {open && (
              <Modal
                className={`fulfillment-modal ${mobile}`}
                onClose={() => this.setState({ open: false, shouldClose: false })}
                shouldClose={shouldClose}
              >
                <div className="d-flex flex-column content">
                  <div className="checklist">
                    <h2>Fulfillment Checklist</h2>
                    <div>
                      <span className="table-cell"><span className="number">1</span></span>
                      <span className="text">Verify the variants with the seller</span>
                    </div>
                    <div>
                      <span className="table-cell"><span className="number">2</span></span>
                      <span className="text">Package the product and send it out</span>
                    </div>
                    <div>
                      <span className="table-cell"><span className="number">3</span></span>
                      <span className="text">Notify buyer and provice tracking number</span>
                    </div>
                    <div>
                      <span className="table-cell"><span className="number">4</span></span>
                      <span className="text">Wait for buyer to receive product</span>
                    </div>
                    <div>
                      <span className="table-cell"><span className="number">5</span></span>
                      <span className="text">Withdraw your funds</span>
                    </div>
                  </div>
                  <button className="btn btn-outline-light" onClick={() => this.setState({ shouldClose: true })}>Ok</button>
                </div>
              </Modal>
            )}
          </Fragment>
        )
      } else {
        return <AcceptOrReject offer={offer} />
      }
    }
    if (offer.status === 2) {
      return <ReviewAndFinalize offer={offer} />
    } else {
      return <MessageSeller />
    }
  }
}

const WaitForFinalize = ({ openModal }) => (
  <div className="transaction-progress">
    <h4>Next Step:</h4>
    <div className="next-step">Wait for buyer to confirm receipt</div>
    <div className="help">
      Make sure you fulfill the order and wait for the buyer’s confirmation
    </div>
    <button className="btn btn-link" onClick={() => openModal(true)}>
      View Fulfillment Checklist &rsaquo;
    </button>
    <div className="stages">
      <div className="active bg">Offer Placed</div>
      <div className="active bgl">Offer Accepted</div>
      <div>Received by buyer</div>
      <div>Funds withdrawn</div>
    </div>
  </div>
)

const AcceptOrReject = ({ offer }) => (
  <div className="transaction-progress">
    <h4>Next Step:</h4>
    <div className="next-step">Accept or Reject Offer</div>
    <div className="help">Click the appropriate button</div>
    <div>
      <button className="btn btn-outline-danger">Reject Offer</button>
      <AcceptOffer offer={offer} className="btn btn-primary ml-2">
        Accept Offer
      </AcceptOffer>
    </div>
    <div className="stages">
      <div className="active">Offer Placed</div>
      <div>Offer Accepted</div>
      <div>Received by buyer</div>
      <div>Funds withdrawn</div>
    </div>
  </div>
)

class ReviewAndFinalize extends Component {
  state = { rating: 0, review: '' }
  render() {
    return (
      <div className="transaction-progress">
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
        <div>
          <FinalizeOffer
            rating={this.state.rating}
            review={this.state.review}
            offer={this.props.offer}
            className="btn btn-primary"
          >
            Finalize
          </FinalizeOffer>
        </div>
        <div className="stages">
          <div className="active bg">Offer Placed</div>
          <div className="active bgl">Offer Accepted</div>
          <div>Received by buyer</div>
        </div>
      </div>
    )
  }
}

const MessageSeller = () => (
  <div className="transaction-progress">
    <h4>Next Step</h4>
    <div className="next-step">Give your shipping address to seller</div>
    <div className="help">Click the button to open messaging</div>
    <button className="btn btn-link">Message Seller &rsaquo;</button>
    <div className="stages">
      <div className="active">Offer Placed</div>
      <div>Offer Accepted</div>
      <div>Received by buyer</div>
    </div>
  </div>
)

const Finalized = () => (
  <div className="transaction-progress">
    <h4>Transaction Finalized</h4>
    <div className="help mb-0">
      This transaction has been successfully finalized and funds have been
      released to the seller.
    </div>
    <div className="stages">
      <div className="active bg">Offer Placed</div>
      <div className="active bg">Offer Accepted</div>
      <div className="active bg">Received by buyer</div>
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
    .help
      font-size: 14px
      margin-bottom: 1.5rem
    .review
      font-size: 18px
      color: var(--dusk)
      font-weight: normal
      margin-bottom: 2rem
      width: 50%;
      text-align: center;
      .star-rating
        margin: 0.5rem 0 2rem 0
      textarea
        margin-top: 0.5rem
    .btn
      padding: 0.75rem 3rem
      border-radius: 2rem
      font-size: 18px
    .stages
      background-color: var(--pale-grey-eight)
      border-radius: 0 0 5px 5px
      width: 100%
      margin-top: 2rem
      display: flex
      justify-content: space-evenly
      height: 5rem
      align-items: center
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
        &:first-child::after
          left: 50%
        &:last-child::after
          right: 50%
        &.bg::after
          background: var(--greenblue)
        &.bgl::after
          background-image: linear-gradient(to right, var(--greenblue), var(--greenblue) 50%, var(--pale-grey-two) 50%, var(--pale-grey-two))

  .pl-modal .pl-modal-table .pl-modal-cell .pl-modal-content
    max-width: 580px

  .table-cell
    display: table-cell

  .fulfillment-modal
    .content
      height: 100%
      text-align: left
      line-height: 2.5
      h2
        text-align: center
      .number
        background: var(--dark)
        color: var(--white)
        min-width: 1.6rem
        padding: 0.2rem 0.5rem
        height: 1.6rem
        border-radius: 2rem
        line-height: 1.6rem
        text-align: center
        margin-right: 10px
      .checklist
        padding-bottom: 40px
        span
          &.text
            display: table-cell
            padding-left: 10px
    &.mobile
      padding: 1rem
      .content
        line-height: 2

  .btn-outline-light
    width: 50%
    align-self: center
`)
