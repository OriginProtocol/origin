import React, { Component } from 'react'
import TransactionProgress from './transaction-progress'
import data from '../data'

class TransactionDetail extends Component {
  render() {
    const { listingId, perspective } = this.props
    const listing = data.listings.find(l => l._id === listingId)
    const { fulfilledAt, receivedAt, soldAt, withdrawnAt } = listing
    const maxStep = perspective === 'seller' ? 4 : 3
    let left, step

    if (withdrawnAt) {
      step = maxStep
    } else if (receivedAt) {
      step = 3
    } else if (fulfilledAt) {
      step = 2
    } else if (soldAt) {
      step = 1
    } else {
      step = 0
    }

    if (!step) {
      left = '28px'
    } else if (step === 1) {
      if (perspective === 'buyer') {
        left = '28px'
      } else {
        left = `${step / (maxStep - 1) * 100}%`
      }
    } else if (step === maxStep - 1) {
      left = 'calc(100% - 28px)'
    } else {
      let decimal = (step - 1) / (maxStep - 1)

      left = `calc(${decimal * 100}% + ${decimal * 28 / 2}px)`
    }

    return (
      <div className="transaction-detail">
        <div className="container">
          <div className="row">
            <div className="col-12">
              {perspective === 'buyer' && <p className="brdcrmb">My Purchases{soldAt && <span className="badge badge-success">Purchased</span>}</p>}
              {perspective === 'seller' && <p className="brdcrmb">My Listings{soldAt && <span className="badge badge-info">Sold</span>}</p>}
              <h1>{listing.title}</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-8">
              <h2>Transaction Status</h2>
              <div className="row">
                <div className="col-6">
                  <div className="d-flex">
                    <div className="avatar-container">
                      <img src={`/images/avatar-${perspective === 'seller' ? 'green' : 'blue'}.svg`} alt="seller avatar" />
                    </div>
                    <div className="identification d-flex flex-column justify-content-between">
                      <p><span className="badge badge-dark">Seller</span></p>
                      <p className="name">Aure G.</p>
                      <p className="address">0x12Be343B94f860124dC4fEe278FDCBD38C102D88</p>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex justify-content-end">
                    <div className="identification d-flex flex-column text-right justify-content-between">
                      <p><span className="badge badge-dark">Buyer</span></p>
                      <p className="name">Matt L.</p>
                      <p className="address">0x34Be343B94f860124dC4fEe278FDCBD38C102D88</p>
                    </div>
                    <div className="avatar-container">
                      <img src={`/images/avatar-${perspective === 'buyer' ? 'green' : 'blue'}.svg`} alt="buyer avatar" />
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <TransactionProgress currentStep={step} listing={listing} maxStep={maxStep} perspective={perspective} />
                </div>
                {step < maxStep &&
                  <div className="col-12">
                    <div className="guidance">
                      <div className="triangle" style={{ left }}></div>
                      <div className="triangle" style={{ left }}></div>
                    </div>
                  </div>
                }
              </div>
            </div>
            <div className="col-12 col-md-4">
              {/* About the buyer */}
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-12 col-md-8">
              {/* Listing Details */}
            </div>
            <div className="col-12 col-md-4">
              {/* Status */}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TransactionDetail
