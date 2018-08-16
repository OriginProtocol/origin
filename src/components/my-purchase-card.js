import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import PurchaseProgress from 'components/purchase-progress'

import { translateListingCategory } from 'utils/translationUtils'

import origin from '../services/origin'

class MyPurchaseCard extends Component {
  constructor(props) {
    super(props)

    this.loadListing = this.loadListing.bind(this)
    this.state = { listing: {}, loading: true }

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
  }

  async loadListing(addr) {
    try {
      const listing = await origin.listings.get(addr)

      this.setState({ listing, loading: false })
    } catch(error) {
      console.error(`Error fetching contract or IPFS info for listing: ${addr}`)
    }
  }

  componentDidMount() {
    this.loadListing(this.props.purchase.listingAddress)

    $('[data-toggle="tooltip"]').tooltip()
  }

  render() {
    const { address, created, stage } = this.props.purchase
    const { category, name, pictures, price } = translateListingCategory(this.state.listing)
    const soldAt = created * 1000 // convert seconds since epoch to ms
    let step, verb

    switch(stage) {
      case 'seller_pending':
        step = 3
        verb = this.props.intl.formatMessage(this.intlMessages.received)
        break
      case 'buyer_pending':
        step = 2
        verb = this.props.intl.formatMessage(this.intlMessages.sentBySeller)
        break
      case 'in_escrow':
        step = 1
        verb = this.props.intl.formatMessage(this.intlMessages.purchased)
        break
      default:
        step = 0
        verb = this.props.intl.formatMessage(this.intlMessages.unknown)
    }

    const timestamp = `${verb} on ${this.props.intl.formatDate(soldAt)}`
    const photo = pictures && pictures.length > 0 && (new URL(pictures[0])).protocol === "data:" && pictures[0]

    return (
      <div className={`purchase card${this.state.loading ? ' loading' : ''}`}>
        <div className="card-body d-flex flex-column flex-lg-row">
          <div className="aspect-ratio">
            <Link to={`/purchases/${address}`}>
              <div className={`${photo ? '' : 'placeholder '}image-container d-flex justify-content-center`}>
                <img src={photo || 'images/default-image.svg'} role="presentation" />
              </div>
            </Link>
          </div>
          {!this.state.loading &&
            <div className="content-container d-flex flex-column">
              <p className="category">{category}</p>
              <h2 className="title text-truncate"><Link to={`/purchases/${address}`}>{name}</Link></h2>
              <p className="timestamp">{timestamp}</p>
              <div className="d-flex">
                <p className="price">{`${Number(price).toLocaleString(undefined, { minimumFractionDigits: 3 })} ${this.props.intl.formatMessage(this.intlMessages.ETH)}`}</p>
                {/* Not Yet Relevant */}
                {/* <p className="quantity">Quantity: {quantity.toLocaleString()}</p> */}
              </div>
              <PurchaseProgress currentStep={step} perspective="buyer" purchase={this.props.purchase} subdued={true} />
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
          }
        </div>
      </div>
    )
  }
}

export default injectIntl(MyPurchaseCard)
