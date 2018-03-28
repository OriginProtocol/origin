import React, { Component } from 'react'
import moment from 'moment'
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
                {listings.map(l => {
                  const { _id, active, category, createdAt, fulfilledAt, receivedAt, soldAt, title } = l
                  const status = active ? 'active' : 'inactive'
                  const timestamp = (() => {
                    let date
                    let verb

                    if (receivedAt) {
                      date = receivedAt
                      verb = 'Received'
                    } else if (fulfilledAt) {
                      date = fulfilledAt
                      verb = 'Sent'
                    } else if (soldAt) {
                      date = soldAt
                      verb = 'Sold'
                    } else {
                      date = createdAt
                      verb = 'Created'
                    }

                    return `${verb} on ${moment(date).format('MMMM D, YYYY')}`
                  })()

                  return (
                    <div key={`my-listing-${_id}`} className="my-listing card">
                      <div className="card-body d-flex flex-column flex-lg-row">
                        <div className="image-container">
                          <img role="presentation" />
                        </div>
                        <div className="content-container d-flex flex-column">
                          <span className={`status ${status}`}>{status}</span>
                          <p className="category">{category}</p>
                          <h2 className="title">{title}</h2>
                          <div className="d-flex">
                            <p className="price">$1,000{soldAt && <span className="sold-banner">Sold</span>}</p>
                            <p className="timestamp">{timestamp}</p>
                          </div>
                          <div className="timeline">
                            <div className="line">
                              <div className={`circle${soldAt ? ' checked' : ''}`}></div>
                              <div className={`circle${fulfilledAt ? ' checked' : ''}`}></div>
                              <div className={`circle${receivedAt ? ' checked' : ''}`}></div>
                            </div>
                            <div className={`line fill${fulfilledAt? ' half' : ''}${receivedAt ? ' all' : ''}`}></div>
                            <div className="labels d-flex">
                              <p className="text-left">Sold</p>
                              <p className="text-center">Order Sent</p>
                              <p className="text-right">Received by buyer</p>
                            </div>
                          </div>
                          <div className="actions d-flex">
                            <div className="links-container">
                              <a onClick={() => alert('To Do')}>Edit</a>
                              <a onClick={() => alert('To Do')}>Disable</a>
                              <a className="warning" onClick={() => alert('To Do')}>Delete</a>
                            </div>
                            {l.soldAt &&
                              <div className="button-container">
                                {l.soldAt && !l.fulfilledAt && <a className="btn btn-primary btn-sm" onClick={() => alert('To Do')}>Order Sent</a>}
                                {l.soldAt && l.fulfilledAt && l.receivedAt && <a className="btn btn-primary btn-sm" onClick={() => alert('To Do')}>Retreive Funds</a>}
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MyListings
