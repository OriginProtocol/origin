import React, { Component } from 'react'
import contractService from '../services/contract-service'
import ipfsService from '../services/ipfs-service'
import { Link } from 'react-router-dom'

class ListingCard extends Component {

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
      console.error(`Error fetching conract info for listingId: ${this.props.listingId}`)
    })
  }

  render() {
    return (
      <Link to={`/listing/${this.props.listingId}`}>
        <div className="listing-card">
          <div className="photo">
            <img
              role='presentation'
              src={
                (this.state.pictures && this.state.pictures.length>0) ?
                this.state.pictures[0] :
                '/images/missing-image-placeholder.png'
              }
            />
          </div>
          <div className="category">{this.state.category}</div>
          <div className="title">{this.state.name}</div>
          <div className="price">{Number(this.state.price).toFixed(3)} ETH</div>
        </div>
      </Link>
    )
  }
}

export default ListingCard
