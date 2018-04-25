import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import moment from 'moment'
import TransactionProgress from './transaction-progress'

import origin from '../services/origin'

class MyPurchaseCard extends Component {
  constructor(props) {
    super(props)

    this.loadListing = this.loadListing.bind(this)
    this.state = { listing: {} }
  }

  async loadListing(addr) {
    try {
      const listing = await origin.listings.get(addr)

      this.setState({ listing })
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
    let date, step, verb

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

    const timestamp = `${verb} on ${moment(created).format('MMMM D, YYYY')}`

    return (
      <div className="transaction card">
        <div className="card-body d-flex flex-column flex-lg-row">
          <div className="aspect-ratio">
            <div className="image-container">
              <a onClick={() => alert('To Do')}>
                <img src={(pictures && pictures.length > 0 && (new URL(pictures[0])).protocol === "data:") ? pictures[0] : '/images/default-image.jpg'} role="presentation" />
              </a>
            </div>
          </div>
          <div className="content-container d-flex flex-column">
            <p className="category">{category}</p>
            <h2 className="title text-truncate"><a onClick={() => alert('To Do')}>{name}</a></h2>
            {/* Purchase detail not ready for real address */}
            {/*<h2 className="title text-truncate"><Link to={`/my-purchases/${address}`}>{name}</Link></h2>*/}
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
                {stage === 'buyer_pending' &&
                  <a className="btn btn-primary btn-sm" onClick={() => alert('To Do')}>I&apos;ve Received the Order</a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MyPurchaseCard
