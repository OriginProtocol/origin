import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class ListingCard extends Component {

  constructor(props) {
    super(props)
    this.state = {
      photo: null,
      category: "Loading...",
      title: "Loading...",
      price: "Loading...",
      ipfsHash: null
    }
  }

  render() {
    return (
      <Link to="/listing/42">
        <div className="listing-card">
          <div className="photo">{this.state.photo && <img src="{this.state.photo}" />}</div>
          <div className="category">{this.state.category}</div>
          <div className="title">{this.state.title}</div>
          <div className="price">{this.state.price} ETH</div>
        </div>
      </Link>
    )
  }
}

export default ListingCard
