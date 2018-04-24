import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import moment from 'moment'
import TransactionProgress from './transaction-progress'

class MyPurchaseCard extends Component {
  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  render() {
    const { listing } = this.props
    const { _id, category, createdAt, fulfilledAt, pictures, receivedAt, soldAt, title } = listing
    let date, step, verb

    if (receivedAt) {
      date = receivedAt
      step = 3
      verb = 'Received'
    } else if (fulfilledAt) {
      date = fulfilledAt
      step = 2
      verb = 'Sent by seller'
    } else if (soldAt) {
      date = soldAt
      step = 1
      verb = 'Purchased'
    } else {
      date = createdAt
      step = 0
      verb = 'Created'
    }

    const timestamp = `${verb} on ${moment(date).format('MMMM D, YYYY')}`

    return (
      <div className="transaction card">
        <div className="card-body d-flex flex-column flex-lg-row">
          <div className="aspect-ratio">
            <div className="image-container">
              <img src={(pictures && pictures.length > 0 && (new URL(pictures[0])).protocol === "data:") ? pictures[0] : '/images/default-image.jpg'} role="presentation" />
            </div>
          </div>
          <div className="content-container d-flex flex-column">
            <p className="category">{category}</p>
            <h2 className="title text-truncate"><Link to={`/my-purchases/${_id}`}>{title}</Link></h2>
            <p className="timestamp">{timestamp}</p>
            <div className="d-flex">
              <p className="price">$1,000</p>
              {/* Not Yet Relevant */}
              {/* <p className="quantity">Quantity: {quantity.toLocaleString()}</p> */}
            </div>
            <TransactionProgress currentStep={step} listing={listing} perspective="buyer" subdued={true} />
            <div className="actions d-flex">
              <div className="links-container">
                <a onClick={() => alert('To Do')}>Open a Dispute</a>
              </div>
              {soldAt &&
                <div className="button-container">
                  {soldAt && fulfilledAt && !receivedAt &&
                    <a className="btn btn-primary btn-sm" onClick={() => alert('To Do')}>I&apos;ve Received the Order</a>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MyPurchaseCard
