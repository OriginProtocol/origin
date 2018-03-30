import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import TransactionProgress from './transaction-progress'

class ListingProgressCard extends Component {
  render() {
    const { listing, perspective } = this.props
    const { _id, active, category, createdAt, fulfilledAt, receivedAt, soldAt, title, withdrawnAt } = listing
    const status = active ? 'active' : 'inactive'
    let date, step, verb

    if (withdrawnAt) {
      date = withdrawnAt
      step = perspective === 'seller' ? 4 : 3
      verb = 'Withdrawn'
    } else if (receivedAt) {
      date = receivedAt
      step = 3
      verb = 'Received'
    } else if (fulfilledAt) {
      date = fulfilledAt
      step = 2
      verb = 'Sent'
    } else if (soldAt) {
      date = soldAt
      step = 1
      verb = perspective === 'seller' ? 'Sold' : 'Purchased'
    } else {
      date = createdAt
      step = 0
      verb = 'Created'
    }

    const timestamp = `${verb} on ${moment(date).format('MMMM D, YYYY')}`

    return (
      <div className="transaction card">
        <div className="card-body d-flex flex-column flex-lg-row">
          <div className="image-container">
            <Link to={`/my-${perspective === 'buyer' ? 'purchases' : 'listings'}/${_id}`}><img role="presentation" /></Link>
          </div>
          {perspective === 'buyer' &&
            <div className="content-container d-flex flex-column">
              <p className="category">{category}</p>
              <h2 className="title">{title}</h2>
              <div className="d-flex">
                <p className="price">$1,000</p>
                <p className="timestamp">{timestamp}</p>
              </div>
              <TransactionProgress currentStep={step} listing={listing} perspective={perspective} />
              <div className="actions d-flex">
                <div className="links-container">
                  <a onClick={() => alert('To Do')}>Open a Dispute</a>
                </div>
                {soldAt &&
                  <div className="button-container">
                    {soldAt && fulfilledAt && !receivedAt &&
                      <a className="btn btn-primary btn-sm" onClick={() => alert('To Do')}>I've Received the Order</a>
                    }
                  </div>
                }
              </div>
            </div>
          }
          {perspective === 'seller' &&
            <div className="content-container d-flex flex-column">
              <span className={`status ${status}`}>{status}</span>
              <p className="category">{category}</p>
              <h2 className="title">{title}</h2>
              <div className="d-flex">
                <p className="price">$1,000{soldAt && <span className="sold-banner">Sold</span>}</p>
                <p className="timestamp">{timestamp}</p>
              </div>
              <TransactionProgress currentStep={step} listing={listing} perspective={perspective} />
              <div className="actions d-flex">
                <div className="links-container">
                  <a onClick={() => alert('To Do')}>Edit</a>
                  <a onClick={() => alert('To Do')}>Disable</a>
                  <a className="warning" onClick={() => alert('To Do')}>Delete</a>
                </div>
                {soldAt &&
                  <div className="button-container">
                    {soldAt && !fulfilledAt &&
                      <a className="btn btn-primary btn-sm" onClick={() => alert('To Do')}>Order Sent</a>
                    }
                    {soldAt && fulfilledAt && receivedAt &&
                      <a className="btn btn-primary btn-sm" onClick={() => alert('To Do')}>Retreive Funds</a>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

export default ListingProgressCard
