import React, { Component, Fragment } from 'react'
import Modal from 'components/Modal'
import { fbt } from 'fbt-runtime'

import DisputeOffer from './mutations/DisputeOffer'
import Stages from 'components/TransactionStages'
import SendMessage from 'components/SendMessage'

class OfferAcceptedBuyer extends Component {
  state = {}

  render() {
    const { offer } = this.props
    const isForSale = offer.listing.category === 'schema.forSale'
    const isForRent = offer.listing.category === 'schema.forRent'
    const isServices = offer.listing.category === 'schema.services'

    return (
      <div className="transaction-progress">
        <div className="top">
          <h4>
            <span className="positive-emphasis">
              <fbt desc="Progress.congratulations">Congratulations!</fbt>{' '}
            </span>
            <fbt desc="Progress.offerAcceptedByTheSeller">Your offer has been accepted by the seller.</fbt>
          </h4>
          <Stages className="mt-4" mini="true" offer={offer} />
          {isForSale && <Fragment>
            <div className="help mt-3 mb-0 d-flex">
              <fbt desc="OfferAcceptBuyer.contactSellerShipping">
                <SendMessage to={offer.listing.seller.id} className="btn btn-link">
                  Contact Seller
                </SendMessage>
                with your shipping address or any questions.
              </fbt>
            </div>
            <div className="help mt-3 mb-0 ">
              <fbt desc="OfferAcceptBuyer.clickToConfirmReceipt">
                Click below to confirm your receipt of <fbt:param name="listingTitle"><b>{offer.listing.title}</b></fbt:param> when you get it.
              </fbt>
            </div>
          </Fragment>}
          {isForRent && <Fragment>
            <div className="help mt-3 mb-0 d-flex">
              <fbt desc="OfferAcceptBuyer.contactSellerRental">
                <SendMessage to={offer.listing.seller.id} className="btn btn-link">
                  Contact Seller
                </SendMessage>
                with any questions about your rental.
              </fbt>
            </div>
            <div className="help mt-3 mb-0 ">
              <fbt desc="OfferAcceptBuyer.confirmRentalCompleted">
                Click below to confirm that your rental has been completed.
              </fbt>
            </div>
          </Fragment>}
          {isServices && <div className="help mt-3 mb-0 ">
              <fbt desc="OfferAcceptBuyer.confirmServiceCompleted">
                Click below to confirm that this service has been completed.
              </fbt>
            </div>
          }
          <div className="actions">
            <button
              className="btn btn-primary"
              onClick={() => {console.log("What is up yo???")}}
            >
              <fbt desc="OfferAcceptBuyer.confirm">
                Confirm
              </fbt>
            </button>
          </div>

          <div className="mt-3">
            <span className="issues mr-1">
              <fbt desc="OfferAcceptBuyer.havingIssues">
                Having issues?
              </fbt>
            </span>
            <DisputeOffer
            offer={this.props.offer}
            party="seller"
            className="btn btn-link withdraw mr-auto"
            >
              <fbt desc="OfferAcceptBuyer.reportProblme">Report a Problem</fbt>
            </DisputeOffer>
          </div>
        </div>
      </div>
    )
  }
}

export default OfferAcceptedBuyer

require('react-styl')(`
  .transaction-progress
    span.issues
      font-size: 12px
    .help
      > .btn-link
        font-size: 14px

`)
