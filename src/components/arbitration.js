import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

import Avatar from 'components/avatar'
import Conversation from 'components/conversation'
import Modal from 'components/modal'
import Review from 'components/review'
import UserCard from 'components/user-card'

import TransactionEvent from 'pages/purchases/transaction-event'

import { getListing } from 'utils/listing'

import origin from '../services/origin'

const ARBITRATOR_ETH_ADDRESS = process.env.ARBITRATOR_ACCOUNT

const defaultState = {
  buyer: {},
  listing: {},
  processing: false,
  purchase: {},
  reviews: [],
  seller: {}
}

class Arbitration extends Component {
  constructor(props) {
    super(props)

    this.handleRuling = this.handleRuling.bind(this)
    this.loadPurchase = this.loadPurchase.bind(this)
    this.state = defaultState
  }

  componentWillMount() {
    this.loadPurchase()
  }

  componentDidUpdate() {
    this.validateUser()
  }

  async handleRuling() {
    alert('To Do')
  }

  async loadPurchase() {
    const { offerId } = this.props

    try {
      const purchase = await origin.marketplace.getOffer(offerId)
      const listing = await getListing(purchase.listingId, true)
      const reviews = await origin.marketplace.getListingReviews(offerId)
      this.setState({
        purchase,
        listing: {
          ...listing,
          boostAmount: 10,
          boostLevel: 'Medium',
          boostLevelIsPastSomeThreshold: !!Math.round(Math.random())
        },
        reviews
      })
      await this.loadSeller(listing.seller)
      await this.loadBuyer(purchase.buyer)
    } catch (error) {
      console.error(`Error loading purchase ${offerId}`)
      console.error(error)
    }
  }

  async loadBuyer(addr) {
    try {
      const user = await origin.users.get(addr)

      this.setState({ buyer: { ...user, address: addr } })
    } catch (error) {
      console.error(`Error loading buyer ${addr}`)
      console.error(error)
    }
  }

  async loadSeller(addr) {
    try {
      const user = await origin.users.get(addr)

      this.setState({ seller: { ...user, address: addr } })
    } catch (error) {
      console.error(`Error loading seller ${addr}`)
      console.error(error)
    }
  }

  validateUser() {
    const { web3Account } = this.props

    if (web3Account && this.props.web3Account.toUpperCase() !== ARBITRATOR_ETH_ADDRESS.toUpperCase()) {
      alert(`⚠️ Warning:\nCurrent account (${this.props.web3Account}) is not equal to the ARBITRATOR_ACCOUNT environment variable (${ARBITRATOR_ETH_ADDRESS})`)
    }
  }

