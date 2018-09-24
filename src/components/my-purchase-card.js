import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import { defineMessages, injectIntl } from 'react-intl'

import PurchaseProgress from 'components/purchase-progress'

import { offerStatusToStep } from 'utils/offer'

class MyPurchaseCard extends Component {
  constructor(props) {
    super(props)

    this.state = { listing: {}, loading: false }

    this.intlMessages = defineMessages({
      created: {
        id: 'my-purchase-card.created',
        defaultMessage: 'Offer made'
      },
      accepted: {
        id: 'my-purchase-card.accepted',
        defaultMessage: 'Offer accepted'
      },
      withdrawn: {
        id: 'my-purchase-card.withdrawn',
        defaultMessage: 'Offer withdrawn'
      },
      rejected: {
        id: 'my-purchase-card.rejected',
        defaultMessage: 'Offer rejected'
      },
      disputed: {
        id: 'my-purchase-card.disputed',
        defaultMessage: 'Sale disputed'
      },
      finalized: {
        id: 'my-purchase-card.finalized',
        defaultMessage: 'Sale confirmed'
      },
      reviewed: {
        id: 'my-purchase-card.reviewed',
        defaultMessage: 'Sale reviewed'
      },
      unknown: {
        id: 'my-purchase-card.unknown',
        defaultMessage: 'Unknown'
      },
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
    const created = Number(offer.createdAt)
    const soldAt = created * 1000 // convert seconds since epoch to ms
    const { category, name, pictures, price } = listing
    const voided = ['rejected', 'withdrawn'].includes(offer.status)
    const step = offerStatusToStep(offer.status)

    let verb
    switch (offer.status) {
      case 'created':
        verb = this.props.intl.formatMessage(this.intlMessages.created)
        break
      case 'accepted':
        verb = this.props.intl.formatMessage(this.intlMessages.accepted)
        break
      case 'withdrawn':
        const actor = offer.events.find(({ event }) => event === 'OfferWithdrawn').returnValues[0]

        verb = actor === offer.buyer ?
               this.props.intl.formatMessage(this.intlMessages.withdrawn) :
               this.props.intl.formatMessage(this.intlMessages.rejected)
        break
      case 'disputed':
        verb = this.props.intl.formatMessage(this.intlMessages.disputed)
        break
      case 'finalized':
        verb = this.props.intl.formatMessage(this.intlMessages.finalized)
        break
      case 'sellerReviewed':
        verb = this.props.intl.formatMessage(this.intlMessages.reviewed)
        break
      default:
        verb = this.props.intl.formatMessage(this.intlMessages.unknown)
    }

    const timestamp = `${verb} on ${this.props.intl.formatDate(soldAt)}`
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
              <p className="timestamp">{timestamp}</p>
              {!voided &&
                <Fragment>
                  <div className="d-flex">
                    <p className="price">{`${Number(price).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 5, maximumFractionDigits: 5 }
                    )} ${this.props.intl.formatMessage(this.intlMessages.ETH)}`}</p>
                    {/* Not Yet Relevant */}
                    {/* <p className="quantity">Quantity: {quantity.toLocaleString()}</p> */}
                  </div>
                  <PurchaseProgress
                    currentStep={step}
                    maxStep={3}
                    perspective="buyer"
                    subdued={true}
                  />
                </Fragment>
              }
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
