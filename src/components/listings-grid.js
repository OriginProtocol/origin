import React, { Component } from 'react'
import contractService from '../services/contract-service'

import ListingCard from './listing-card'


class ListingsGrid extends Component {

  constructor(props) {
    super(props)
    this.state = {listingIds: []}
  }

  componentWillMount() {
    contractService.getAllListingIds()
    .then((ids) => {
      this.setState({ listingIds: ids })
      console.log(`Listing Ids:`)
      console.log(this.state.listingIds)
    })
    .catch((error) => {
      console.error(`Error fetching listing ids`)
    })

  }

  render() {
    return (
      <div className="listings-grid">
        <h1>{this.state.listingIds.length} Listings</h1>
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
