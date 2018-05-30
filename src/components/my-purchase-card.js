import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import moment from 'moment'

import origin from '../services/origin'

class MyPurchaseCard extends Component {
  constructor(props) {
    super(props)

    this.loadListing = this.loadListing.bind(this)
    this.state = { listing: {}, loading: true }
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
    const { category, name, pictures, price } = this.state.listing
    const soldAt = created * 1000 // convert seconds since epoch to ms
    let step, verb

    switch(stage) {
      case 'seller_pending':
        step = 3
        verb = 'Received'
        break
      case 'buyer_pending':
        step = 2
        verb = 'Sent by seller'
        break
      case 'shipping_pending':
        step = 1
        verb = 'Purchased'
        break
      default:
        step = 0
        verb = 'Unknown'
    }

    const timestamp = `${verb} on ${moment(soldAt).format('MMMM D, YYYY')}`
    const photo = pictures && pictures.length > 0 && (new URL(pictures[0])).protocol === "data:" && pictures[0]

    return (
      <div className={`transaction card${this.state.loading ? ' loading' : ''}`}>
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
                <p className="price">{`${Number(price).toLocaleString(undefined, { minimumFractionDigits: 3 })} ETH`}</p>
                {/* Not Yet Relevant */}
                {/* <p className="quantity">Quantity: {quantity.toLocaleString()}</p> */}
              </div>
              {/*<TransactionProgress currentStep={step} perspective="buyer" purchase={this.props.purchase} subdued={true} />*/}
              <div className="actions d-flex">
                <div className="links-container">
                  {/*<a onClick={() => alert('To Do')}>Open a Dispute</a>*/}
                </div>
                <div className="button-container">
                  {/* Hidden for current deployment */}
                  {/* stage === 'buyer_pending' &&
                    <a className="btn btn-primary btn-sm" onClick={() => alert('To Do')}>I&apos;ve Received the Order</a>
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

export default MyPurchaseCard
