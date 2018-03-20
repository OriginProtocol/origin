import React, { Component } from 'react'
import { contractService, ipfsService } from '@originprotocol/origin'
import Modal from './modal'

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
      ipfsHash: null,
      lister: null,
      unitsAvailable: null,
      pictures: [],
      step: this.STEP.VIEW,
    }

    this.handleBuyClicked = this.handleBuyClicked.bind(this)
  }

  loadListing() {
    contractService.getListing(this.props.listingId)
    .then((listingContractObject) => {
      this.setState(listingContractObject)
      return ipfsService.getListing(this.state.ipfsHash)
    })
    .then((listingJson) => {
      const jsonData = JSON.parse(listingJson).data
      this.setState(jsonData)
    })
    .catch((error) => {
      alertify.log('There was an error loading this listing.')
      console.error(`Error fetching contract or IPFS info for listingId: ${this.props.listingId}`)
    })
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

  handleBuyClicked() {
    const unitsToBuy = 1
    const totalPrice = (unitsToBuy * this.state.price)
    this.setState({step: this.STEP.METAMASK})
    contractService.buyListing(this.props.listingId, unitsToBuy, totalPrice)
    .then((transactionReceipt) => {
      console.log("Purchase request sent.")
      this.setState({step: this.STEP.PROCESSING})
      return contractService.waitTransactionFinished(transactionReceipt.tx)
    })
    .then((blockNumber) => {
      this.setState({step: this.STEP.PURCHASED})
    })
    .catch((error) => {
      console.log(error)
      alertify.log("There was a problem purchasing this listing.\nSee the console for more details.")
      this.setState({step: this.STEP.VIEW})
    })
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
              <div className="title">{this.state.name}</div>
              <div className="description">{this.state.description}</div>
              <div className="category">Creator</div>
              <div className="description">{this.state.lister}</div>
              <a href={ipfsService.gatewayUrlForHash(this.state.ipfsHash)} target="_blank">
                View on IPFS <big>&rsaquo;</big>
              </a>
              <div className="debug">
                <li>IPFS: {this.state.ipfsHash}</li>
                <li>Lister: {this.state.lister}</li>
                <li>Units: {this.state.unitsAvailable}</li>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="buy-box">
                <div>
                  <span>Price</span>
                  <span className="price">
                    {Number(price).toLocaleString(undefined, {minimumFractionDigits: 3})} ETH
                  </span>
                </div>
                {(this.state.unitsAvailable > 1) &&
                  <div>
                    <span>Units Available</span>
                    <span className="price">{this.state.unitsAvailable.toLocaleString()}</span>
                  </div>
                }
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
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ListingsDetail
