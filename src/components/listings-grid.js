import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import ListingCard from './listing-card'


class ListingsGrid extends Component {

  constructor(props) {
    super(props)
    this.state = {listingIds: [0,1,2]}
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
