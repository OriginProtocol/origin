import React, { Component } from 'react'
import contractService from '../services/contract-service'

import ListingCard from './listing-card'


class ListingsGrid extends Component {

  constructor(props) {
    super(props)
    this.state = {listingIds: []}
  }

  componentWillMount() {
    console.log("Web3:")
    console.log(window.web3)
    contractService.getAllListingIds()
    .then((ids) => {
      this.setState({ listingIds: ids })
    })
    .catch((error) => {
      console.error(`Error fetching listing ids`)
    })

  }

  render() {
    return (
      <div className="listings-grid">
        <h1>300+ Listings</h1>
        <ul>
          {this.state.listingIds.map(listingId => (
            <ListingCard listingId={listingId} key={listingId}/>
          ))}
        </ul>
      </div>
    )
  }
}

export default ListingsGrid
