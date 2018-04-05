import React, { Component } from 'react'
import MySaleCard from './my-sale-card'
import data from '../data'

class MySales extends Component {
  constructor(props) {
    super(props)

    this.state = { filter: 'pending' }
  }

  render() {
    const { filter } = this.state
    const listings = (() => {
      const arr = data.listings.filter(l => l.soldAt)

      switch(filter) {
        case 'pending':
          return arr.filter(l => !l.withdrawnAt)
        case 'complete':
          return arr.filter(l => l.withdrawnAt)
        default:
          return arr
      }
    })()

    return (
      <div className="my-listings-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1>My Sales</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-3">
              <div className="filters list-group flex-row flex-md-column">
                <a className={`list-group-item list-group-item-action${filter === 'pending' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'pending' })}>Pending</a>
                <a className={`list-group-item list-group-item-action${filter === 'complete' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'complete' })}>Complete</a>
                <a className={`list-group-item list-group-item-action${filter === 'all' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'all' })}>All</a>
              </div>
            </div>
            <div className="col-12 col-md-9">
              <div className="my-listings-list">
                {listings.map(l => <MySaleCard key={`my-listing-${l._id}`} listing={l} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MySales
