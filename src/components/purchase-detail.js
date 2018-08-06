import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { FormattedMessage, FormattedDate, defineMessages, injectIntl } from 'react-intl'
import $ from 'jquery'

import {
  update as updateTransaction,
  upsert as upsertTransaction,
} from 'actions/Transaction'

import Avatar from 'components/avatar'
import Modal from 'components/modal'
import PurchaseProgress from 'components/purchase-progress'
import Review from 'components/review'
import UserCard from 'components/user-card'

import TransactionEvent from 'pages/purchases/transaction-event'

import { translateListingCategory } from 'utils/translationUtils'

import origin from '../services/origin'

const web3 = origin.contractService.web3

const defaultState = {
  buyer: {},
  form: {
    rating: 5,
    reviewText: '',
  },
  listing: {},
  logs: [],
  processing: false,
  purchase: {},
  reviews: [],
  seller: {}
}

class PurchaseDetail extends Component {
  constructor(props){
    super(props)

    this.confirmReceipt = this.confirmReceipt.bind(this)
    this.confirmShipped = this.confirmShipped.bind(this)
    this.handleRating = this.handleRating.bind(this)
    this.handleReviewText = this.handleReviewText.bind(this)
    this.loadPurchase = this.loadPurchase.bind(this)
    this.withdrawFunds = this.withdrawFunds.bind(this)
    this.state = defaultState

    this.intlMessages = defineMessages({
      awaitOrder: {
        id: 'purchase-detail.awaitOrder',
        defaultMessage: 'Wait for the seller to send the order'
      },
      sendOrder: {
        id: 'purchase-detail.sendOrder',
        defaultMessage: 'Send the order to buyer'
      },
      sendOrderInstruction: {
        id: 'purchase-detail.sendOrderInstruction',
        defaultMessage: 'Click the button below once the order has shipped.'
      },
      markOrderSent: {
        id: 'purchase-detail.markOrderSent',
        defaultMessage: 'Mark Order as Sent'
      },
      confirmReceiptOfOrder: {
        id: 'purchase-detail.confirmReceiptOfOrder',
        defaultMessage: 'Confirm receipt of the order and leave a review'
      },
      submitThisForm: {
        id: 'purchase-detail.submitThisForm',
        defaultMessage: 'Submit this form once you have reviewed shipment of your order.'
      },
      confirmAndReview: {
        id: 'purchase-detail.confirmAndReview',
        defaultMessage: 'Confirm and Review'
      },
      buyerReviewPlaceholder: {
        id: 'purchase-detail.buyerReviewPlaceholder',
        defaultMessage: 'Your review should inform others about your experience transacting with this seller, not about the product itself.'
      },
      waitForBuyer: {
        id: 'purchase-detail.waitForBuyer',
        defaultMessage: 'Wait for the buyer to receive the order'
      },
      awaitSellerWithdrawl: {
        id: 'purchase-detail.awaitSellerWithdrawl',
        defaultMessage: 'Wait for the seller to withdraw the funds'
      },
      completeByWithdrawing: {
        id: 'purchase-detail.completeByWithdrawing',
        defaultMessage: 'Complete your transaction by withdrawing funds'
      },
      clickToWithdraw: {
        id: 'purchase-detail.clickToWithdraw',
        defaultMessage: 'Click the button below to initiate the withdrawal'
      },
      withdrawAndReview: {
        id: 'purchase-detail.withdrawAndReview',
        defaultMessage: 'Withdraw and Review'
      },
      sellerReviewPlaceholder: {
        id: 'purchase-detail.sellerReviewPlaceholder',
        defaultMessage: 'Your review should inform others about your experience transacting with this buyer.'
      },
    })

    /* Transaction stages: no disputes/arbitration
     *  - step 0 was creating the listing
     *  - nextSteps[0] equates to step 1, etc
     *  - even-numbered steps are seller's resposibility
     *  - odd-numbered steps are buyer's responsibility
     */
    this.nextSteps = [
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
          prompt: this.props.intl.formatMessage(this.intlMessages.awaitOrder),
        },
        seller: {
          prompt: this.props.intl.formatMessage(this.intlMessages.sendOrder),
          instruction: this.props.intl.formatMessage(this.intlMessages.sendOrderInstruction),
          buttonText: this.props.intl.formatMessage(this.intlMessages.markOrderSent),
          functionName: 'confirmShipped',
        },
      },
      {
        buyer: {
          prompt: this.props.intl.formatMessage(this.intlMessages.confirmReceiptOfOrder),
          instruction: this.props.intl.formatMessage(this.intlMessages.submitThisForm),
          buttonText: this.props.intl.formatMessage(this.intlMessages.confirmAndReview),
          functionName: 'confirmReceipt',
          placeholderText: this.props.intl.formatMessage(this.intlMessages.buyerReviewPlaceholder),
          reviewable: true,
        },
        seller: {
          prompt: this.props.intl.formatMessage(this.intlMessages.waitForBuyer),
        },
      },
      {
        buyer: {
          prompt: this.props.intl.formatMessage(this.intlMessages.awaitSellerWithdrawl),
        },
        seller: {
          prompt: this.props.intl.formatMessage(this.intlMessages.completeByWithdrawing),
          instruction: this.props.intl.formatMessage(this.intlMessages.clickToWithdraw),
          buttonText: this.props.intl.formatMessage(this.intlMessages.withdrawAndReview),
          functionName: 'withdrawFunds',
          placeholderText: this.props.intl.formatMessage(this.intlMessages.sellerReviewPlaceholder),
          reviewable: true,
        },
      },
    ]
  }

  componentWillMount() {
    this.loadPurchase()
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  componentDidUpdate(prevProps, prevState) {
    const { address, buyerAddress, listingAddress } = this.state.purchase
    const { sellerAddress } = this.state.listing

    if (prevState.purchase.listingAddress !== listingAddress) {
      this.loadListing(listingAddress)
      this.loadBuyer(buyerAddress)
      this.loadReviews(listingAddress)
    }

    if (prevState.listing.sellerAddress !== sellerAddress) {
      this.loadSeller(sellerAddress)
    }

    // detect route param change and reload data
    if (address && address !== this.props.purchaseAddress) {
      this.setState(defaultState)

      this.loadPurchase()
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
      this.setState({ processing: true })

      const { created, transactionReceipt } = await origin.purchases.buyerConfirmReceipt(purchaseAddress, {
        rating,
        reviewText: reviewText.trim(),
      }, (confirmationCount, transactionReceipt) => {
        // Having a transaction receipt doesn't guarantee that the purchase state will have changed.
        // Let's relentlessly retrieve the data so that we are sure to get it. - Micah
        this.loadPurchase()
        this.loadReviews(this.state.listing.address)

        this.props.updateTransaction(confirmationCount, transactionReceipt)
      })

      this.props.upsertTransaction({
        ...transactionReceipt,
        created,
        transactionTypeKey: 'confirmReceipt',
      })

      this.setState({ processing: false })
    } catch(error) {
      this.setState({ processing: false })
      
      console.error('Error marking purchase received by buyer')
      console.error(error)
    }
  }

  async confirmShipped() {
    const { purchaseAddress } = this.props

    try {
      this.setState({ processing: true })

      const { created, transactionReceipt } = await origin.purchases.sellerConfirmShipped(
        purchaseAddress,
        (confirmationCount, transactionReceipt) => {
          // Having a transaction receipt doesn't guarantee that the purchase state will have changed.
          // Let's relentlessly retrieve the data so that we are sure to get it. - Micah
          this.loadPurchase()

          this.props.updateTransaction(confirmationCount, transactionReceipt)
        }
      )

      this.props.upsertTransaction({
        ...transactionReceipt,
        created,
        transactionTypeKey: 'confirmShipped',
      })

      this.setState({ processing: false })
    } catch(error) {
      this.setState({ processing: false })
      
      console.error('Error marking purchase shipped by seller')
      console.error(error)
    }
  }

  async withdrawFunds() {
    const { purchaseAddress } = this.props
    const { rating, reviewText } = this.state.form

    try {
      this.setState({ processing: true })

      const { created, transactionReceipt } = await origin.purchases.sellerGetPayout(purchaseAddress, {
        rating,
        reviewText: reviewText.trim(),
      }, (confirmationCount, transactionReceipt) => {
        // Having a transaction receipt doesn't guarantee that the purchase state will have changed.
        // Let's relentlessly retrieve the data so that we are sure to get it. - Micah
        this.loadPurchase()
        this.loadReviews(this.state.listing.address)

        this.props.updateTransaction(confirmationCount, transactionReceipt)
      })

      this.props.upsertTransaction({
        ...transactionReceipt,
        created,
        transactionTypeKey: 'getPayout',
      })

      this.setState({ processing: false })
    } catch(error) {
      this.setState({ processing: false })

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
    const { web3Account } = this.props

    const { buyer, form, listing, logs, processing, purchase, reviews, seller } = this.state
    const translatedListing = translateListingCategory(listing)
    const { rating, reviewText } = form
    const buyersReviews = reviews.filter(r => r.revieweeRole === 'SELLER')

    if (!purchase.address || !listing.address ){
      return null
    }

    let perspective
    // may potentially be neither buyer nor seller
    if (web3Account === purchase.buyerAddress) {
      perspective = 'buyer'
    } else if (web3Account === listing.sellerAddress) {
      perspective = 'seller'
    }

    const pictures = listing.pictures || []
    const category = translatedListing.category || ""
    const active = listing.unitsAvailable > 0 // Todo, move to origin.js, take into account listing expiration
    const soldAt = purchase.created * 1000 // convert seconds since epoch to ms

    // log events
    const paymentEvent = logs.find(l => l.stage === 'in_escrow')
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
      step = 4
    } else if (purchase.stage === 'seller_pending') {
      step = 3
    } else if (purchase.stage === 'buyer_pending') {
      step = 2
    } else if (purchase.stage === 'in_escrow') {
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

    const nextStep = perspective && this.nextSteps[step]
    const { buttonText, functionName, instruction, placeholderText, prompt, reviewable } = nextStep ? nextStep[perspective] : {}
    const buyerName = (buyer.profile && `${buyer.profile.firstName} ${buyer.profile.lastName}`) ||
            <FormattedMessage
              id={ 'purchase-detail.unnamedUser' }
              defaultMessage={ 'Unnamed User' }
            />
    const sellerName = (seller.profile && `${seller.profile.firstName} ${seller.profile.lastName}`) ||
            <FormattedMessage
              id={ 'purchase-detail.unnamedUser' }
              defaultMessage={ 'Unnamed User' }
            />

    return (
      <div className="purchase-detail">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="brdcrmb">
                {perspective === 'buyer' &&
                  <FormattedMessage
                    id={ 'purchase-detail.purchasedFrom' }
                    defaultMessage={ 'Purchased from {sellerLink}' }
                    values={{ sellerLink: <Link to={`/users/${counterpartyUser.address}`}>{sellerName}</Link> }}
                  />
                }
                {perspective === 'seller' &&
                  <FormattedMessage
                    id={ 'purchase-detail.soldTo' }
                    defaultMessage={ 'Sold to {buyerLink}' }
                    values={{ buyerLink: <Link to={`/users/${counterpartyUser.address}`}>{buyerName}</Link> }}
                  />
                }
              </div>
              <h1>{translatedListing.name}</h1>
            </div>
          </div>
          <div className="purchase-status row">
            <div className="col-12 col-lg-8">
              <h2>
                <FormattedMessage
                  id={ 'purchase-detail.transactionStatusHeading' }
                  defaultMessage={ 'Transaction Status' }
                />
              </h2>
              <div className="row">
                <div className="col-6">
                  <Link to={`/users/${seller.address}`}>
                    <div className="d-flex">
                      <Avatar
                        image={seller.profile && seller.profile.avatar}
                        placeholderStyle={perspective === 'seller' ? 'green' : 'blue'}
                      />
                      <div className="identification d-flex flex-column justify-content-between text-truncate">
                        <div>
                          <span className="badge badge-dark">
                            <FormattedMessage
                              id={ 'purchase-detail.seller' }
                              defaultMessage={ 'Seller' }
                            />
                          </span>
                        </div>
                        <div className="name">{sellerName}</div>
                        <div className="address text-muted text-truncate">{seller.address}</div>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="col-6">
                  <Link to={`/users/${buyer.address}`}>
                    <div className="d-flex justify-content-end">
                      <div className="identification d-flex flex-column text-right justify-content-between text-truncate">
                        <div>
                          <span className="badge badge-dark">
                            <FormattedMessage
                              id={ 'purchase-detail.buyer' }
                              defaultMessage={ 'Buyer' }
                            />
                          </span>
                        </div>
                        <div className="name">{buyerName}</div>
                        <div className="address text-muted text-truncate">{buyer.address}</div>
                      </div>
                      <Avatar
                        image={buyer.profile && buyer.profile.avatar}
                        placeholderStyle={perspective === 'buyer' ? 'green' : 'blue'}
                      />
                    </div>
                  </Link>
                </div>
                <div className="col-12">
                  <PurchaseProgress currentStep={step} maxStep={maxStep} purchase={purchase} perspective={perspective} />
                </div>
                {nextStep &&
                  <div className="col-12">
                    <div className="guidance text-center">
                      <div className="triangle" style={{ left }}></div>
                      <div className="triangle" style={{ left }}></div>
                      <div className="prompt">
                        <strong>
                          <FormattedMessage
                            id={ 'purchase-detail.nextStep' }
                            defaultMessage={ 'Next Step:' }
                          />
                        </strong>
                        &nbsp;{prompt}
                      </div>
                      {reviewable &&
                        <form onSubmit={e => {
                          e.preventDefault()

                          this[functionName]()
                        }}>
                          <div className="form-group">
                            <label htmlFor="review">
                              <FormattedMessage
                                id={ 'purchase-detail.reviewLabel' }
                                defaultMessage={ 'Review' }
                              />
                            </label>
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
                          <div className="instruction">
                            {instruction ||
                              <FormattedMessage
                                id={ 'purchase-detail.nothingToDo' }
                                defaultMessage={ 'Nothing for you to do at this time. Check back later' }
                              />
                            }
                          </div>
                          <button className="btn btn-primary" onClick={this[functionName]}>{buttonText}</button>
                        </Fragment>
                      }
                    </div>
                  </div>
                }
              </div>
              <h2>
                <FormattedMessage
                  id={ 'purchase-detail.transactionHistoryHeading' }
                  defaultMessage={ 'Transaction History' }
                />
              </h2>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '200px' }}>
                      <FormattedMessage
                        id={ 'purchase-detail.txName' }
                        defaultMessage={ 'TxName' }
                      />
                    </th>
                    <th scope="col">
                      <FormattedMessage
                        id={ 'purchase-detail.txHash' }
                        defaultMessage={ 'TxHash' }
                      />
                    </th>
                    <th scope="col">
                      <FormattedMessage
                        id={ 'purchase-detail.from' }
                        defaultMessage={ 'From' }
                      />
                    </th>
                    <th scope="col">
                      <FormattedMessage
                        id={ 'purchase-detail.to' }
                        defaultMessage={ 'To' }
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>

                  {paidAt &&
                    <TransactionEvent timestamp={paidAt} eventName="Payment received" transaction={paymentEvent} buyer={buyer} seller={seller} />
                  }

                  {fulfilledAt &&
                    <TransactionEvent timestamp={fulfilledAt} eventName="Sent by seller" transaction={fulfillmentEvent} buyer={buyer} seller={seller} />
                  }

                  {receivedAt &&
                    <TransactionEvent timestamp={receivedAt} eventName="Received by buyer" transaction={receiptEvent} buyer={buyer} seller={seller} />
                  }

                  {withdrawnAt &&
                    <TransactionEvent timestamp={withdrawnAt} eventName="Funds withdrawn" transaction={withdrawalEvent} buyer={buyer} seller={seller} />
                  }

                </tbody>
              </table>
              <hr />
            </div>
            <div className="col-12 col-lg-4">
              {counterpartyUser.address && <UserCard title={counterparty} listingAddress={listing.address} purchaseAddress={purchase.address} userAddress={counterpartyUser.address} />}
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-lg-8">
              {listing.address &&
                <Fragment>
                  <h2>
                     <FormattedMessage
                      id={ 'purchase-detail.listingDetails' }
                      defaultMessage={ 'Listing Details' }
                    />
                  </h2>
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
                    <h2 className="category placehold">{translatedListing.category}</h2>
                    <h1 className="title text-truncate placehold">{translatedListing.name}</h1>
                    <p className="description placehold">{translatedListing.description}</p>
                    {/*!!listing.unitsAvailable && listing.unitsAvailable < 5 &&
                      <div className="units-available text-danger">Just {listing.unitsAvailable.toLocaleString()} left!</div>
                    */}
                    {listing.ipfsHash &&
                      <div className="link-container">
                        <a href={origin.ipfsService.gatewayUrlForHash(listing.ipfsHash)} target="_blank">
                          <FormattedMessage
                            id={ 'purchase-detail.viewOnIPFS' }
                            defaultMessage={ 'View on IPFS' }
                          />
                          <img src="images/carat-blue.svg" className="carat" alt="right carat" />
                        </a>
                      </div>
                    }
                  </div>
                  <hr />
                </Fragment>
              }
              <div className="reviews">
                <h2>
                  <FormattedMessage
                    id={ 'purchase-detail.reviewsHeading' }
                    defaultMessage={ 'Reviews' }
                  />
                  &nbsp;<span className="review-count">{Number(buyersReviews.length).toLocaleString()}</span>
                </h2>
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
                  <div className="recap">
                    {perspective === 'buyer' &&
                      <FormattedMessage
                        id={ 'purchase-detail.purchasedFromOn' }
                        defaultMessage={ 'Purchased from {sellerName} on {date}' }
                        values={{ sellerName, date: <FormattedDate value={soldAt} /> }}
                      />
                    }
                    {perspective === 'seller' &&
                      <FormattedMessage
                        id={ 'purchase-detail.soldToOn' }
                        defaultMessage={ 'Sold to {buyerName} on {date}' }
                        values={{ buyerName, date: <FormattedDate value={soldAt} /> }}
                      />
                    }
                  </div>
                  <hr className="dark sm" />
                  <div className="d-flex">
                    <div className="text-left">
                      <FormattedMessage
                        id={ 'purchase-detail.price' }
                        defaultMessage={ 'Price' }
                      />
                    </div>
                    <div className="text-right">{price}</div>
                  </div>
                  <hr className="dark sm" />
                  <div className={`status ${status}`}>
                    <FormattedMessage
                      id={ 'purchase-detail.listingStatus' }
                      defaultMessage={ 'This listing is {status}' }
                      values={{ status }}
                    />
                    
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
        {processing &&
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/spinner-animation.svg" role="presentation"/>
            </div>
            <FormattedMessage
              id={ 'purchase-detail.processingUpdate' }
              defaultMessage={ 'Processing your update' }
            />
            <br />
            <FormattedMessage
              id={ 'purchase-detail.pleaseStandBy' }
              defaultMessage={ 'Please stand by...' }
            />
          </Modal>
        }
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    web3Account: state.app.web3.account,
  }
}

const mapDispatchToProps = dispatch => ({
  updateTransaction: (confirmationCount, transactionReceipt) => dispatch(updateTransaction(confirmationCount, transactionReceipt)),
  upsertTransaction: (transaction) => dispatch(upsertTransaction(transaction)),
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PurchaseDetail))
