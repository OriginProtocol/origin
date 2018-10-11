import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import { defineMessages, injectIntl } from 'react-intl'

import OfferStatusEvent from 'components/offer-status-event'
import PurchaseProgress from 'components/purchase-progress'

import { offerStatusToStep } from 'utils/offer'

class MyPurchaseCard extends Component {
  constructor(props) {
    super(props)

    this.state = { listing: {}, loading: false }

    this.intlMessages = defineMessages({
      ETH: {
        id: 'my-purchase-card.ethereumCurrencyAbbrev',
        defaultMessage: 'ETH'
      }
    })
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  componentWillUnmount() {
    $('[data-toggle="tooltip"]').tooltip('dispose')
  }

  render() {
    const { listing, offer, offerId } = this.props
    const { category, name, pictures, price } = listing
    const { status } = offer
    const voided = ['rejected', 'withdrawn'].includes(status)
    const maxStep = ['disputed', 'ruling'].includes(status) ? 4 : 3
    const step = offerStatusToStep(status)
    const photo = pictures && pictures.length > 0 && pictures[0]

    return (
      <div className={`purchase card${this.state.loading ? ' loading' : ''}`}>
        <div className="card-body d-flex flex-column flex-lg-row">
          <div className="aspect-ratio">
            <Link to={`/purchases/${offerId}`}>
              <div
                className={`${
                  photo ? '' : 'placeholder '
                }image-container d-flex justify-content-center`}
              >
                <img
                  src={photo || 'images/default-image.svg'}
                  role="presentation"
                />
              </div>
            </Link>
          </div>
          {!this.state.loading && (
            <div className="content-container d-flex flex-column">
              <p className="category">{category}</p>
              <h2 className="title text-truncate">
                <Link to={`/purchases/${offerId}`}>{name}</Link>
              </h2>
              <p className="timestamp">
                <OfferStatusEvent offer={offer} />
              </p>
              {!voided && (
                <Fragment>
                  <div className="d-flex">
                    <p className="price">{`${Number(price).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 5, maximumFractionDigits: 5 }
                    )} ${this.props.intl.formatMessage(
                      this.intlMessages.ETH
                    )}`}</p>
                    {/* Not Yet Relevant */}
                    {/* <p className="quantity">Quantity: {quantity.toLocaleString()}</p> */}
                  </div>
                  <PurchaseProgress
                    currentStep={step}
                    maxStep={maxStep}
                    perspective="buyer"
                    purchase={offer}
                    subdued={true}
                  />
                </Fragment>
              )}
              <div className="actions d-flex">
                <div className="links-container">
                  {/*<a onClick={() => alert('To Do')}>Open a Dispute</a>*/}
                </div>
                <div className="button-container">
                  {/* Hidden for current deployment */}
                  {/* stage === 'buyer_pending' &&
                    <a className="btn btn-primary btn-sm" onClick={() => alert('To Do')}>
                      <FormattedMessage
                        id={ 'my-purchase-card.iReceivedTheOrder' }
                        defaultMessage={ 'I\'ve Received the Order' }
                      />
                    </a>
                  */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default injectIntl(MyPurchaseCard)
