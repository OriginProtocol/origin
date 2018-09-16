import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  FormattedMessage,
  FormattedDate,
  defineMessages,
  injectIntl
} from 'react-intl'
import $ from 'jquery'

import {
  update as updateTransaction,
  upsert as upsertTransaction
} from 'actions/Transaction'

import { ConfirmationModal, IssueModal, RejectionModal } from 'components/arbitration-modals'
import Avatar from 'components/avatar'
import Modal from 'components/modal'
import PurchaseProgress from 'components/purchase-progress'
import Review from 'components/review'
import UserCard from 'components/user-card'

import TransactionEvent from 'pages/purchases/transaction-event'

import { getListing } from 'utils/listing'
import { offerStatusToStep } from 'utils/offer'

import origin from '../services/origin'

const ARBITRATOR_ETH_ADDRESS = process.env.ARBITRATOR_ACCOUNT

const defaultState = {
  buyer: {},
  form: {
    rating: 5,
    reviewText: ''
  },
  issue: '',
  listing: {},
  modalsOpen: {
    confirmation: false,
    issue: false,
    rejection: false
  },
  processing: false,
  purchase: {},
  reviews: [],
  seller: {}
}

class PurchaseDetail extends Component {
  constructor(props) {
    super(props)

    this.acceptOffer = this.acceptOffer.bind(this)
    this.completePurchase = this.completePurchase.bind(this)
    this.handleProblem = this.handleProblem.bind(this)
    this.handleRating = this.handleRating.bind(this)
    this.handleReviewText = this.handleReviewText.bind(this)
    this.initiateDispute = this.initiateDispute.bind(this)
    this.loadPurchase = this.loadPurchase.bind(this)
    this.rejectOffer = this.rejectOffer.bind(this)
    this.reviewSale = this.reviewSale.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
    this.withdrawOffer = this.withdrawOffer.bind(this)
    this.state = defaultState

    this.intlMessages = defineMessages({
      awaitApproval: {
        id: 'purchase-detail.awaitApproval',
        defaultMessage: 'Wait for the seller to approve your offer'
      },
      acceptBuyersOffer: {
        id: 'purchase-detail.acceptOrRejectOffer',
        defaultMessage: 'Accept or reject the buyer\'s offer'
      },
      acceptOfferInstruction: {
        id: 'purchase-detail.acceptOfferInstruction',
        defaultMessage: 'Click below to cancel or continue this transaction.'
      },
      acceptOffer: {
        id: 'purchase-detail.acceptOffer',
        defaultMessage: 'Accept'
      },
      waitForContact: {
        id: 'purchase-detail.waitForContact',
        defaultMessage: 'Wait to be contacted by an Origin team member'
      },
      completePurchase: {
        id: 'purchase-detail.completePurchase',
        defaultMessage: 'Complete your purchase and leave a review'
      },
      submitThisForm: {
        id: 'purchase-detail.submitThisForm',
        defaultMessage:
          'Submit this form once you confirm that you are satisfied with your purchase.'
      },
      confirmAndReview: {
        id: 'purchase-detail.confirmAndReview',
        defaultMessage: 'Confirm and Review'
      },
      buyerReviewPlaceholder: {
        id: 'purchase-detail.buyerReviewPlaceholder',
        defaultMessage:
          'Your review should inform others about your experience transacting with this seller, not about the product itself.'
      },
      waitForBuyer: {
        id: 'purchase-detail.waitForBuyer',
        defaultMessage: 'Wait for the buyer to finalize the transaction'
      },
      fulfillObligation: {
        id: 'purchase-detail.fulfillObligation',
        defaultMessage: 'Make sure you fulfill the order.'
      },
      awaitSellerReview: {
        id: 'purchase-detail.awaitSellerReview',
        defaultMessage: 'Wait for the seller to leave a review'
      },
      completeByReviewing: {
        id: 'purchase-detail.completeByReviewing',
        defaultMessage: 'Complete your sale by leaving a review'
      },
      clickToReview: {
        id: 'purchase-detail.clickToReview',
        defaultMessage: 'Click the button below to leave a review'
      },
      reviewSale: {
        id: 'purchase-detail.reviewSale',
        defaultMessage: 'Leave a review'
      },
      rejectOffer: {
        id: 'purchase-detail.rejectOffer',
        defaultMessage: 'Reject'
      },
      reportProblem: {
        id: 'purchase-detail.reportProblem',
        defaultMessage: 'Report a Problem'
      },
      sellerReviewPlaceholder: {
        id: 'purchase-detail.sellerReviewPlaceholder',
        defaultMessage:
          'Your review should inform others about your experience transacting with this buyer.'
      },
      withdrawOffer: {
        id: 'purchase-detail.withdrawOffer',
        defaultMessage: 'Withdraw Offer'
      },
      offerMade: {
        id: 'purchase-detail.offerMade',
        defaultMessage: 'Offer Made'
      },
      offerWithdrawn: {
        id: 'purchase-detail.offerWithdrawn',
        defaultMessage: 'Offer Withdrawn'
      },
      offerAccepted: {
        id: 'purchase-detail.offerAccepted',
        defaultMessage: 'Offer Accepted'
      },
      saleCompleted: {
        id: 'purchase-detail.saleCompleted',
        defaultMessage: 'Sale Completed'
      },
      saleReviewed: {
        id: 'purchase-detail.saleReviewed',
        defaultMessage: 'Sale Reviewed'
      }
    })

    this.nextSteps = {
      created: {
        buyer: {
          prompt: this.props.intl.formatMessage(
            this.intlMessages.awaitApproval
          ),
          buttons: [],
          link: {
            functionName: 'withdrawOffer',
            text: this.props.intl.formatMessage(
              this.intlMessages.withdrawOffer
            )
          }
        },
        seller: {
          prompt: this.props.intl.formatMessage(
            this.intlMessages.acceptBuyersOffer
          ),
          instruction: this.props.intl.formatMessage(
            this.intlMessages.acceptOfferInstruction
          ),
          buttons: [
            {
              functionName: 'rejectOffer',
              text: this.props.intl.formatMessage(
                this.intlMessages.rejectOffer
              )
            },
            {
              functionName: 'acceptOffer',
              text: this.props.intl.formatMessage(
                this.intlMessages.acceptOffer
              )
            }
          ]
        }
      },
      accepted: {
        buyer: {
          prompt: this.props.intl.formatMessage(
            this.intlMessages.completePurchase
          ),
          instruction: this.props.intl.formatMessage(
            this.intlMessages.submitThisForm
          ),
          placeholderText: this.props.intl.formatMessage(
            this.intlMessages.buyerReviewPlaceholder
          ),
          buttons: [
            {
              functionName: 'completePurchase',
              text: this.props.intl.formatMessage(
                this.intlMessages.confirmAndReview
              )
            }
          ],
          link: {
            functionName: 'handleProblem',
            text: this.props.intl.formatMessage(
              this.intlMessages.reportProblem
            )
          },
          reviewable: true
        },
        seller: {
          prompt: this.props.intl.formatMessage(
            this.intlMessages.waitForBuyer
          ),
          instruction: this.props.intl.formatMessage(
            this.intlMessages.fulfillObligation
          ),
          buttons: [],
          link: {
            functionName: 'handleProblem',
            text: this.props.intl.formatMessage(
              this.intlMessages.reportProblem
            )
          }
        }
      },
      disputed: {
        buyer: {
          prompt: this.props.intl.formatMessage(
            this.intlMessages.waitForContact
          ),
          buttons: []
        },
        seller: {
          prompt: this.props.intl.formatMessage(
            this.intlMessages.waitForContact
          ),
          buttons: []
        }
      },
      finalized: {
        buyer: {
          prompt: this.props.intl.formatMessage(
            this.intlMessages.awaitSellerReview
          ),
          buttons: []
        },
        seller: {
          prompt: this.props.intl.formatMessage(
            this.intlMessages.completeByReviewing
          ),
          instruction: this.props.intl.formatMessage(
            this.intlMessages.clickToReview
          ),
          placeholderText: this.props.intl.formatMessage(
            this.intlMessages.sellerReviewPlaceholder
          ),
          buttons: [
            {
              functionName: 'reviewSale',
              text: this.props.intl.formatMessage(
                this.intlMessages.reviewSale
              )
            }
          ],
          reviewable: true
        }
      }
    }
  }

