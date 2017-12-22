import React, { Component } from 'react'

const Listing = () => (
  <div className="listing">
  	<div className="photo"></div>
  	<div className="category">Category</div>
  	<div className="title">Title Here</div>
  	<div className="price">42.0 ETH</div>
  </div>
)

class Listings extends Component {

  render() {
    return (
    	<div>
    		<h1>Listings</h1>
    		<ul>
					<Listing />
					<Listing />
					<Listing />
					<Listing />
					<Listing />
					<Listing />
					<Listing />
					<Listing />
					<Listing />
    		</ul>
    	</div>
    )
	}
}

export default Listings
