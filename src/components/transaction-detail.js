import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import TransactionProgress from './transaction-progress'
import data from '../data'

// step 0 was creating the listing
// nextSteps[0] equates to step 1, etc
// even-numbered steps are up to seller
// odd-numbered steps are up to buyer
const nextSteps = [
  {
    buyer: {
      prompt: 'Purchase this listing',
      instruction: 'Why is this here if you have not yet purchased it?',
    },
    seller: {
      prompt: 'Wait for a purchase',
      instruction: 'Why are you seeing this? There is no buyer.',
    },
  },
  {
    buyer: {
      prompt: 'Wait for the seller to send the order',
    },
    seller: {
      prompt: 'Send the order to buyer',
      instruction: 'Click the button below once the order has shipped.',
      buttonText: 'Order Sent',
    },
  },
  {
    buyer: {
      prompt: 'Confirm receipt of the order',
      instruction: 'Click the button below once you\'ve received the order.',
      buttonText: 'Order Received',
    },
    seller: {
      prompt: 'Wait for the buyer to receive the order',
    },
  },
  {
    buyer: {
      prompt: 'You\'ve confirmed receipt of your order',
      instruction: 'Would you like to write a review to let us know how you like your purchase?',
      buttonText: 'Write a review',
    },
    seller: {
      prompt: 'Complete transaction by withdrawing funds',
      instruction: 'Click the button below to initiate the withdrawal',
      buttonText: 'Withdraw Funds',
    },
  },
]

class TransactionDetail extends Component {
  render() {
    const { listingId, perspective } = this.props
    const listing = data.listings.find(l => l._id === listingId)
    const { buyer, seller, fulfilledAt, receivedAt, soldAt, withdrawnAt } = listing
    const counterparty = ['buyer', 'seller'].find(str => str !== perspective)
    const maxStep = perspective === 'seller' ? 4 : 3
    let decimal, left, step

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
        decimal = step / (maxStep - 1)
        left = `calc(${decimal * 100}% + ${decimal * 28}px)`
      }
    } else if (step >= maxStep - 1) {
      left = 'calc(100% - 28px)'
    } else {
      decimal = (step - 1) / (maxStep - 1)
      left = `calc(${decimal * 100}% + ${decimal * 28}px)`
    }

    const nextStep = nextSteps[step]
    const { buttonText, instruction, prompt } = nextStep ? nextStep[perspective] : {}

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
            <div className="col-12 col-lg-8">
              <h2>Transaction Status</h2>
              <div className="row">
                <div className="col-6">
                  <div className="d-flex">
                    <div className="avatar-container">
                      <img src={`/images/avatar-${perspective === 'seller' ? 'green' : 'blue'}.svg`} alt="seller avatar" />
                    </div>
                    <div className="identification d-flex flex-column justify-content-between">
                      <p><span className="badge badge-dark">Seller</span></p>
                      <p className="name">{seller.name || 'Anonymous User'}</p>
                      <p className="address">{seller.address}</p>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex justify-content-end">
                    <div className="identification d-flex flex-column text-right justify-content-between">
                      <p><span className="badge badge-dark">Buyer</span></p>
                      <p className="name">{buyer.name || 'Anonymous User'}</p>
                      <p className="address">{buyer.address}</p>
                    </div>
                    <div className="avatar-container">
                      <img src={`/images/avatar-${perspective === 'buyer' ? 'green' : 'blue'}.svg`} alt="buyer avatar" />
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <TransactionProgress currentStep={step} listing={listing} maxStep={maxStep} perspective={perspective} />
                </div>
                {nextStep &&
                  <div className="col-12">
                    <div className="guidance text-center">
                      <div className="triangle" style={{ left }}></div>
                      <div className="triangle" style={{ left }}></div>
                      <p className="prompt"><strong>Next Step:</strong> {prompt}</p>
                      <p className="instruction">{instruction || 'Nothing for you to do at this time. Check back later'}</p>
                      {buttonText && <button className="btn btn-primary" onClick={() => alert('To Do')}>{buttonText}</button>}
                    </div>
                  </div>
                }
              </div>
              <h2>Transaction Status</h2>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '200px' }}>TxName</th>
                    <th scope="col">TxHash</th>
                    <th scope="col">From</th>
                    <th scope="col">To</th>
                  </tr>
                </thead>
                <tbody>
                  {soldAt &&
                    <tr>
                      <td><span className="progress-circle checked"></span>Purchased</td>
                      <td><a href="#" onClick={() => alert('To Do')}>0x56Be343B94f860124dC4fEe278FDCBD38C102D88</a></td>
                      <td><a href="#" onClick={() => alert('To Do')}>{buyer.address}</a></td>
                      <td><a href="#" onClick={() => alert('To Do')}>{seller.address}</a></td>
                    </tr>
                  }
                  {fulfilledAt &&
                    <tr>
                      <td><span className="progress-circle checked"></span>Sent by seller</td>
                      <td><a href="#" onClick={() => alert('To Do')}>0x78Be343B94f860124dC4fEe278FDCBD38C102D88</a></td>
                      <td><a href="#" onClick={() => alert('To Do')}>{seller.address}</a></td>
                      <td><a href="#" onClick={() => alert('To Do')}>{buyer.address}</a></td>
                    </tr>
                  }
                  {receivedAt &&
                    <tr>
                      <td><span className="progress-circle checked"></span>Received by buyer</td>
                      <td><a href="#" onClick={() => alert('To Do')}>0x90Be343B94f860124dC4fEe278FDCBD38C102D88</a></td>
                      <td><a href="#" onClick={() => alert('To Do')}>{buyer.address}</a></td>
                      <td><a href="#" onClick={() => alert('To Do')}>{seller.address}</a></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div className="col-12 col-lg-4">
              <div className="counterparty">
                <div className="identity">
                  <h3>About the {counterparty}</h3>
                  <div className="d-flex">
                    <div className="image-container">
                      <Link to="/profile">
                        <img src="/images/identicon.png"
                          srcSet="/images/identicon@2x.png 2x, /images/identicon@3x.png 3x"
                          alt="wallet icon" />
                      </Link>
                    </div>
                    <div>
                      <p>ETH Address:</p>
                      <p><strong>{listing[counterparty].address}</strong></p>
                    </div>
                  </div>
                  <hr />
                  <div className="d-flex">
                    <div className="avatar-container">
                      <img src="/images/avatar-blue.svg" alt="avatar" />
                    </div>
                    <div className="identification">
                      <p>Aure Gimon</p>
                      <img src="/images/twitter-icon-verified.svg" alt="Twitter verified icon" />
                    </div>
                  </div>
                </div>
                <a href="/#" className="btn" onClick={() => alert('To Do')}>View Profile</a>
              </div>
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-12 col-lg-8">
              {/* Listing Details */}
            </div>
            <div className="col-12 col-lg-4">
              {/* Status */}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TransactionDetail
