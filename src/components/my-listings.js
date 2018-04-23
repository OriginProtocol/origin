import React, { Component } from 'react'
import MyListingCard from './my-listing-card'
import data from '../data'

import origin from '../services/origin'

class MyListings extends Component {
  constructor(props) {
    super(props)

    this.loadListing = this.loadListing.bind(this)
    this.state = { filter: 'all', listings: [], loading: true }
  }

  async loadListing(id) {
    try {
      const listing = await origin.listings.getByIndex(id)

      if (listing.sellerAddress === window.web3.eth.accounts[0]) {
        const listings = [...this.state.listings, listing]

        this.setState({ listings })
      }
    } catch (error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${id}`)
    }
  }

  // simulate a getListingsBySellerAddress request
  componentWillMount() {
    origin.listings.allIds()
    .then((response) => {
      response.forEach(id => {
        this.loadListing(id)
      })

      this.setState({ loading: false })
    })
    .catch((error) => {
      console.log(error)
    })
  }

  render() {
    // const { filter, listings } = this.state
    // const filteredListings = (() => {
    //   const arr = data.listings

    //   switch(filter) {
    //     case 'active':
    //       return arr.filter(l => l.active)
    //     case 'inactive':
    //       return arr.filter(l => !l.active)
    //     default:
    //       return arr
    //   }
    // })()

    return (
      <div className="my-listings-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1>My Listings</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-3">
              {this.state.loading && 'Loading...'}
              {/*<div className="filters list-group flex-row flex-md-column">
                              <a className={`list-group-item list-group-item-action${filter === 'all' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'all' })}>All</a>
                              <a className={`list-group-item list-group-item-action${filter === 'active' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'active' })}>Active</a>
                              <a className={`list-group-item list-group-item-action${filter === 'inactive' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'inactive' })}>Inactive</a>
                            </div>*/}
            </div>
            <div className="col-12 col-md-9">
              <div className="my-listings-list">
                {this.state.listings.map(l => <MyListingCard key={`my-listing-${l.address}`} listing={l} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MyListings