  render() {
    const { messages, web3Account } = this.props

    if (!web3Account) {
      return null
    }

    const {
      buyer,
      listing,
      processing,
      purchase,
      reviews,
      seller,
    } = this.state
    const isPending = false // will be handled by offer status
    const isSold = !listing.unitsRemaining

    // Data not loaded yet.
    if (!purchase.status || !listing.status) {
      return null
    }

    const pictures = listing.pictures || []

    const paymentEvent = purchase.events.find(l => l.event === 'OfferCreated')
    const fulfillmentEvent = purchase.events.find(
      l => l.event === 'OfferAccepted'
    )
    const receiptEvent = purchase.events.find(l => l.event === 'OfferFinalized')
    const withdrawalEvent = purchase.events.find(
      l => l.event === 'OfferData' && l.returnValues.party === listing.seller
    )

    const buyerName = buyer.profile ? (
      `${buyer.profile.firstName} ${buyer.profile.lastName}`
    ) : 'Unnamed User'
    const sellerName = seller.profile ? (
      `${seller.profile.firstName} ${seller.profile.lastName}`
    ) : 'Unnamed User'

    const buyerConversationId = buyer.address && origin.messaging.generateRoomId(web3Account, buyer.address)
    const sellerConversationId = seller.address && origin.messaging.generateRoomId(web3Account, seller.address)

    return (
      <div className="purchase-detail">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="brdcrmb">
                <Link to={`/users/${seller.address}`}>
                  {sellerName}
                </Link>
                {' sold to '}
                <Link to={`/users/${buyer.address}`}>
                  {buyerName}
                </Link>
              </div>
              <h1>
                {listing.name}
                {isPending &&
                  <span className="pending badge">Pending</span>
                }
                {isSold &&
                  <span className="sold badge">Sold Out</span>
                }
                {listing.boostLevel &&
                  <span className={ `boosted badge boost-${listing.boostLevel}` }>
                    <img src="images/boost-icon-arrow.svg" role="presentation" />
                  </span>
                }
              </h1>
            </div>
          </div>
          <div className="purchase-status row">
            <div className="col-12">
              <h2>Transaction Status</h2>
              <div className="row">
                <div className="col-6">
                  <Link to={`/users/${seller.address}`}>
                    <div className="d-flex">
                      <Avatar
                        image={seller.profile && seller.profile.avatar}
                        placeholderStyle="blue"
                      />
                      <div className="identification d-flex flex-column justify-content-between text-truncate">
                        <div>
                          <span className="badge badge-dark">Seller</span>
                        </div>
                        <div className="name">{sellerName}</div>
                        <div className="address text-muted text-truncate">
                          {seller.address}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="col-6">
                  <Link to={`/users/${buyer.address}`}>
                    <div className="d-flex justify-content-end">
                      <div className="identification d-flex flex-column text-right justify-content-between text-truncate">
                        <div>
                          <span className="badge badge-dark">Buyer</span>
                        </div>
                        <div className="name">{buyerName}</div>
                        <div className="address text-muted text-truncate">
                          {buyer.address}
                        </div>
                      </div>
                      <Avatar
                        image={buyer.profile && buyer.profile.avatar}
                        placeholderStyle="green"
                      />
                    </div>
                  </Link>
                </div>
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
                  <TransactionEvent
                    eventName="Payment received"
                    transaction={paymentEvent}
                    buyer={buyer}
                    seller={seller}
                  />
                  <TransactionEvent
                    eventName="Sent by seller"
                    transaction={fulfillmentEvent}
                    buyer={buyer}
                    seller={seller}
                  />
                  <TransactionEvent
                    eventName="Received by buyer"
                    transaction={receiptEvent}
                    buyer={buyer}
                    seller={seller}
                  />
                  <TransactionEvent
                    eventName="Seller reviewed"
                    transaction={withdrawalEvent}
                    buyer={buyer}
                    seller={seller}
                  />
                </tbody>
              </table>
              <hr />
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-lg-8">
              {listing.id && (
                <Fragment>
                  <h2>Listing Details</h2>
                  {!!pictures.length && (
                    <div className="carousel small">
                      {pictures.map(pictureUrl => (
                        <div className="photo" key={pictureUrl}>
                          <img src={pictureUrl} role="presentation" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="detail-info-box">
                    <h2 className="category placehold">
                      {listing.category}
                    </h2>
                    <h1 className="title text-truncate placehold">
                      {listing.name}
                    </h1>
                    <p className="description placehold">
                      {listing.description}
                    </p>
                  </div>
                  <hr />
                </Fragment>
              )}
              <div className="reviews">
                <h2>Reviews&nbsp;<span className="review-count">{Number(reviews.length).toLocaleString()}</span></h2>
                {reviews.map(r => (
                  <Review key={r.transactionHash} review={r} />
                ))}
              </div>
            </div>
          </div>
          <div className="row">
            {seller.address &&
              <div className="col-12 col-md-6">
                <UserCard
                  title="Seller"
                  listingId={listing.id}
                  purchaseId={purchase.id}
                  userAddress={seller.address}
                />
                <div className="conversation-container">
                  <Conversation
                    id={sellerConversationId}
                    messages={messages.filter(({ content, conversationId }) => content && conversationId === sellerConversationId).sort((a, b) => (a.index < b.index ? -1 : 1))}
                  />
                </div>
                <button className="btn btn-lg btn-info mt-4" onClick={this.handleRuling}>Rule In Favor Of Seller</button>
              </div>
            }
            {buyer.address &&
              <div className="col-12 col-md-6">
                <UserCard
                  title="Buyer"
                  listingId={listing.id}
                  purchaseId={purchase.id}
                  userAddress={buyer.address}
                />
                <div className="conversation-container">
                  <Conversation
                    id={origin.messaging.generateRoomId(web3Account, buyer.address)}
                    messages={messages.filter(({ content, conversationId }) => content && conversationId === buyerConversationId).sort((a, b) => (a.index < b.index ? -1 : 1))}
                  />
                </div>
                <button className="btn btn-lg btn-info mt-4" onClick={this.handleRuling}>Rule In Favor Of Buyer</button>
              </div>
            }
          </div>
        </div>
        {processing && (
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/spinner-animation.svg" role="presentation" />
            </div>
            Processing your update
            <br />
            Please stand by...
          </Modal>
        )}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    messages: state.messages,
    web3Account: state.app.web3.account
  }
}

export default withRouter(connect(mapStateToProps)(Arbitration))
