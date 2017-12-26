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
      pictures: []
    }
  }

  componentWillMount() {
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

  render() {
    return (
      <div className="listing-detail">
        <div className="carousel">
          {this.state.pictures.map(pictureUrl => (
            <img src={pictureUrl} role='presentation' key={pictureUrl}/>
          ))}
        </div>
        <div className="buy-box">
          <div>
            <span>Price</span>
            <span className="price">{Number(this.state.price).toFixed(3)} ETH</span>
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
