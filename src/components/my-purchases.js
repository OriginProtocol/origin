import React, { Component } from 'react'
import MyPurchaseCard from './my-purchase-card'
import data from '../data'

class MyPurchases extends Component {
  constructor(props) {
    super(props)

    this.state = { filter: 'pending' }
  }

  render() {
    const { filter } = this.state
    const purchases = (() => {
      const arr = data.listings

      switch(filter) {
        case 'pending':
          return arr.filter(p => !p.reviewedAt)
        case 'complete':
          return arr.filter(p => p.reviewedAt)
        default:
          return arr
      }
    })()

    return (
      <div className="my-listings-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1>My Purchases</h1>
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
                {purchases.map(p => <MyPurchaseCard key={`my-purchase-${p._id}`} listing={p} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MyPurchases
