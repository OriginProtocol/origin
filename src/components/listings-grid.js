import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

const ListingCard = () => (
  <Link to="/listing/42">
    <div className="listing-card">
      <div className="photo"></div>
      <div className="category">Category</div>
      <div className="title">Title Here</div>
      <div className="price">42.0 ETH</div>
    </div>
  </Link>
)

class ListingsGrid extends Component {
  render() {
    return (
      <div className="listings-grid">
        <h1>300+ Listings</h1>
        <ul>
          <ListingCard />
          <ListingCard />
          <ListingCard />
          <ListingCard />
          <ListingCard />
          <ListingCard />
          <ListingCard />
          <ListingCard />
        </ul>
      </div>
    )
  }
}

export default ListingsGrid
