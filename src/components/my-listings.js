import React, { Component } from 'react'
import MyListingCard from './my-listing-card'
import data from '../data'

class MyListings extends Component {
  constructor(props) {
    super(props)

    this.state = { filter: 'all' }
  }

  render() {
    const { filter } = this.state
    const listings = (() => {
      const arr = data.listings

      switch(filter) {
        case 'active':
          return arr.filter(l => l.active)
        case 'inactive':
          return arr.filter(l => !l.active)
        default:
          return arr
      }
    })()

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
              <div className="filters list-group flex-row flex-md-column">
                <a className={`list-group-item list-group-item-action${filter === 'all' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'all' })}>All</a>
                <a className={`list-group-item list-group-item-action${filter === 'active' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'active' })}>Active</a>
                <a className={`list-group-item list-group-item-action${filter === 'inactive' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'inactive' })}>Inactive</a>
              </div>
            </div>
            <div className="col-12 col-md-9">
              <div className="my-listings-list">
                {listings.map(l => <MyListingCard key={`my-listing-${l._id}`} listing={l} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MyListings
