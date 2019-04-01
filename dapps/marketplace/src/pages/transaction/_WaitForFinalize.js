import React, { Component } from 'react'
import Modal from 'components/Modal'
import { fbt } from 'fbt-runtime'

import DisputeOffer from './mutations/DisputeOffer'
import EventTick from 'components/EventTick'

class WaitForFinalize extends Component {
  state = {}

  render() {
    const { offer } = this.props
    return (
      <div className="transaction-progress">
        <div className="top">
          <h4>Next Step:</h4>
          <div className="next-step">Wait for buyer to confirm receipt</div>
          <div className="help">
            <fbt desc="WaitForFinalize.makeSureYouFullfill">
              Make sure you fulfill the order and wait for the buyer’s
              confirmation
            </fbt>
          </div>
          <button
            className="btn btn-link"
            onClick={() => this.setState({ open: true })}
            children=""
          >
            <fbt desc="WaitForFinalize.viewFullfillment">
              View Fulfillment Checklist
            </fbt>{' '}
            &rsaquo;
          </button>

          <DisputeOffer
            offer={this.props.offer}
            party="seller"
            className="btn btn-link withdraw mt-3"
          >
            <fbt desc="WaitForFinalize.reportProblme">Report a Problem</fbt>
          </DisputeOffer>
        </div>

        <div className="stages">
          <EventTick className="active bg" event={offer.createdEvent}>
            Offer Placed
          </EventTick>
          <EventTick className="active bgl" event={offer.acceptedEvent}>
            Offer Accepted
          </EventTick>
          <EventTick>SaleCompleted</EventTick>
        </div>
        {!this.state.open ? null : (
          <Modal
            className="fulfillment-modal"
            onClose={() => this.setState({ open: false, shouldClose: false })}
            shouldClose={this.state.shouldClose}
          >
            <div className="d-flex flex-column content">
              <div className="checklist">
                <h2>
                  <fbt desc="WaitForFinalize.fuulfillmentChecklist">
                    Fulfillment Checklist
                  </fbt>
                </h2>
                <div>
                  <span className="table-cell">
                    <span className="step">1</span>
                  </span>
                  <span className="text">
                    <fbt desc="WaitForFinalize.verifyVariants">
                      Verify the variants with the seller
                    </fbt>
                  </span>
                </div>
                <div>
                  <span className="table-cell">
                    <span className="step">2</span>
                  </span>
                  <span className="text">
                    <fbt desc="WaitForFinalize.packageProduct">
                      Package the product and send it out
                    </fbt>
                  </span>
                </div>
                <div>
                  <span className="table-cell">
                    <span className="step">3</span>
                  </span>
                  <span className="text">
                    <fbt desc="WaitForFinalize.notifyBuyer">
                      Notify buyer and provide tracking number
                    </fbt>
                  </span>
                </div>
                <div>
                  <span className="table-cell">
                    <span className="step">4</span>
                  </span>
                  <span className="text">
                    <fbt desc="WaitForFinalize.waitForBuyer">
                      Wait for buyer to receive product
                    </fbt>
                  </span>
                </div>
                <div>
                  <span className="table-cell">
                    <span className="step">5</span>
                  </span>
                  <span className="text">
                    <fbt desc="WaitForFinalize.withdrawYourFuns">
                      Withdraw your funds
                    </fbt>
                  </span>
                </div>
              </div>
              <button
                className="btn btn-outline-light"
                onClick={() => this.setState({ shouldClose: true })}
                children={fbt('OK', 'OK')}
              />
            </div>
          </Modal>
        )}
      </div>
    )
  }
}

export default WaitForFinalize

require('react-styl')(`
  .fulfillment-modal
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
    .fulfillment-modal
      padding: 1rem !important
`)
