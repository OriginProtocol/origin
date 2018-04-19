import React, { Component } from 'react'
import { Link } from 'react-router-dom'

// temporary - we should be getting an origin instance from our app,
// not using a global singleton
import origin from '../services/origin'
global.fetch = require('node-fetch')
const cc = require('cryptocompare')

const targetCurrencyCode = 'ETH';

class ListingCard extends Component {

  constructor(props) {
    super(props)
    this.state = {
      category: "Loading...",
      name: "Loading...",
      price: "Loading...",
      approxPrice: "Loading...",
      currencyCode: "USD",
      ipfsHash: null,
      lister: null,
      unitsAvailable: null
    }
  }

  async componentDidMount() {
    try {
      const listing = await origin.listings.getByIndex(this.props.listingId)
      this.setState(listing)
      this.retrieveConversion()
    } catch (error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${this.props.listingId}`)
    }
  }

  retrieveConversion(currencyCode){
    const desiredCurrencyCode = currencyCode ? currencyCode : this.state.currencyCode
    return new Promise((resolve, reject) => {
      cc.price(targetCurrencyCode, [desiredCurrencyCode]).then(prices => {
        resolve(this.setState({ approxPrice: prices[desiredCurrencyCode] * this.state.price }));
      })
      .catch(console.error)
    });
  }

  render() {

    return (
      <div className="col-12 col-md-6 col-lg-4 listing-card">
        <Link to={`/listing/${this.props.listingId}`}>
          <div className="photo" style={{backgroundImage:`url("${
            (this.state.pictures && this.state.pictures.length>0 &&
              (new URL(this.state.pictures[0])).protocol === "data:") ?
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
          <div className="price approxPrice">
            (~{Number(this.state.approxPrice).toLocaleString(undefined, {minimumFractionDigits: 0})} {this.state.currencyCode})
          </div>
        </Link>
      </div>
    )
  }
}

export default ListingCard
