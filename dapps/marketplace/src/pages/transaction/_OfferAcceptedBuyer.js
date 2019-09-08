import React, { Component, Fragment } from 'react'
import { fbt } from 'fbt-runtime'
import dayjs from 'dayjs'

import DisputeOffer from './mutations/DisputeOffer'
import FinalizeOffer from './mutations/FinalizeOffer'

import Stages from 'components/TransactionStages'
import SendMessage from 'components/SendMessage'

import ShippingAddress from './_ShippingAddress'

const CONFIRMED_OFFERS_KEY = 'confirmed_offers'
class OfferAcceptedBuyer extends Component {
  state = {
    offerConfirmed: false
  }

  componentDidMount() {
    const offersConfirmedString = localStorage.getItem(CONFIRMED_OFFERS_KEY)
    const offer = this.props.offer

    if (offersConfirmedString) {
      this.setState({
        offerConfirmed: JSON.parse(offersConfirmedString).includes(offer.id)
      })
    }

    // if fractional for rent listing and the endDate has passed automatically set offer as confirmed
    if (
      offer.listing.category === 'schema.forRent' &&
      offer.endDate &&
      offer.listing.__typename === 'FractionalListing'
    ) {
      if (
        dayjs(offer.endDate)
          .add(1, 'day')
          .isBefore(dayjs())
      ) {
        this.setState({ offerConfirmed: true })
      }
    }
  }

  confirmOffer(offerId) {
    const offersConfirmed = JSON.parse(
      localStorage.getItem(CONFIRMED_OFFERS_KEY) || '[]'
    )
    offersConfirmed.push(offerId)
    this.setState({
      offerConfirmed: true
    })
    localStorage.setItem(CONFIRMED_OFFERS_KEY, JSON.stringify(offersConfirmed))
  }

  render() {
    const { offer } = this.props

    const { offerConfirmed } = this.state
    const isForSale = offer.listing.category === 'schema.forSale'
    const isForRent = offer.listing.category === 'schema.forRent'
    const isServices = offer.listing.category === 'schema.services'

    const offerConfirmedView = () => (
      <div className="transaction-progress">
        <div className="tx-progress-wrapper">
          <div className="tx-receipt-status top">
            <h4>
              <fbt desc="Progress.releaseFundsToSeller">
                Release the funds to the seller.
              </fbt>
            </h4>
            <Stages className="mt-4" mini="true" offer={offer} />
            <div className="help mt-3 mb-0 ">
              <fbt desc="OfferAcceptBuyer.releaseFundsConcern">
                If you&apos;re concerned about releasing the funds, report a
                problem to Origin.
              </fbt>
            </div>
            <div className="actions-offers d-flex mt-3">
              <FinalizeOffer
                disabled={false}
                offer={offer}
                refetch={this.props.refetch}
                from={offer.buyer.id}
                className="btn btn-primary"
              >
                <fbt desc="OfferAcceptBuyer.releaseFunds">Release Funds</fbt>
              </FinalizeOffer>
              <DisputeOffer
                offer={offer}
                party="seller"
                className="btn btn-link withdraw mr-md-0 ml-md-5 mb-md-0 mt-3 mt-md-0 align-self-start align-self-md-center"
              >
                <fbt desc="OfferAcceptBuyer.reportProblme">
                  Report a Problem
                </fbt>
              </DisputeOffer>
            </div>
          </div>
          <ShippingAddress offer={this.props.offer} />
        </div>
      </div>
    )

    const offerAcceptedView = () => (
      <div className="transaction-progress">
        <div className="tx-progress-wrapper">
          <div className="tx-receipt-status top">
            <h4>
              <div className="positive-emphasis">
                <fbt desc="Progress.congratulations">Congratulations!</fbt>{' '}
              </div>
              <fbt desc="Progress.offerAcceptedByTheSeller">
                Seller has accepted your offer.
              </fbt>
            </h4>
            <Stages className="mt-4" mini="true" offer={offer} />
            {isForSale && (
              <Fragment>
                <div className="help mt-3 mb-0 ">
                  <fbt desc="OfferAcceptBuyer.clickToConfirmReceipt">
                    Click below to confirm your receipt of{' '}
                    <fbt:param name="listingTitle">
                      <b>{offer.listing.title}</b>
                    </fbt:param>{' '}
                    when you get it.
                  </fbt>
                </div>
              </Fragment>
            )}
            {isForRent && (
              <Fragment>
                <div className="help mt-3 mb-0 d-flex">
                  <fbt desc="OfferAcceptBuyer.contactSellerRental">
                    <SendMessage
                      to={offer.listing.seller.id}
                      className="btn btn-link"
                    >
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
              </Fragment>
            )}
            {isServices && (
              <div className="help mt-3 mb-0 ">
                <fbt desc="OfferAcceptBuyer.confirmServiceCompleted">
                  Click below to confirm that this service has been completed.
                </fbt>
              </div>
            )}
            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  this.confirmOffer(offer.id)
                }}
              >
                <fbt desc="OfferAcceptBuyer.confirm">Confirm receipt</fbt>
              </button>
            </div>

            <div className="mt-3">
              <span className="issues mr-1">
                <fbt desc="OfferAcceptBuyer.havingIssues">Having issues?</fbt>
              </span>
              <DisputeOffer
                offer={this.props.offer}
                party="seller"
                className="btn btn-link withdraw small mr-auto"
              >
                <fbt desc="OfferAcceptBuyer.reportProblme">
                  Report a Problem
                </fbt>
              </DisputeOffer>
            </div>
          </div>
          <ShippingAddress offer={this.props.offer} />
        </div>
      </div>
    )

    return offerConfirmed ? offerConfirmedView() : offerAcceptedView()
  }
}

export default OfferAcceptedBuyer

require('react-styl')(`
  .transaction-progress
    .actions-offers
      display: flex
      button:last-of-type
        margin-bottom: 10px
    span.issues
      font-size: 12px
    .help
      > .btn-link
        font-size: 14px
    .tx-progress-wrapper
      display: flex
      flex-direction: row
      width: 100%
      .tx-receipt-status
        flex: 1

  @media (max-width: 767.98px)
    .transaction-progress
      .actions-offers
        flex-direction: column
      .tx-progress-wrapper
        flex-direction: column
`)
