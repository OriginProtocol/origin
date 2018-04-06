import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Modal from './modal'
import Review from './review'

import data from '../data'

// temporary - we should be getting an origin instance from our app,
// not using a global singleton
import origin from '@originprotocol/origin' 

const alertify = require('../../node_modules/alertify/src/alertify.js')

class ListingsDetail extends Component {

  constructor(props) {
    super(props)

    this.STEP = {
      VIEW: 1,
      METAMASK: 2,
      PROCESSING: 3,
      PURCHASED: 4,
    }

    this.state = {
      category: "Loading...",
      name: "Loading...",
      price: "Loading...",
      address: null,
      ipfsHash: null,
      sellerAddress: null,
      unitsAvailable: null,
      pictures: [],
      step: this.STEP.VIEW,
    }

    this.handleBuyClicked = this.handleBuyClicked.bind(this)
  }

  async loadListing() {
    try {
      const listing = await origin.listings.getByIndex(this.props.listingId)
      this.setState(listing)
    } catch (error) {
      alertify.log('There was an error loading this listing.')
      console.error(`Error fetching contract or IPFS info for listingId: ${this.props.listingId}`)
    }
  }

  componentWillMount() {
    if (this.props.listingId) {
      // Load from IPFS
      this.loadListing()
    }
    else if (this.props.listingJson) {
      // Listing json passed in directly
      this.setState(this.props.listingJson)
    }
  }

  async handleBuyClicked() {
    const unitsToBuy = 1
    const totalPrice = (unitsToBuy * this.state.price)
    this.setState({step: this.STEP.METAMASK})
    try {
      const transactionReceipt = await origin.listings.buy(this.state.address, unitsToBuy, totalPrice)
      console.log("Purchase request sent.")
      this.setState({step: this.STEP.PROCESSING})
      const blockNumber = await origin.contractService.waitTransactionFinished(transactionReceipt.tx)
      this.setState({step: this.STEP.PURCHASED})
    } catch (error) {
      window.err = error
      console.log(error)
      alertify.log("There was a problem purchasing this listing.\nSee the console for more details.")
      this.setState({step: this.STEP.VIEW})
    }
  }


  render() {
    const price = typeof this.state.price === 'string' ? 0 : this.state.price
    return (
      <div className="listing-detail">
        {this.state.step===this.STEP.METAMASK &&
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="/images/spinner-animation.svg" role="presentation"/>
            </div>
            Confirm transaction<br />
            Press &ldquo;Submit&rdquo; in MetaMask window
          </Modal>
        }
        {this.state.step===this.STEP.PROCESSING &&
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="/images/spinner-animation.svg" role="presentation"/>
            </div>
            Processing your purchase<br />
            Please stand by...
          </Modal>
        }
        {this.state.step===this.STEP.PURCHASED &&
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="/images/circular-check-button.svg" role="presentation"/>
            </div>
            Purchase was successful.<br />
            <a href="#" onClick={()=>window.location.reload()}>
              Reload page
            </a>
          </Modal>
        }
        {this.state.pictures &&
          <div className="carousel">
            {this.state.pictures.map(pictureUrl => (
              <div className="photo" key={pictureUrl}>
                {(new URL(pictureUrl).protocol === "data:") &&
                  <img src={pictureUrl} role='presentation' />
                }
              </div>
            ))}
          </div>
        }
        <div className="container listing-container">
          <div className="row">
            <div className="col-12 col-md-8 detail-info-box">
              <div className="category">{this.state.category}</div>
              <div className="title text-truncate">{this.state.name}</div>
              <div className="description">{this.state.description}</div>
              {this.state.unitsAvailable && this.state.unitsAvailable < 5 &&
                <div className="units-available text-danger">Just {this.state.unitsAvailable.toLocaleString()} left!</div>
              }
              {!this.state.unitsAvailable &&
                <div className="units-available text-danger">Sold out!</div>
              }
              <a href={origin.ipfsService.gatewayUrlForHash(this.state.ipfsHash)} target="_blank">
                View on IPFS<img src="/images/carat.svg" className="carat" alt="right carat" />
              </a>
              <div className="debug">
                <li>IPFS: {this.state.ipfsHash}</li>
                <li>Seller: {this.state.sellerAddress}</li>
                <li>Units: {this.state.unitsAvailable}</li>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="buy-box">
                <div className="price d-flex justify-content-between">
                  <p>Price</p>
                  <p className="text-right">
                    {Number(price).toLocaleString(undefined, {minimumFractionDigits: 3})} ETH
                  </p>
                </div>
                {/* What is this? */}
                {/* <div className="contract-price d-flex justify-content-between">
                                  <p>Contract Price</p>
                                  <p className="price text-right">
                                    {Number(price).toLocaleString(undefined, {minimumFractionDigits: 3})} ETH
                                  </p>
                                </div> */}
                {/* Via Matt 4/5/2018: Hold off on allowing buyers to select quantity > 1 */}
                {/* <div className="quantity d-flex justify-content-between">
                                  <p>Quantity</p>
                                  <p className="text-right">
                                    {Number(1).toLocaleString()}
                                  </p>
                                </div>
                                <div className="total-price d-flex justify-content-between">
                                  <p>Total Price</p>
                                  <p className="price text-right">
                                    {Number(price).toLocaleString(undefined, {minimumFractionDigits: 3})} ETH
                                  </p>
                                </div> */}
                <div>
                  {(this.props.listingId) && (
                    (this.state.unitsAvailable > 0) ?
                      <button
                        className="button"
                        onClick={this.handleBuyClicked}
                        disabled={!this.props.listingId}
                        onMouseDown={e => e.preventDefault()}
                      >
                        Buy Now
                      </button>
                      :
                      <div className="sold-banner">
                        <img src="/images/sold-tag.svg" role="presentation" />
                        Sold
                      </div>
                    )
                  }
                </div>
              </div>
              <div className="counterparty">
                <div className="identity">
                  <h3>About the seller</h3>
                  <div className="d-flex">
                    <div className="image-container">
                      <Link to="/profile">
                        <img src="/images/identicon.png"
                          srcSet="/images/identicon@2x.png 2x, /images/identicon@3x.png 3x"
                          alt="wallet icon" />
                      </Link>
                    </div>
                    <div>
                      <p>ETH Address:</p>
                      <p><strong>{this.state.sellerAddress}</strong></p>
                    </div>
                  </div>
                  <hr />
                  <div className="d-flex">
                    <div className="avatar-container">
                      <img src="/images/avatar-blue.svg" alt="avatar" />
                    </div>
                    <div className="identification">
                      <p>Aure Gimon</p>
                      <img src="/images/twitter-icon-verified.svg" alt="Twitter verified icon" />
                    </div>
                  </div>
                </div>
                <Link to={`/users/${this.state.sellerAddress}`} className="btn">View Profile</Link>
              </div>
            </div>
          </div>
          {!!data.reviews.length &&
            <div className="row">
              <div className="col-12 col-md-8">
                <hr />
                <div className="reviews">
                  <h2>Reviews <span className="review-count">57</span></h2>
                  {data.reviews.map(r => <Review key={r._id} review={r} />)}
                  <a href="#" className="reviews-link" onClick={() => alert('To Do')}>Read More<img src="/images/carat.svg" className="down carat" alt="down carat" /></a>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

export default ListingsDetail
