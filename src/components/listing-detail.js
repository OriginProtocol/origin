import React, { Component } from 'react'
import contractService from '../services/contract-service'
import ipfsService from '../services/ipfs-service'
import { Link } from 'react-router-dom'


const ListingDetailPhoto = () => (
  <div className="photo">

  </div>
)

class ListingsDetail extends Component {

  constructor(props) {
    super(props)
    this.state = {
      category: "Loading...",
      name: "Loading...",
      price: "Loading...",
      ipfsHash: null,
      lister: null,
      unitsAvailable: null
    }
  }

  componentWillMount() {
    console.log(`Details for listingId: ${this.props.listingId}`)
    contractService.getListing(this.props.listingId)
    .then((listingContractObject) => {
      this.setState(listingContractObject)
        ipfsService.getListing(this.state.ipfsHash)
        .then((listingJson) => {
          console.log(JSON.parse(listingJson).data)
          this.setState(JSON.parse(listingJson).data)
        })
        .catch((error) => {
          console.error(`Error fetching IPFS info for listingId: ${this.props.listingId}`)
        })
    })
    .catch((error) => {
      console.error(`Error fetching conract info for listingId: ${this.props.listingId}`)
    })
  }

  render() {
    return (
      <div className="listing-detail">
        <div className="carousel">
          <ListingDetailPhoto>
            <img
              role='presentation'
              src={
                (this.state.pictures && this.state.pictures.length>0) ?
                this.state.pictures[0] :
                '/images/missing-image-placeholder.png'
              }
            />
          </ListingDetailPhoto>
          <ListingDetailPhoto />
          <ListingDetailPhoto />
        </div>
        <div className="buy-box">
          <div>
            <span>Price</span>
            <span className="price">{this.state.price} ETH</span>
          </div>
          <div>
            <Link to={`/listing/${this.props.listingId}/buy`}>
              <button className="button">
                Buy Now
              </button>
              </Link>
            </div>
        </div>
        <div className="info-box">
          <div className="category">{this.state.category}</div>
          <div className="title">{this.state.name}</div>
          <div className="description">{this.state.description}</div>
        </div>
      </div>
    )
  }
}

export default ListingsDetail
