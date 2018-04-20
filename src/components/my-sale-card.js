import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import Timelapse from './timelapse'
import TransactionProgress from './transaction-progress'

class MySaleCard extends Component {
  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  render() {
    const { listing } = this.props
    const { _id, buyer, fulfilledAt, price, quantity, receivedAt, soldAt, title, withdrawnAt } = listing
    let step

    if (withdrawnAt) {
      step = 4
    } else if (receivedAt) {
      step = 3
    } else if (fulfilledAt) {
      step = 2
    } else {
      step = 1
    }

    return (
      <div className="sale card">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row">
            <div className="transaction order-3 order-lg-1">
              <h2 className="title"><Link to={`/my-sales/${_id}`}>{title}</Link></h2>
              <h2 className="title">sold to <Link to={`/my-sales/${_id}`}>{buyer.name}</Link></h2>
              <p className="address text-muted">{buyer.address}</p>
              <div className="d-flex">
                <p className="price">Price: {price}</p>
                <p className="quantity">Quantity: {quantity.toLocaleString()}</p>
              </div>
            </div>
            <div className="timestamp-container order-2 text-muted text-right">
              <p className="timestamp"><Timelapse reference={soldAt} /></p>
            </div>
            <div className="image-container order-1 order-lg-3">
              <img role="presentation" />
            </div>
          </div>
          <TransactionProgress currentStep={step} listing={listing} perspective="seller" subdued="true" />
          <div className="d-flex justify-content-between actions">
            {step === 1 && <p><strong>Next Step:</strong> Send the order to buyer</p>}
            {step === 2 && <p><strong>Next Step:</strong> Wait for buyer to receive order</p>}
            {step === 3 && <p><strong>Next Step:</strong> Withdraw funds</p>}
            {step === 4 && <p>This order is complete</p>}
            <p className="link-container"><Link to={`/my-sales/${_id}`}>View Details<img src="/images/carat-blue.svg" className="carat" alt="right carat" /></Link></p>
          </div>
        </div>
      </div>
    )
  }
}

export default MySaleCard
