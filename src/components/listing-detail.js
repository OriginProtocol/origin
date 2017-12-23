import React, { Component } from 'react'
import { Link } from 'react-router-dom'

const ListingDetailPhoto = () => (
  <div className="photo">

  </div>
)

class ListingsDetail extends Component {

  render() {
    return (
      <div className="listing-detail">
        <div className="carousel">
          <ListingDetailPhoto />
          <ListingDetailPhoto />
          <ListingDetailPhoto />
        </div>
        <div className="buy-box">
          <div>
            <span>Price</span>
            <span className="price">200 ETH</span>
          </div>
          <div>
            <Link to="/listing/42/buy">
              <button className="button">
                Buy Now
              </button>
              </Link>
            </div>
        </div>
        <div className="info-box">
          <div className="category">Cars & Trucks</div>
          <div className="title">Title Here and Can Be long like this</div>
          <div className="description">
            Aliquam diam orci, tristique id consectetur et, lobortis eu magna. Donec vel diam nunc. Vivamus molestie purus non tempor pulvinar. Nunc non vestibulum neque, in tincidunt nunc. Pellentesque eleifend congue ante, congue laoreet enim facilisis quis. Fusce vestibulum odio at vulputate consequat.
          </div>
        </div>
      </div>
    )
  }
}

export default ListingsDetail
