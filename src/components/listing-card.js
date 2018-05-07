import React, { Component } from 'react'
import { Link } from 'react-router-dom'

// temporary - we should be getting an origin instance from our app,
// not using a global singleton
import origin from '../services/origin'

class ListingCard extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
    }
  }

  async componentDidMount() {
    try {
      const listing = await origin.listings.getByIndex(this.props.listingId)
      const obj = Object.assign({}, listing, { loading: false })

      this.setState(obj)
    } catch (error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${this.props.listingId}`)
    }
  }

  render() {
    return (
      <div className={`col-12 col-md-6 col-lg-4 listing-card${this.state.loading ? ' loading' : ''}`}>
        <Link to={`/listing/${this.state.address}`}>
          <div className="photo" style={{backgroundImage:`url("${
            (this.state.pictures && this.state.pictures.length>0 &&
              (new URL(this.state.pictures[0])).protocol === "data:") ?
                this.state.pictures[0] :
                '/images/default-image.jpg'}")`
          }}>
          </div>
          <p className="category placehold">{this.state.category}</p>
          <h2 className="title placehold">{this.state.name}</h2>
          <div className="d-flex align-items-center">
            <p className="price placehold">
              {this.state.price && `${Number(this.state.price).toLocaleString(undefined, {minimumFractionDigits: 3})} ETH`}
            </p>
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
