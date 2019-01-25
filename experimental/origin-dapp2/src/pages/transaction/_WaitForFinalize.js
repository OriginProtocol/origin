import React, { Component } from 'react'
import Modal from 'components/Modal'

import DisputeOffer from './mutations/DisputeOffer'

class WaitForFinalize extends Component {
  state = {}

  render() {
    return (
      <div className="transaction-progress">
        <h4>Next Step:</h4>
        <div className="next-step">Wait for buyer to confirm receipt</div>
        <div className="help">
          Make sure you fulfill the order and wait for the buyer’s confirmation
        </div>
        <button
          className="btn btn-link"
          onClick={() => this.setState({ open: true })}
          children=""
        >
          View Fulfillment Checklist &rsaquo;
        </button>

        <DisputeOffer
          offer={this.props.offer}
          party="seller"
          className="btn btn-link withdraw mt-3"
        >
          Report a Problem
        </DisputeOffer>

        <div className="stages">
          <div className="active bg">Offer Placed</div>
          <div className="active bgl">Offer Accepted</div>
          <div>Received by buyer</div>
          <div>Funds withdrawn</div>
        </div>
        {!this.state.open ? null : (
          <Modal
            className="fulfillment-modal"
            onClose={() => this.setState({ open: false, shouldClose: false })}
            shouldClose={this.state.shouldClose}
          >
            <div className="d-flex flex-column content">
              <div className="checklist">
                <h2>Fulfillment Checklist</h2>
                <div>
                  <span className="table-cell">
                    <span className="step">1</span>
                  </span>
                  <span className="text">
                    Verify the variants with the seller
                  </span>
                </div>
                <div>
                  <span className="table-cell">
                    <span className="step">2</span>
                  </span>
                  <span className="text">
                    Package the product and send it out
                  </span>
                </div>
                <div>
                  <span className="table-cell">
                    <span className="step">3</span>
                  </span>
                  <span className="text">
                    Notify buyer and provide tracking number
                  </span>
                </div>
                <div>
                  <span className="table-cell">
                    <span className="step">4</span>
                  </span>
                  <span className="text">
                    Wait for buyer to receive product
                  </span>
                </div>
                <div>
                  <span className="table-cell">
                    <span className="step">5</span>
                  </span>
                  <span className="text">Withdraw your funds</span>
                </div>
              </div>
              <button
                className="btn btn-outline-light"
                onClick={() => this.setState({ shouldClose: true })}
                children="OK"
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