  componentWillMount() {
    this.loadPurchase()
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  componentWillUnmount() {
    $('[data-toggle="tooltip"]').tooltip('dispose')
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
      // console.log('Seller: ', this.state.seller)
    } catch (error) {
      console.error(`Error loading seller ${addr}`)
      console.error(error)
    }
  }

  async completePurchase() {
    const { offerId } = this.props
    const { rating, reviewText } = this.state.form
    const { purchase, listing } = this.state
    const offer = purchase

    try {
      this.setState({ processing: true })

      const buyerReview = {
        rating,
        text: reviewText.trim()
      }
      const transactionReceipt = await origin.marketplace.finalizeOffer(
        offerId,
        buyerReview,
        (confirmationCount, transactionReceipt) => {
          // Having a transaction receipt doesn't guarantee that the purchase state will have changed.
          // Let's relentlessly retrieve the data so that we are sure to get it. - Micah
          this.loadPurchase()

          this.props.updateTransaction(confirmationCount, transactionReceipt)
        }
      )
      this.props.upsertTransaction({
        ...transactionReceipt,
        offer,
        listing,
        transactionTypeKey: 'completePurchase'
      })

      this.setState({ processing: false })
    } catch (error) {
      this.setState({ processing: false })

      console.error('Error completing purchase')
      console.error(error)
    }
  }

