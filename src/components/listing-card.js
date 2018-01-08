import React, { Component } from 'react'
import originService from '../services/origin-service'
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

  componentDidMount() {
    originService.getListing(this.props.listingId).then((result) => {
      this.setState({ ...result.contract, ...JSON.parse(result.listing).data });
    })
  }

  render() {
    return (
      <div className="col-12 col-md-6 col-lg-4 listing-card">
        <Link to={`/listing/${this.props.listingId}`}>
          <div className="photo" style={{backgroundImage:`url("${
            (this.state.pictures && this.state.pictures.length>0) ?
                this.state.pictures[0] :
                '/images/default-image.jpg'}")`
          }}>
          </div>
          <div className="category">{this.state.category}</div>
          <div className="title">{this.state.name}</div>
          <div className="price">
              {Number(this.state.price).toLocaleString(undefined, {minimumFractionDigits: 3})} ETH
              {this.state.unitsAvailable===0 &&
                <span className="sold-banner">Sold</span>
              }
          </div>
        </Link>
      </div>
    )
  }
}

export default ListingCard
