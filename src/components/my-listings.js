import React, { Component } from 'react'
import TransactionCard from './transaction-card'
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
        case 'sold':
          return arr.filter(l => l.soldAt)
        case 'fulfilled':
          return arr.filter(l => l.fulfilledAt)
        case 'received':
          return arr.filter(l => l.receivedAt)
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
                <a className={`list-group-item list-group-item-action${filter === 'sold' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'sold' })}>Sold</a>
                <a className={`list-group-item list-group-item-action${filter === 'fulfilled' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'fulfilled' })}>Fulfilled</a>
                <a className={`list-group-item list-group-item-action${filter === 'received' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'received' })}>Received</a>
              </div>
            </div>
            <div className="col-12 col-md-9">
              <div className="my-listings-list">
                {listings.map(l => <TransactionCard key={`my-listing-${l._id}`} listing={l} perspective="seller" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MyListings