  async acceptOffer() {
    const { offerId } = this.props
    const { purchase, listing } = this.state
    const offer = purchase

    try {
      this.setState({ processing: true })

      const transactionReceipt = await origin.marketplace.acceptOffer(
        offerId,
        {},
        (confirmationCount, transactionReceipt) => {
          // Having a transaction receipt doesn't guarantee that the purchase state will have changed.
          // Let's relentlessly retrieve the data so that we are sure to get it. - Micah
          this.loadPurchase()

          this.props.updateTransaction(confirmationCount, transactionReceipt)
        }
      )

      this.props.upsertTransaction({
        ...transactionReceipt,
        transactionTypeKey: 'acceptOffer',
        offer,
        listing
      })

      this.setState({ processing: false })
    } catch (error) {
      this.setState({ processing: false })

      console.error('Error accepting offer')
      console.error(error)
    }
  }

  async rejectOffer() {
    this.toggleModal('rejection')
    alert('To Do')
  }

  async withdrawOffer() {
    alert('To Do')
  }

  async reviewSale() {
    const { offerId } = this.props
    const { rating, reviewText } = this.state.form
    const { purchase, listing } = this.state
    const offer = purchase

    try {
      this.setState({ processing: true })

      const sellerReview = {
        rating,
        text: reviewText.trim()
      }
      const transactionReceipt = await origin.marketplace.addData(
        null,
        offerId,
        sellerReview,
        (confirmationCount, transactionReceipt) => {
          // Having a transaction receipt doesn't guarantee that the purchase state will have changed.
          // Let's relentlessly retrieve the data so that we are sure to get it. - Micah
          this.loadPurchase()

          this.props.updateTransaction(confirmationCount, transactionReceipt)
        }
      )

      this.props.upsertTransaction({
        ...transactionReceipt,
        offer,
        listing,
        transactionTypeKey: 'reviewSale'
      })

      this.setState({ processing: false })
    } catch (error) {
      this.setState({ processing: false })

      console.error('Error withdrawing funds for seller')
      console.error(error)
    }
  }

