import React, { Component } from 'react'
import contractService from '../services/contract-service'
import ipfsService from '../services/ipfs-service'
import { Link } from 'react-router-dom'

class ListingsDetail extends Component {

  constructor(props) {
    super(props)
    this.state = {
      category: "Loading...",
      name: "Loading...",
      price: "Loading...",
      ipfsHash: null,
      lister: null,
      unitsAvailable: null,
      pictures: [],
      isSubmitted: false,
    }

    this.handleBuyClicked = this.handleBuyClicked.bind(this)

    // console.log(`ETH USD: ${cc.price('ETH','USD')}`)
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

      // TODO: HACK!
      window.setTimeout(() => {this.setState(this.props.listingJson)}, 1000);


      // TODO: Use Object() to merge..need to look up
      // for (var prop in this.props.listingJson) {
      //   this.state[prop] = this.props.listingJson[prop]
      // }
    }
  }

  handleBuyClicked() {
    const unitsToBuy = 1;
    const totalPrice = (unitsToBuy * this.state.price);
    contractService.buyListing(this.props.listingId, unitsToBuy, totalPrice)
    .then((transactionReceipt) => {
      console.log("Purchase request sent.")
      this.setState({isSubmitted: true})
      contractService.waitTransactionFinished(transactionReceipt.tx)
      .then((blockNumber) => {
        // Re-load listing to show change
        // TODO: Some sort of succes page with tx reference?
        this.setState({isSubmitted: false})
        this.loadListing()
      })
    })
    .catch((error) => {
      console.log(error)
      alert(error)
    });
  }

  render() {
    console.log(this.state.pictures)
    return (
      <div className="listing-detail">
        {this.state.isSubmitted &&
          <div className="overlay">
            <div className="h-100 row align-items-center text-center">
              <div className="col" style={{width:100}}>
                Processing...
                <div><img src="/images/ajax-loader.gif" role="presentation"/></div>
              </div>
            </div>
          </div>
        }
        {this.state.pictures && this.state.pictures.length &&
          <div className="carousel">
            {this.state.pictures && this.state.pictures.map(pictureUrl => (
              <div className="photo" key={pictureUrl}>
                <img src={pictureUrl} role='presentation' />
              </div>
            ))}
          </div>
        }
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-8 detail-info-box">

              <div className="category">{this.state.category}</div>
              <div className="title">{this.state.name}</div>
              <div className="description">{this.state.description}</div>
              <a href={`http://gateway.originprotocol.com/ipfs/${this.state.ipfsHash}`} target="_blank">View on IPFS <big>&rsaquo;</big></a>
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
                  <span className="price">{Number(this.state.price).toLocaleString(undefined, {minimumFractionDigits:3})} ETH</span>
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
                      <Link to={`/listing/${this.props.listingId}/buy`}>
                        <button
                          className="button"
                          onClick={this.handleBuyClicked}
                          disabled={!this.props.listingId}
                        >
                          Buy Now
                        </button>
                      </Link>
                      :
                      <div className="sold-banner">
                        <img src="/images/sold-tag.svg" />
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
