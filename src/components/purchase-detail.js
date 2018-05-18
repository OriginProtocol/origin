import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import moment from 'moment'
import Review from './review'
import TransactionProgress from './transaction-progress'
import UserCard from './user-card'

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
      prompt: 'Confirm receipt of the order and leave a review',
      instruction: 'Submit this form once you have reviewed shipment of your order.',
      buttonText: 'Confirm and Review',
      functionName: 'confirmReceipt',
      placeholderText: 'A review should inform others about your experience transacting with this seller, not about the product itself.',
      reviewable: true,
    },
    seller: {
      prompt: 'Wait for the buyer to receive the order',
    },
  },
  {
    buyer: {
      prompt: 'Wait for the seller to withdraw the funds',
    },
    seller: {
      prompt: 'Complete transaction by withdrawing funds',
      instruction: 'Click the button below to initiate the withdrawal',
      buttonText: 'Withdraw Funds',
      functionName: 'withdrawFunds',
      placeholderText: 'A review should inform others about your experience transacting with this buyer.',
      reviewable: true,
    },
  },
]

class PurchaseDetail extends Component {
  constructor(props){
    super(props)

    this.confirmReceipt = this.confirmReceipt.bind(this)
    this.confirmShipped = this.confirmShipped.bind(this)
    this.handleRating = this.handleRating.bind(this)
    this.handleReviewText = this.handleReviewText.bind(this)
    this.loadPurchase = this.loadPurchase.bind(this)
    this.withdrawFunds = this.withdrawFunds.bind(this)
    this.state = {
      accounts: [],
      buyer: {},
      form: {
        rating: 5,
        reviewText: '',
      },
      listing: {},
      logs: [],
      purchase: {},
      reviews: [],
      seller: {},
    }
  }

