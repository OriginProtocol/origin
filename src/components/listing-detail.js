import React, { Component } from 'react'
import contractService from '../services/contract-service'
import ipfsService from '../services/ipfs-service'

import Overlay from './overlay'

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
        ipfsService.getListing(this.state.ipfsHash)
        .then((listingJson) => {
          this.setState(JSON.parse(listingJson).data)
        })
        .catch((error) => {
          console.error(`Error fetching IPFS info for listingId: ${this.props.listingId}`)
        })
    })
    .catch((error) => {
      console.error(`Error fetching contract info for listingId: ${this.props.listingId}`)
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
      contractService.waitTransactionFinished(transactionReceipt.tx)
      .then((blockNumber) => {
        this.setState({step: this.STEP.PURCHASED})
      })
    })
    .catch((error) => {
      console.log(error)
      alert(error)
      this.setState({step: this.STEP.VIEW})
    })
  }

  render() {
    return (
      <div className="listing-detail">
        {this.state.step===this.STEP.METAMASK &&
          <Overlay imageUrl="/images/spinner-animation.svg">
            Confirm transaction<br />
            Press &ldquo;Submit&rdquo; in MetaMask window
          </Overlay>
        }
        {this.state.step===this.STEP.PROCESSING &&
          <Overlay imageUrl="/images/spinner-animation.svg">
            Processing your purchase<br />
            Please stand by...
          </Overlay>
        }
        {this.state.step===this.STEP.PURCHASED &&
          <Overlay imageUrl="/images/circular-check-button.svg">
            Purchase was successful.<br />
            <a href="#" onClick={()=>window.location.reload()}>
              Reload page
            </a>
          </Overlay>
        }
        {this.state.pictures &&
          <div className="carousel">
            {this.state.pictures.map(pictureUrl => (
              <div className="photo" key={pictureUrl}>
                <img src={pictureUrl} role='presentation' />
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
                    {Number(this.state.price).toLocaleString(undefined, {minimumFractionDigits: 3})} ETH
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
