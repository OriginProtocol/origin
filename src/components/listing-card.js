import React, { Component } from 'react'
import { Link } from 'react-router-dom'

// temporary - we should be getting an origin instance from our app,
// not using a global singleton
import origin from '../services/origin'

import ListingCardPrices from './listing-card-prices.js';

class ListingCard extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true
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
    const { address, category, loading, name, pictures, price, unitsAvailable } = this.state
    const photo = pictures && pictures.length && (new URL(pictures[0])).protocol === "data:" && pictures[0]

    return (
      <div className={`col-12 col-md-6 col-lg-4 listing-card${loading ? ' loading' : ''}`}>
        <Link to={`/listing/${address}`}>
          {!!photo &&
            <div className="photo" style={{ backgroundImage: `url("${photo}")` }}></div>
          }
          {!photo &&
            <div className="image-container d-flex justify-content-center">
              <img src="images/default-image.svg" alt="camera icon" />
            </div>
          }

          <div className="category placehold d-flex justify-content-between">
            <div>{category}</div>
            {!loading && <div>{this.props.listingId < 5 && <span className="featured badge">Featured</span>}</div>}
          </div>
          <h2 className="title placehold text-truncate">{name}</h2>

          {price > 0 && <ListingCardPrices price={price} unitsAvailable={unitsAvailable} />}
        </Link>
      </div>
    )
  }
}

export default ListingCard
