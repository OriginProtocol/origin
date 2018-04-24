import React, { Component } from 'react'
import MyListingCard from './my-listing-card'
import data from '../data'

import origin from '../services/origin'

class MyListings extends Component {
  constructor(props) {
    super(props)

    this.getListingIds = this.getListingIds.bind(this)
    this.loadListing = this.loadListing.bind(this)
    this.loadListings = this.loadListings.bind(this)
    this.state = { filter: 'all', listings: [], loading: true }
  }

  async loadListing(id) {
    try {
      const listing = await origin.listings.getByIndex(id)

      if (listing.sellerAddress === window.web3.eth.accounts[0]) {
        const listings = [...this.state.listings, listing]

        this.setState({ listings })
      }

      return listing
    } catch(error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${id}`)
    }
  }

  async loadListings(ids) {
    return await Promise.all(ids.map(this.loadListing))
  }

  async getListingIds() {
    try {
      const ids = await origin.listings.allIds()

      return this.loadListings(ids)
    } catch(error) {
      console.error('Error fetching listing ids')
    }
  }

  // simulate a getListingsBySellerAddress request
  async componentWillMount() {
    await this.getListingIds()

    this.setState({ loading: false })
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
