import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import moment from 'moment'
import Review from './review'
import TransactionProgress from './transaction-progress'
import data from '../data'

import origin from '../services/origin' 

/* Transaction stages: no disputes and no seller review of buyer/transaction
 *  - step 0 was creating the listing
 *  - nextSteps[0] equates to step 1, etc
 *  - even-numbered steps are seller's resposibility
 *  - odd-numbered steps are buyer's responsibility
 */
const nextSteps = [
  {
    // we should never be in this state
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
      functionName: 'confirmShipped',
    },
  },
  {
    buyer: {
      prompt: 'Confirm receipt of the order',
      instruction: 'Click the button below once you\'ve received the order.',
      buttonText: 'Order Received',
      functionName: 'confirmReceipt',
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
      functionName: 'todo',
    },
    seller: {
      prompt: 'Complete transaction by withdrawing funds',
      instruction: 'Click the button below to initiate the withdrawal',
      buttonText: 'Withdraw Funds',
      functionName: 'withdrawFunds',
    },
  },
]

class PurchaseDetail extends Component {
  constructor(props){
    super(props)

    this.confirmReceipt = this.confirmReceipt.bind(this)
    this.confirmShipped = this.confirmShipped.bind(this)
    this.withdrawFunds = this.withdrawFunds.bind(this)
    this.state = {
      listing: {},
      purchase: {},
    }
  }

  componentDidMount() {
    this.loadPurchase()

    $('[data-toggle="tooltip"]').tooltip()
  }

  componentDidUpdate(prevProps, prevState) {
    const { listingAddress } = this.state.purchase

    if (prevState.purchase.listingAddress !== listingAddress) {
      this.loadListing(listingAddress)
    }
  }

  async loadListing(addr) {
    try {
      const listing = await origin.listings.get(addr)
      this.setState({ listing })
      console.log(listing)
    } catch(error) {
      console.error(`Error loading listing ${addr}`)
      console.error(error)
    }
  }

  async loadPurchase() {
    const { purchaseAddress } = this.props

    try {
      const purchase = await origin.purchases.get(purchaseAddress)
      this.setState({ purchase })
      console.log(purchase)
    } catch(error) {
      console.error(`Error loading purchase ${purchaseAddress}`)
      console.error(error)
    }
  }

  async confirmReceipt() {
    const { purchaseAddress } = this.props

    try {
      const transactionReceipt = await origin.purchases.buyerConfirmReceipt(purchaseAddress)
      await origin.contractService.waitTransactionFinished(transactionReceipt.tx)
      this.loadPurchase()
    } catch(error) {
      console.error('Error marking purchase received by buyer')
      console.error(error)
    }
  }

  async confirmShipped() {
    const { purchaseAddress } = this.props

    try {
      const transactionReceipt = await origin.purchases.sellerConfirmShipped(purchaseAddress)
      await origin.contractService.waitTransactionFinished(transactionReceipt.tx)
      this.loadPurchase()
    } catch(error) {
      console.error('Error marking purchase shipped by seller')
      console.error(error)
    }
  }

  async withdrawFunds() {
    const { purchaseAddress } = this.props

    try {
      const transactionReceipt = await origin.purchases.sellerGetPayout(purchaseAddress)
      await origin.contractService.waitTransactionFinished(transactionReceipt.tx)
      this.loadPurchase()
    } catch(error) {
      console.error('Error withdrawing funds for seller')
      console.error(error)
    }
  }

  todo() {
    alert('To Do')
  }