  handleProblem() {
    this.toggleModal('confirmation')
  }

  // rating: 1 <= integer <= 5
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

  async initiateDispute() {
    const content = this.state.issue
    alert(`To Do: send "${content}" to arbitrator as an ecrypted message`)
    // const { web3Account } = this.props
    // const { listing, purchase } = this.state
    // const counterpartyAddress = web3Account === purchase.buyer ? listing.seller : purchase.buyer
    // const roomId = origin.messaging.generateRoomId(web3Account, counterpartyAddress)
    // const keys = origin.messaging.getSharedKeys(roomId)
    // const prompt = confirm(`You want to share conversation key ${keys[0]} with The Arbitrator (${ARBITRATOR_ETH_ADDRESS})?`)

    // if (prompt) {
    //   try {
    //     await origin.messaging.sendConvMessage(ARBITRATOR_ETH_ADDRESS, {
    //       decryption: { keys, roomId }
    //     })
    //   } catch(e) {
    //     console.error(e)
    //     throw e
    //   }
    // }
    try {
      this.setState({ processing: true })
      
      const { listing, purchase } = this.state
      const offer = purchase

      const transactionReceipt = await origin.marketplace.initiateDispute(
        purchase.id,
        {},
        (confirmationCount, transactionReceipt) => {
          // Having a transaction receipt doesn't guarantee that the purchase state will have changed.
          // Let's relentlessly retrieve the data so that we are sure to get it. - Micah
          this.loadPurchase()

          this.props.updateTransaction(confirmationCount, transactionReceipt)
        }
      )

      this.props.upsertTransaction({
        ...transactionReceipt,
        offer,
        listing,
        transactionTypeKey: 'initiateDispute'
      })

      this.setState({ processing: false })
    } catch (error) {
      this.setState({ processing: false })

      throw error
    }
  }

  toggleModal(name) {
    this.setState(prevState => {
      return {
        modalsOpen: {
          ...prevState.modalsOpen,
          [name]: !prevState.modalsOpen[name]
        }
      }
    })
  }

