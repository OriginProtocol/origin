import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import moment from 'moment'
import { defineMessages, injectIntl } from 'react-intl'

import PurchaseProgress from 'components/purchase-progress'

import { translateListingCategory } from 'utils/translationUtils'

class MyPurchaseCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      listing: {},
      purchasedSlots: [],
      loading: false 
    }

    this.intlMessages = defineMessages({
      received: {
        id: 'my-purchase-card.received',
        defaultMessage: 'Received'
      },
      sentBySeller: {
        id: 'my-purchase-card.sentBySeller',
        defaultMessage: 'Sent by Seller'
      },
      purchased: {
        id: 'my-purchase-card.purchased',
        defaultMessage: 'Purchased'
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

    this.getPrice = this.getPrice.bind(this)
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  getPrice() {
    let price

    if (this.state.listing.listingType === 'fractional') {
      price = this.state.purchasedSlots.reduce((totalPrice, nextPrice) => totalPrice + nextPrice.priceWei, 0)
    } else {
      price = Number(this.state.listing.price).toLocaleString(undefined, { minimumFractionDigits: 3 })
    }

    return price
  }

  getBookingDates(whichDate) {
    const { purchasedSlots, listing } = this.state
    const timeFormat = listing.schemaType === 'housing' ? 'LL' : 'l LT'
    const index = whichDate === 'startDate' ? 0 : purchasedSlots.length - 1

    return moment(purchasedSlots[index][whichDate]).format(timeFormat)
  }

  render() {
    const { listing, offer, offerId } = this.props
    const created = Number(offer.createdAt)
    const soldAt = created * 1000 // convert seconds since epoch to ms
    const { category, name, pictures } = translateListingCategory(
      listing.ipfsData.data
    )
    const step = Number(offer.status)
    let verb

    switch (step) {
    case 3:
      verb = this.props.intl.formatMessage(this.intlMessages.received)
      break
    case 2:
      verb = this.props.intl.formatMessage(this.intlMessages.sentBySeller)
      break
    case 1:
      verb = this.props.intl.formatMessage(this.intlMessages.purchased)
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
              {this.state.listing.listingType === 'fractional' &&
                <div className="d-flex">
                  <p className="booking-dates">{ `${this.getBookingDates('startDate')} - ${this.getBookingDates('endDate')}`}</p>
                </div>
              }
              <div className="d-flex">
                <p className="price">{`${this.getPrice().toLocaleString(
                  undefined,
                  { minimumFractionDigits: 5, maximumFractionDigits: 5 }
                )} ${this.props.intl.formatMessage(this.intlMessages.ETH)}`}</p>
                {/* Not Yet Relevant */}
                {/* <p className="quantity">Quantity: {quantity.toLocaleString()}</p> */}
              </div>
              <PurchaseProgress
                currentStep={step}
                perspective="buyer"
                subdued={true}
              />
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