  render() {
    const purchase = this.state.purchase
    const listing = this.state.listing

    if (!purchase.address || !listing.address ){
      return null
    }
    
    const perspective = window.web3.eth.accounts[0] === purchase.buyerAddress ? 'buyer' : 'seller'
    const seller = { name: 'Unnamed User', address: listing.sellerAddress }
    const buyer = { name: 'Unnamed User', address: purchase.buyerAddress }
    const pictures = listing.pictures || []
    const category = listing.category || ""
    const active = listing.unitsAvailable > 0 // Todo, move to origin.js, take into account listing expiration
    const soldAt = purchase.created * 1000 // convert seconds since epoch to ms
    const fulfilledAt = undefined
    const receivedAt = undefined
    const withdrawnAt = undefined
    const reviewedAt = undefined
    const price = undefined // change to priceEth

    const counterparty = ['buyer', 'seller'].find(str => str !== perspective)
    const counterpartyUser = counterparty === 'buyer' ? buyer : seller
    const status = active ? 'active' : 'inactive'
    const maxStep = perspective === 'seller' ? 4 : 3
    let decimal, left, step

    if (purchase.stage === 'complete') {
      step = maxStep
    } else if (purchase.stage === 'seller_pending') {
      step = 3
    } else if (purchase.stage === 'buyer_pending') {
      step = 2
    } else if (purchase.stage === 'shipping_pending') {
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
    const { buttonText, functionName, instruction, prompt } = nextStep ? nextStep[perspective] : {}

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
                    <div className="identification d-flex flex-column justify-content-between text-truncate">
                      <p><span className="badge badge-dark">Seller</span></p>
                      <p className="name">{seller.name || 'Unnamed User'}</p>
                      <p className="address text-muted text-truncate">{seller.address}</p>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex justify-content-end">
                    <div className="identification d-flex flex-column text-right justify-content-between text-truncate">
                      <p><span className="badge badge-dark">Buyer</span></p>
                      <p className="name">{buyer.name || 'Unnamed User'}</p>
                      <p className="address text-muted text-truncate">{buyer.address}</p>
                    </div>
                    <div className="avatar-container">
                      <img src={`/images/avatar-${perspective === 'buyer' ? 'green' : 'blue'}.svg`} alt="buyer avatar" />
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <TransactionProgress currentStep={step} maxStep={maxStep} purchase={listing} perspective={perspective} />
                </div>
                {nextStep &&
                  <div className="col-12">
                    <div className="guidance text-center">
                      <div className="triangle" style={{ left }}></div>
                      <div className="triangle" style={{ left }}></div>
                      <p className="prompt"><strong>Next Step:</strong> {prompt}</p>
                      <p className="instruction">{instruction || 'Nothing for you to do at this time. Check back later'}</p>
                      {buttonText && <button className="btn btn-primary" onClick={this[functionName]}>{buttonText}</button>}
                    </div>
                  </div>
                }
              </div>
              <h2>Transaction History</h2>
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
                  <tr>
                    <td><span className="progress-circle checked" data-toggle="tooltip" data-placement="top" data-html="true" title={`Sold on<br /><strong>${moment(soldAt).format('MMM D, YYYY')}</strong>`}></span>{perspective === 'buyer' ? 'Purchased' : 'Sold'}</td>
                    <td className="text-truncate">{purchase.address}</td>
                    <td className="text-truncate"><a href="#" onClick={() => alert('To Do')}>{buyer.address}</a></td>
                    <td className="text-truncate"><a href="#" onClick={() => alert('To Do')}>{seller.address}</a></td>
                  </tr>
                  {/*fulfilledAt &&
                    <tr>
                      <td><span className="progress-circle checked" data-toggle="tooltip" data-placement="top" data-html="true" title={`Sent by seller on<br /><strong>${moment(fulfilledAt).format('MMM D, YYYY')}</strong>`}></span>Sent by seller</td>
                      <td className="text-truncate"><a href="#" onClick={() => alert('To Do')}>0x78Be343B94f860124dC4fEe278FDCBD38C102D88</a></td>
                      <td className="text-truncate"><a href="#" onClick={() => alert('To Do')}>{seller.address}</a></td>
                      <td className="text-truncate"><a href="#" onClick={() => alert('To Do')}>{buyer.address}</a></td>
                    </tr>
                  */}
                  {/*receivedAt &&
                    <tr>
                      <td><span className="progress-circle checked" data-toggle="tooltip" data-placement="top" data-html="true" title={`Received buy buyer on<br /><strong>${moment(receivedAt).format('MMM D, YYYY')}</strong>`}></span>Received by buyer</td>
                      <td className="text-truncate"><a href="#" onClick={() => alert('To Do')}>0x90Be343B94f860124dC4fEe278FDCBD38C102D88</a></td>
                      <td className="text-truncate"><a href="#" onClick={() => alert('To Do')}>{buyer.address}</a></td>
                      <td className="text-truncate"><a href="#" onClick={() => alert('To Do')}>{seller.address}</a></td>
                    </tr>
                  */}
                  {/*perspective === 'seller' && withdrawnAt &&
                    <tr>
                      <td><span className="progress-circle checked" data-toggle="tooltip" data-placement="top" data-html="true" title={`Funds withdrawn on<br /><strong>${moment(withdrawnAt).format('MMM D, YYYY')}</strong>`}></span>Funds withdrawn</td>
                      <td className="text-truncate"><a href="#" onClick={() => alert('To Do')}>0x90Be343B94f860124dC4fEe278FDCBD38C102D88</a></td>
                      <td className="text-truncate"><a href="#" onClick={() => alert('To Do')}>{buyer.address}</a></td>
                      <td className="text-truncate"><a href="#" onClick={() => alert('To Do')}>{seller.address}</a></td>
                    </tr>
                  */}
                </tbody>
              </table>
              <hr />
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
                      <p><strong>{counterpartyUser.address}</strong></p>
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
                <Link to={`/users/${counterpartyUser.address}`} className="btn">View Profile</Link>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-lg-8">
              {listing.address &&
                <Fragment>
                  <h2>Listing Details</h2>
                  {!!pictures.length &&
                    <div className="carousel small">
                      {pictures.map(pictureUrl => (
                        <div className="photo" key={pictureUrl}>
                          <img src={pictureUrl} role='presentation' />
                        </div>
                      ))}
                    </div>
                  }
                  <div className="detail-info-box">
                    <h2 className="category placehold">{listing.category}</h2>
                    <h1 className="title text-truncate placehold">{listing.name}</h1>
                    <p className="description placehold">{listing.description}</p>
                    {!!listing.unitsAvailable && listing.unitsAvailable < 5 &&
                      <p className="units-available text-danger">Just {listing.unitsAvailable.toLocaleString()} left!</p>
                    }
                    {listing.ipfsHash &&
                      <p className="link-container">
                        <a href={origin.ipfsService.gatewayUrlForHash(listing.ipfsHash)} target="_blank">
                          View on IPFS<img src="/images/carat-blue.svg" className="carat" alt="right carat" />
                        </a>
                      </p>
                    }
                  </div>
                  <hr />
                </Fragment>
              }
              <div className="reviews">
                <h2>Reviews <span className="review-count">{Number(57).toLocaleString()}</span></h2>
                {perspective === 'buyer' && receivedAt && !reviewedAt &&
                  <form>
                    <div className="form-group">
                      <label htmlFor="review">Write a review</label>
                      <textarea rows="4" id="review" className="form-control" placeholder="Tell us a bit about your purchase"></textarea>
                    </div>
                    <div className="button-container text-right">
                      <button type="submit" className="btn btn-primary" onClick={() => alert('To Do')}>Submit</button>
                    </div>
                  </form>
                }
                {data.reviews.map(r => <Review key={r._id} review={r} />)}
                <a href="#" className="reviews-link" onClick={() => alert('To Do')}>Read More<img src="/images/carat-blue.svg" className="down carat" alt="down carat" /></a>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              {soldAt &&
                <div className="summary text-center">
                  {perspective === 'buyer' && <div className="purchased tag"><p>Purchased</p></div>}
                  {perspective === 'seller' && <div className="sold tag"><p>Sold</p></div>}
                  <p className="recap">{counterpartyUser.name} {perspective === 'buyer' ? 'sold' : 'purchased'} on {moment(soldAt).format('MMMM D, YYYY')}</p>
                  <hr />
                  <div className="d-flex">
                    <p className="text-left">Price</p>
                    <p className="text-right">{price}</p>
                  </div>
                  <div className="d-flex">
                    <p className="text-left">Contract Price</p>
                    <p className="text-right">{price}</p>
                  </div>
                  <hr />
                  <p className={`status ${status}`}>This listing is {status}</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default PurchaseDetail