  componentWillMount() {
    this.loadAccounts()
    this.loadPurchase()
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  componentDidUpdate(prevProps, prevState) {
    const { buyerAddress, listingAddress } = this.state.purchase
    const { sellerAddress } = this.state.listing

    if (prevState.purchase.listingAddress !== listingAddress) {
      this.loadListing(listingAddress)
      this.loadBuyer(buyerAddress)
      this.loadReviews(listingAddress)
    }

    if (prevState.listing.sellerAddress !== sellerAddress) {
      this.loadSeller(sellerAddress)
    }
  }

  async loadAccounts() {
    try {
      const accounts = await web3.eth.getAccounts()

      this.setState({ accounts })
    } catch(error) {
      console.error('Error loading accounts')
      console.error(error)
    }
  }

  async loadListing(addr) {
    try {
      const listing = await origin.listings.get(addr)
      this.setState({ listing })
      console.log('Listing: ', listing)
    } catch(error) {
      console.error(`Error loading listing ${addr}`)
      console.error(error)
    }
  }

  async loadPurchase() {
    const { purchaseAddress } = this.props

    try {
      const purchase = await origin.purchases.get(purchaseAddress)
      console.log(purchase)
      this.setState({ purchase })
      console.log('Purchase: ', purchase)

      const logs = await origin.purchases.getLogs(purchaseAddress)
      this.setState({ logs })
      console.log('Logs: ', logs)

      return purchase
    } catch(error) {
      console.error(`Error loading purchase ${purchaseAddress}`)
      console.error(error)
    }
  }

  async getPurchaseAddress(addr, i) {
    try {
      return await origin.listings.purchaseAddressByIndex(addr, i)
    } catch(error) {
      console.error(`Error fetching purchase address at: ${i}`)
    }
  }

  async loadPurchases(listingAddress) {
    try {
      const length = await origin.listings.purchasesLength(listingAddress)
      console.log('Purchase count:', length)

      const purchaseAddresses = await Promise.all(
        [...Array(length).keys()].map(i => this.getPurchaseAddress(listingAddress, i))
      )

      return await Promise.all(
        purchaseAddresses.map(addr => origin.purchases.get(addr))
      )
    } catch(error) {
      console.error(`Error fetching purchases for listing: ${listingAddress}`)
      console.error(error)
    }
  }

  async loadReviews(listingAddress) {
    try {
      const purchases = await this.loadPurchases(listingAddress)
      console.log('PURCHASES', purchases)
      const reviews = await Promise.all(
        purchases.map(p => origin.reviews.find({ purchaseAddress: p.address }))
      )
      const flattened = [].concat(...reviews)
      console.log('Reviews:', flattened)
      this.setState({ reviews: flattened })
    } catch(error) {
      console.error(error)
      console.error(`Error fetching reviews`)
    }
  }

  async loadBuyer(addr) {
    try {
      const user = await origin.users.get(addr)
      this.setState({ buyer: { ...user, address: addr } })
      console.log('Buyer: ', this.state.buyer)
    } catch(error) {
      console.error(`Error loading buyer ${addr}`)
      console.error(error)
    }
  }

  async loadSeller(addr) {
    try {
      const user = await origin.users.get(addr)
      this.setState({ seller: { ...user, address: addr } })
      console.log('Seller: ', this.state.seller)
    } catch(error) {
      console.error(`Error loading seller ${addr}`)
      console.error(error)
    }
  }

  async confirmReceipt() {
    const { purchaseAddress } = this.props
    const { rating, reviewText } = this.state.form

    try {
      const transaction = await origin.purchases.buyerConfirmReceipt(purchaseAddress, {
        rating,
        reviewText: reviewText.trim(),
      })
      await transaction.whenFinished()
      this.loadPurchase()
      this.loadReviews(this.state.listing.address)
    } catch(error) {
      console.error('Error marking purchase received by buyer')
      console.error(error)
    }
  }

  async confirmShipped() {
    const { purchaseAddress } = this.props

    try {
      const transaction = await origin.purchases.sellerConfirmShipped(purchaseAddress)
      await transaction.whenFinished()
      this.loadPurchase()
    } catch(error) {
      console.error('Error marking purchase shipped by seller')
      console.error(error)
    }
  }

  async withdrawFunds() {
    const { purchaseAddress } = this.props
    const { rating, reviewText } = this.state.form

    try {
      const transaction = await origin.purchases.sellerGetPayout(purchaseAddress, {
        rating,
        reviewText: reviewText.trim(),
      })
      await transaction.whenFinished()
      this.loadPurchase()
    } catch(error) {
      console.error('Error withdrawing funds for seller')
      console.error(error)
    }
  }

  /*
  * rating: 1 <= integer <= 5
  */
  handleRating(rating) {
    this.setState(prevState => {
      return { form: { ...prevState.form, rating } }
    })
  }


  handleReviewText(e) {
    const { value } = e.target

    this.setState(prevState => {
      return { form: { ...prevState.form, reviewText: value } }
    })
  }

  render() {
    const { accounts, buyer, form, listing, logs, purchase, reviews, seller } = this.state
    const { rating, reviewText } = form
    const buyersReviews = reviews.filter(r => r.revieweeRole === 'SELLER')

    if (!purchase.address || !listing.address ){
      return null
    }

    const perspective = accounts[0] === purchase.buyerAddress ? 'buyer' : 'seller'
    const pictures = listing.pictures || []
    const category = listing.category || ""
    const active = listing.unitsAvailable > 0 // Todo, move to origin.js, take into account listing expiration
    const soldAt = purchase.created * 1000 // convert seconds since epoch to ms

    // log events
    const paymentEvent = logs.find(l => l.stage === 'shipping_pending')
    const paidAt = paymentEvent ? paymentEvent.timestamp * 1000 : null
    const fulfillmentEvent = logs.find(l => l.stage === 'buyer_pending')
    const fulfilledAt = fulfillmentEvent ? fulfillmentEvent.timestamp * 1000 : null
    const receiptEvent = logs.find(l => l.stage === 'seller_pending')
    const receivedAt = receiptEvent ? receiptEvent.timestamp * 1000 : null
    const withdrawalEvent = logs.find(l => l.stage === 'complete')
    const withdrawnAt = withdrawalEvent ? withdrawalEvent.timestamp * 1000 : null
    const reviewedAt = null
    const price = `${Number(listing.price).toLocaleString(undefined, {minimumFractionDigits: 3})} ETH` // change to priceEth

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
    const { buttonText, functionName, instruction, placeholderText, prompt, reviewable } = nextStep ? nextStep[perspective] : {}
    const buyerName = (buyer.profile && `${buyer.profile.firstName} ${buyer.profile.lastName}`) || 'Unnamed User'
    const sellerName = (seller.profile && `${seller.profile.firstName} ${seller.profile.lastName}`) || 'Unnamed User'

    return (
      <div className="transaction-detail">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="brdcrmb">
                {perspective === 'buyer' ? 'Purchased' : 'Sold'}
                {' from '}
                <Link to={`/users/${counterpartyUser.address}`}>{counterpartyUser.name}</Link>
              </div>
              <h1>{listing.name}</h1>
            </div>
          </div>
          <div className="transaction-status row">
            <div className="col-12 col-lg-8">
              <h2>Transaction Status</h2>
              <div className="row">
                <div className="col-6">
                  <div className="d-flex">
                    <div className="avatar-container">
                      <img src={`images/avatar-${perspective === 'seller' ? 'green' : 'blue'}.svg`} alt="seller avatar" />
                    </div>
                    <div className="identification d-flex flex-column justify-content-between text-truncate">
                      <div><span className="badge badge-dark">Seller</span></div>
                      <div className="name">{sellerName}</div>
                      <div className="address text-muted text-truncate">{seller.address}</div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex justify-content-end">
                    <div className="identification d-flex flex-column text-right justify-content-between text-truncate">
                      <div><span className="badge badge-dark">Buyer</span></div>
                      <div className="name">{buyerName}</div>
                      <div className="address text-muted text-truncate">{buyer.address}</div>
                    </div>
                    <div className="avatar-container">
                      <img src={`images/avatar-${perspective === 'buyer' ? 'green' : 'blue'}.svg`} alt="buyer avatar" />
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
                      <div className="prompt"><strong>Next Step:</strong> {prompt}</div>
                      {reviewable &&
                        <form onSubmit={e => {
                          e.preventDefault()

                          this[functionName]()
                        }}>
                          <div className="form-group">
                            <label htmlFor="review">Review</label>
                            <div className="stars">{[...Array(5)].map((undef, i) => {
                              return (
                                <img
                                  key={`rating-star-${i}`}
                                  src={`/images/star-${rating > i ? 'filled' : 'empty'}.svg`}
                                  alt="review rating star"
                                  onClick={() => this.handleRating(i + 1)}
                                />
                              )
                            })}</div>
                            <textarea
                              rows="4"
                              id="review"
                              className="form-control"
                              value={reviewText}
                              placeholder={placeholderText}
                              onChange={this.handleReviewText}>
                            </textarea>
                          </div>
                          <div className="button-container text-right">
                            <button type="submit" className="btn btn-primary">{buttonText}</button>
                          </div>
                        </form>
                      }
                      {!reviewable && buttonText &&
                        <Fragment>
                          <div className="instruction">{instruction || 'Nothing for you to do at this time. Check back later'}</div>
                          <button className="btn btn-primary" onClick={this[functionName]}>{buttonText}</button>
                        </Fragment>
                      }
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
                  {paidAt &&
                    <tr>
                      <td><span className="progress-circle checked" data-toggle="tooltip" data-placement="top" data-html="true" title={`Payment received on<br /><strong>${moment(paidAt).format('MMM D, YYYY')}</strong>`}></span>Payment Received</td>
                      <td className="text-truncate">{paymentEvent.transactionHash}</td>
                      <td className="text-truncate"><Link to={`/users/${buyer.address}`}>{buyer.address}</Link></td>
                      <td className="text-truncate"><Link to={`/users/${seller.address}`}>{seller.address}</Link></td>
                    </tr>
                  }
                  {fulfilledAt &&
                    <tr>
                      <td><span className="progress-circle checked" data-toggle="tooltip" data-placement="top" data-html="true" title={`Sent by seller on<br /><strong>${moment(fulfilledAt).format('MMM D, YYYY')}</strong>`}></span>Sent by seller</td>
                      <td className="text-truncate">{fulfillmentEvent.transactionHash}</td>
                      <td className="text-truncate"><Link to={`/users/${buyer.address}`}>{seller.address}</Link></td>
                      <td className="text-truncate"><Link to={`/users/${seller.address}`}>{buyer.address}</Link></td>
                    </tr>
                  }
                  {receivedAt &&
                    <tr>
                      <td><span className="progress-circle checked" data-toggle="tooltip" data-placement="top" data-html="true" title={`Received buy buyer on<br /><strong>${moment(receivedAt).format('MMM D, YYYY')}</strong>`}></span>Received by buyer</td>
                      <td className="text-truncate">{receiptEvent.transactionHash}</td>
                      <td className="text-truncate"><Link to={`/users/${buyer.address}`}>{buyer.address}</Link></td>
                      <td className="text-truncate"><Link to={`/users/${seller.address}`}>{seller.address}</Link></td>
                    </tr>
                  }
                  {perspective === 'seller' && withdrawnAt &&
                    <tr>
                      <td><span className="progress-circle checked" data-toggle="tooltip" data-placement="top" data-html="true" title={`Funds withdrawn on<br /><strong>${moment(withdrawnAt).format('MMM D, YYYY')}</strong>`}></span>Funds withdrawn</td>
                      <td className="text-truncate">{withdrawalEvent.transactionHash}</td>
                      <td className="text-truncate"><Link to={`/users/${buyer.address}`}>{seller.address}</Link></td>
                      <td className="text-truncate"><Link to={`/users/${seller.address}`}>{buyer.address}</Link></td>
                    </tr>
                  }
                </tbody>
              </table>
              <hr />
            </div>
            <div className="col-12 col-lg-4">
              <UserCard title={counterparty} userAddress={counterpartyUser.address} />
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
                      <div className="units-available text-danger">Just {listing.unitsAvailable.toLocaleString()} left!</div>
                    }
                    {listing.ipfsHash &&
                      <div className="link-container">
                        <a href={origin.ipfsService.gatewayUrlForHash(listing.ipfsHash)} target="_blank">
                          View on IPFS<img src="images/carat-blue.svg" className="carat" alt="right carat" />
                        </a>
                      </div>
                    }
                  </div>
                  <hr />
                </Fragment>
              }
              <div className="reviews">
                <h2>Reviews <span className="review-count">{Number(buyersReviews.length).toLocaleString()}</span></h2>
                {buyersReviews.map(r => <Review key={r.transactionHash} review={r} />)}
                {/* To Do: pagination */}
                {/* <a href="#" className="reviews-link">Read More<img src="/images/carat-blue.svg" className="down carat" alt="down carat" /></a> */}
              </div>
            </div>
            <div className="col-12 col-lg-4">
              {soldAt &&
                <div className="summary text-center">
                  {perspective === 'buyer' && <div className="purchased tag"><div>Purchased</div></div>}
                  {perspective === 'seller' && <div className="sold tag"><div>Sold</div></div>}
                  <div className="recap">{counterpartyUser.name} {perspective === 'buyer' ? 'sold' : 'purchased'} on {moment(soldAt).format('MMMM D, YYYY')}</div>
                  <hr className="dark sm" />
                  <div className="d-flex">
                    <div className="text-left">Price</div>
                    <div className="text-right">{price}</div>
                  </div>
                  <hr className="dark sm" />
                  <div className={`status ${status}`}>This listing is {status}</div>
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