  render() {
    const { messages, web3Account } = this.props
    const {
      buyer,
      describingProblem,
      form,
      listing,
      modalsOpen,
      processing,
      purchase,
      reviews,
      seller
    } = this.state
    const step = offerStatusToStep(purchase.status)
    const isPending = purchase.status !== 'withdrawn' && step < 3
    const disputed = purchase.status = 'disputed'
    const isSold = step > 2
    const { rating, reviewText } = form

    // Data not loaded yet.
    if (!purchase.status || !listing.status) {
      return null
    }

    let perspective
    // may potentially be neither buyer nor seller
    if (web3Account === purchase.buyer) {
      perspective = 'buyer'
    } else if (web3Account === listing.seller) {
      perspective = 'seller'
    }


    const pictures = listing.pictures || []
    const active = listing.status === 'active' // TODO: move to origin.js, take into account listing expiration
    const soldAt = purchase.createdAt * 1000 // convert seconds since epoch to ms

    const offerCreated = purchase.event('OfferCreated')
    const offerWithdrawn = purchase.event('OfferWithdrawn')
    const offerAccepted = purchase.event('OfferAccepted')
    const offerFinalized = purchase.event('OfferFinalized')
    const offerData = purchase.event('OfferData')

    const priceEth = `${Number(purchase.totalPrice.amount).toLocaleString(undefined, {
      minimumFractionDigits: 5,
      maximumFractionDigits: 5
    })} ETH`

    const counterparty = ['buyer', 'seller'].find(str => str !== perspective)
    const counterpartyUser = counterparty === 'buyer' ? buyer : seller
    const status = active ? 'active' : 'inactive'
    const maxStep = perspective === 'seller' ? 4 : 3

    const nextStep = perspective && this.nextSteps[purchase.status]
    const {
      buttons,
      instruction,
      link,
      placeholderText,
      prompt,
      reviewable
    } = nextStep ? nextStep[perspective] : { buttons: [] }

    const buyerName = buyer.profile ? (
      `${buyer.profile.firstName} ${buyer.profile.lastName}`
    ) : (
      <FormattedMessage
        id={'purchase-detail.unnamedUser'}
        defaultMessage={'Unnamed User'}
      />
    )
    const sellerName = seller.profile ? (
      `${seller.profile.firstName} ${seller.profile.lastName}`
    ) : (
      <FormattedMessage
        id={'purchase-detail.unnamedUser'}
        defaultMessage={'Unnamed User'}
      />
    )
    const roomId = origin.messaging.generateRoomId(web3Account, counterpartyUser.address)
    const isEligibleForArbitration = ARBITRATOR_ETH_ADDRESS && web3Account !== ARBITRATOR_ETH_ADDRESS //&& origin.messaging.hasConversedWith(counterpartyUser.address)
    const arbitrationRoomId = ARBITRATOR_ETH_ADDRESS ? origin.messaging.generateRoomId(web3Account, ARBITRATOR_ETH_ADDRESS) : null
    // in the future this will need to account for key expiration and validation
    const arbitrationKeyShared = messages.find(({ conversationId, decryption }) => {
      // check for object containing keys and arbitrator identity
      if (!decryption || conversationId !== arbitrationRoomId) {
        return null
      }

      return decryption.roomId === roomId && decryption.keys[0]
    })

    return (
      <div className="purchase-detail">
        <div className="container">
          <div className="row">
            <div className="col-12">
              {offerFinalized &&
                <div className="brdcrmb">
                  {perspective === 'buyer' && (
                    <FormattedMessage
                      id={'purchase-detail.purchasedFrom'}
                      defaultMessage={'Purchased from {sellerLink}'}
                      values={{
                        sellerLink: (
                          <Link to={`/users/${counterpartyUser.address}`}>
                            {sellerName}
                          </Link>
                        )
                      }}
                    />
                  )}
                  {perspective === 'seller' && (
                    <FormattedMessage
                      id={'purchase-detail.soldTo'}
                      defaultMessage={'Sold to {buyerLink}'}
                      values={{
                        buyerLink: (
                          <Link to={`/users/${counterpartyUser.address}`}>
                            {buyerName}
                          </Link>
                        )
                      }}
                    />
                  )}
                </div>
              }
              {!offerFinalized && !offerWithdrawn &&
                <div className="brdcrmb">
                  {perspective === 'buyer' && (
                    <FormattedMessage
                      id={'purchase-detail.purchasingFrom'}
                      defaultMessage={'Purchasing from {sellerLink}'}
                      values={{
                        sellerLink: (
                          <Link to={`/users/${counterpartyUser.address}`}>
                            {sellerName}
                          </Link>
                        )
                      }}
                    />
                  )}
                  {perspective === 'seller' && (
                    <FormattedMessage
                      id={'purchase-detail.sellingTo'}
                      defaultMessage={'Selling to {buyerLink}'}
                      values={{
                        buyerLink: (
                          <Link to={`/users/${counterpartyUser.address}`}>
                            {buyerName}
                          </Link>
                        )
                      }}
                    />
                  )}
                </div>
              }
              <h1>
                {listing.name}
                {isPending && (
                  <span className="pending badge">
                    <FormattedMessage
                      id={'purchase-detail.pending'}
                      defaultMessage={'Pending'}
                    />
                  </span>
                )}
                {isSold && (
                  <span className="sold badge">
                    <FormattedMessage
                      id={'purchase-detail.soldOut'}
                      defaultMessage={'Sold Out'}
                    />
                  </span>
                )}
                {listing.boostLevel && (
                  <span className={`boosted badge boost-${listing.boostLevel}`}>
                    <img
                      src="images/boost-icon-arrow.svg"
                      role="presentation"
                    />
                  </span>
                )}
              </h1>
            </div>
          </div>
          <div className="purchase-status row">
            <div className="col-12 col-lg-8">
              <h2>
                <FormattedMessage
                  id={'purchase-detail.transactionStatusHeading'}
                  defaultMessage={'Transaction Status'}
                />
              </h2>
              <div className="row">
                <div className="col-6">
                  <Link to={`/users/${seller.address}`}>
                    <div className="d-flex">
                      <Avatar
                        image={seller.profile && seller.profile.avatar}
                        placeholderStyle={
                          perspective === 'seller' ? 'green' : 'blue'
                        }
                      />
                      <div className="identification d-flex flex-column justify-content-between text-truncate">
                        <div>
                          <span className="badge badge-dark">
                            <FormattedMessage
                              id={'purchase-detail.seller'}
                              defaultMessage={'Seller'}
                            />
                          </span>
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
                          <span className="badge badge-dark">
                            <FormattedMessage
                              id={'purchase-detail.buyer'}
                              defaultMessage={'Buyer'}
                            />
                          </span>
                        </div>
                        <div className="name">{buyerName}</div>
                        <div className="address text-muted text-truncate">
                          {buyer.address}
                        </div>
                      </div>
                      <Avatar
                        image={buyer.profile && buyer.profile.avatar}
                        placeholderStyle={
                          perspective === 'buyer' ? 'green' : 'blue'
                        }
                      />
                    </div>
                  </Link>
                </div>
                <div className="col-12">
                  <PurchaseProgress
                    currentStep={step}
                    maxStep={maxStep}
                    purchase={purchase}
                    perspective={perspective}
                  />
                </div>
                {nextStep && (
                  <div className="col-12">
                    <div className="guidance text-center">
                      <div className="triangles d-flex justify-content-between">
                        {[...Array(maxStep)].map((undef, i) => {
                          const count = i + 1
                          const visible = step === count || /* matched */
                                          (step === 0 && !i) || /* unknown, fallback to beginning */
                                          (step > maxStep && count === maxStep) /* include end if passed */
                          return (
                            <div
                              key={`triangle-pair-${count}`}
                              className={`triangle-pair${visible ? '' : ' hidden'}`}
                            >
                              <div className="triangle" />
                              <div className="triangle" />
                            </div>
                          )
                        })}
                      </div>
                      <div className="prompt">
                        <strong>
                          <FormattedMessage
                            id={'purchase-detail.nextStep'}
                            defaultMessage={'Next Step:'}
                          />
                        </strong>
                        &nbsp;{prompt}
                      </div>
                      {reviewable && instruction &&
                        <div className="instruction">
                          {instruction}
                        </div>
                      }
                      {!reviewable &&
                        <div className="instruction">
                          {instruction || 
                            <FormattedMessage
                              id={'purchase-detail.nothingToDo'}
                              defaultMessage={
                                'Nothing for you to do at this time. Check back later.'
                              }
                            />
                          }
                        </div>
                      }
                      {reviewable && (
                        <form
                          onSubmit={e => {
                            e.preventDefault()

                            this[buttons[0].functionName]()
                          }}
                        >
                          <div className="form-group">
                            <label htmlFor="review">
                              <FormattedMessage
                                id={'purchase-detail.reviewLabel'}
                                defaultMessage={'Review'}
                              />
                            </label>
                            <div className="stars">
                              {[...Array(5)].map((undef, i) => {
                                return (
                                  <img
                                    key={`rating-star-${i}`}
                                    src={`/images/star-${
                                      rating > i ? 'filled' : 'empty'
                                    }.svg`}
                                    alt="review rating star"
                                    onClick={() => this.handleRating(i + 1)}
                                  />
                                )
                              })}
                            </div>
                            <textarea
                              rows="4"
                              id="review"
                              className="form-control"
                              value={reviewText}
                              placeholder={placeholderText}
                              onChange={this.handleReviewText}
                            />
                          </div>
                          <div className="button-container">
                            <button type="submit" className="btn btn-primary">
                              {buttons[0].text}
                            </button>
                          </div>
                        </form>
                      )}
                      {!reviewable && !!buttons.length &&
                        <div className="button-container">
                          {buttons.map((b, i) => (
                            <button
                              key={`next-step-button-${i}`}
                              className="btn btn-primary"
                              onClick={this[b.functionName]}
                            >
                              {b.text}
                            </button>
                          ))}
                        </div>
                      }
                      {link && (functionName !== 'handleProblem' || isEligibleForArbitration) &&
                        <div className="link-container">
                          <a href="#" onClick={e => {
                            e.preventDefault()

                            this[link.functionName]()
                          }}>
                            {link.text}
                          </a>
                        </div>
                      }
                    </div>
                  </div>
                )}
              </div>
              <h2>
                <FormattedMessage
                  id={'purchase-detail.transactionHistoryHeading'}
                  defaultMessage={'Transaction History'}
                />
              </h2>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '200px' }}>
                      <FormattedMessage
                        id={'purchase-detail.txName'}
                        defaultMessage={'TxName'}
                      />
                    </th>
                    <th scope="col">
                      <FormattedMessage
                        id={'purchase-detail.txHash'}
                        defaultMessage={'TxHash'}
                      />
                    </th>
                    <th scope="col">
                      <FormattedMessage
                        id={'purchase-detail.from'}
                        defaultMessage={'From'}
                      />
                    </th>
                    <th scope="col">
                      <FormattedMessage
                        id={'purchase-detail.to'}
                        defaultMessage={'To'}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <TransactionEvent
                    eventName={this.props.intl.formatMessage(this.intlMessages.offerMade)}
                    transaction={offerCreated}
                    buyer={buyer}
                    seller={seller}
                  />
                  <TransactionEvent
                    eventName={this.props.intl.formatMessage(this.intlMessages.offerWithdrawn)}
                    transaction={offerWithdrawn}
                    buyer={buyer}
                    seller={seller}
                  />
                  <TransactionEvent
                    eventName={this.props.intl.formatMessage(this.intlMessages.offerAccepted)}
                    transaction={offerAccepted}
                    buyer={buyer}
                    seller={seller}
                  />
                  <TransactionEvent
                    eventName={this.props.intl.formatMessage(this.intlMessages.saleCompleted)}
                    transaction={offerFinalized}
                    buyer={buyer}
                    seller={seller}
                  />
                  <TransactionEvent
                    eventName={this.props.intl.formatMessage(this.intlMessages.saleReviewed)}
                    transaction={offerData}
                    buyer={buyer}
                    seller={seller}
                  />
                </tbody>
              </table>
              <hr />
            </div>
            <div className="col-12 col-lg-4">
              {counterpartyUser.address && (
                <UserCard
                  title={counterparty}
                  listingId={listing.id}
                  purchaseId={purchase.id}
                  userAddress={counterpartyUser.address}
                />
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-lg-8">
              {listing.id && (
                <Fragment>
                  <h2>
                    <FormattedMessage
                      id={'purchase-detail.listingDetails'}
                      defaultMessage={'Listing Details'}
                    />
                  </h2>
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
                    <h2 className="category placehold">{listing.category}</h2>
                    <h1 className="title text-truncate placehold">
                      {listing.name}
                    </h1>
                    <p className="description placehold">
                      {listing.description}
                    </p>
                    {/*!!listing.unitsRemaining && listing.unitsRemaining < 5 &&
                      <div className="units-remaining text-danger">Just {listing.unitsRemaining.toLocaleString()} left!</div>
                    */}
                    {listing.ipfsHash && (
                      <div className="link-container">
                        <a
                          href={origin.ipfsService.gatewayUrlForHash(
                            listing.ipfsHash
                          )}
                          target="_blank"
                        >
                          <FormattedMessage
                            id={'purchase-detail.viewOnIPFS'}
                            defaultMessage={'View on IPFS'}
                          />
                          <img
                            src="images/carat-blue.svg"
                            className="carat"
                            alt="right carat"
                          />
                        </a>
                      </div>
                    )}
                  </div>
                  <hr />
                </Fragment>
              )}
              <div className="reviews">
                <h2>
                  <FormattedMessage
                    id={'purchase-detail.reviewsHeading'}
                    defaultMessage={'Reviews'}
                  />
                  &nbsp;<span className="review-count">
                    {Number(reviews.length).toLocaleString()}
                  </span>
                </h2>
                {reviews.map(r =>
                  <Review key={r.id} review={r} />
                )}
                {/* To Do: pagination */}
                {/* <a href="#" className="reviews-link">Read More<img src="/images/carat-blue.svg" className="down carat" alt="down carat" /></a> */}
              </div>
            </div>
            <div className="col-12 col-lg-4">
              {soldAt && (
                <div className="summary text-center">
                  <div className="recap">
                    {perspective === 'buyer' && (
                      <FormattedMessage
                        id={'purchase-detail.purchasedFromOn'}
                        defaultMessage={'Purchased from {sellerName} on {date}'}
                        values={{
                          sellerName,
                          date: <FormattedDate value={soldAt} />
                        }}
                      />
                    )}
                    {perspective === 'seller' && (
                      <FormattedMessage
                        id={'purchase-detail.soldToOn'}
                        defaultMessage={'Sold to {buyerName} on {date}'}
                        values={{
                          buyerName,
                          date: <FormattedDate value={soldAt} />
                        }}
                      />
                    )}
                  </div>
                  <hr className="dark sm" />
                  <div className="d-flex">
                    <div className="text-left">
                      <FormattedMessage
                        id={'purchase-detail.price'}
                        defaultMessage={'Price'}
                      />
                    </div>
                    <div className="text-right">{priceEth}</div>
                  </div>
                  <hr className="dark sm" />
                  <div className={`status ${status}`}>
                    <FormattedMessage
                      id={'purchase-detail.listingStatus'}
                      defaultMessage={'This listing is {status}'}
                      values={{ status }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {processing && (
          <Modal backdrop="static" isOpen={true} tabIndex="-1">
            <div className="image-container">
              <img src="images/spinner-animation.svg" role="presentation" />
            </div>
            <FormattedMessage
              id={'purchase-detail.processingUpdate'}
              defaultMessage={'Processing your update'}
            />
            <br />
            <FormattedMessage
              id={'purchase-detail.pleaseStandBy'}
              defaultMessage={'Please stand by...'}
            />
          </Modal>
        )}
        <ConfirmationModal
          isOpen={modalsOpen.confirmation}
          onCancel={() => this.toggleModal('confirmation')}
          onSubmit={() => {
            this.toggleModal('confirmation')
            this.toggleModal('issue')
          }}
        />
        <IssueModal
          isOpen={modalsOpen.issue}
          issue={this.state.issue}
          handleChange={e => {
            e.preventDefault()

            this.setState({ issue: e.target.value })
          }}
          onCancel={() => this.toggleModal('issue')}
          onSubmit={() => {
            this.toggleModal('issue')
            this.initiateDispute()
          }}
        />
        <RejectionModal
          isOpen={modalsOpen.rejection}
          handleToggle={() => this.toggleModal('rejection')}
        />
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

const mapDispatchToProps = dispatch => ({
  updateTransaction: (confirmationCount, transactionReceipt) =>
    dispatch(updateTransaction(confirmationCount, transactionReceipt)),
  upsertTransaction: transaction => dispatch(upsertTransaction(transaction))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PurchaseDetail))
