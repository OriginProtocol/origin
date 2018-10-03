import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import $ from 'jquery'

import { enableMessaging, storeWeb3Intent } from 'actions/App'
import {
  update as updateTransaction,
  upsert as upsertTransaction
} from 'actions/Transaction'

import {
  ConfirmationModal,
  IssueModal,
  PrerequisiteModal
} from 'components/modals/arbitration-modals'
import Avatar from 'components/avatar'
import {
  BuyerBadge,
  PendingBadge,
  SellerBadge,
  SoldBadge
} from 'components/badges'
import { RejectionModal, WithdrawModal } from 'components/modals/offer-modals'
import { ProviderModal } from 'components/modals/wait-modals'
import OfferStatusEvent from 'components/offer-status-event'
import PurchaseProgress from 'components/purchase-progress'
import Reviews from 'components/reviews'
import TransactionHistory from 'components/transaction-history'
import UnnamedUser from 'components/unnamed-user'
import UserCard from 'components/user-card'

import { getListing, camelCaseToDash } from 'utils/listing'
import {
  offerStatusToListingAvailability,
  offerStatusToStep
} from 'utils/offer'
import { translateSchema } from 'utils/translationUtils'

import origin from '../services/origin'

const ARBITRATOR_ACCOUNT = process.env.ARBITRATOR_ACCOUNT

const defaultState = {
  buyer: {},
  form: {
    invalid: false,
    rating: 0,
    reviewText: ''
  },
  issue: '',
  listing: {},
  modalsOpen: {
    confirmation: false,
    issue: false,
    rejection: false,
    withdraw: false
  },
  problemInferred: false,
  processing: false,
  purchase: {},
  seller: {},
  areSellerStepsOpen: true
}

class PurchaseDetail extends Component {
  constructor(props) {
    super(props)

    this.acceptOffer = this.acceptOffer.bind(this)
    this.completePurchase = this.completePurchase.bind(this)
    this.handleProblem = this.handleProblem.bind(this)
    this.handleRating = this.handleRating.bind(this)
    this.handleReviewText = this.handleReviewText.bind(this)
    this.handleWithdraw = this.handleWithdraw.bind(this)
    this.initiateDispute = this.initiateDispute.bind(this)
    this.loadPurchase = this.loadPurchase.bind(this)
    this.rejectOffer = this.rejectOffer.bind(this)
    this.reviewSale = this.reviewSale.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
    this.withdrawOffer = this.withdrawOffer.bind(this)
    this.getListingSchema = this.getListingSchema.bind(this)
    this.handleEnableMessaging = this.handleEnableMessaging.bind(this)
    this.handleCancelPrerequisite = this.handleCancelPrerequisite.bind(this)
    this.state = defaultState

    this.intlMessages = defineMessages({
      awaitApproval: {
        id: 'purchase-detail.awaitApproval',
        defaultMessage: 'Wait for the seller to approve or reject your offer'
      },
      awaitApprovalInstruction: {
        id: 'purchase-detail.awaitApprovalInstruction',
        defaultMessage:
          'Your payment is currently in escrow. There is nothing for you to do at this time. Check back later.'
      },
      acceptBuyersOffer: {
        id: 'purchase-detail.acceptOrRejectOffer',
        defaultMessage: `Accept or reject the buyer's offer`
      },
      acceptOfferInstruction: {
        id: 'purchase-detail.acceptOfferInstruction',
        defaultMessage:
          'Your listing has a pending offer. Other buyers cannot make offers until you accept or reject this one.'
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
        defaultMessage: 'Complete sale and leave a review.'
      },
      submitThisForm: {
        id: 'purchase-detail.submitThisForm',
        defaultMessage: `Release funds and review the seller once you confirm that the sale is complete. Your escrowed payment will be sent to the seller. If you're unhappy, please report a problem instead.`
      },
      confirmAndReview: {
        id: 'purchase-detail.confirmAndReview',
        defaultMessage: 'Complete Sale'
      },
      buyerReviewPlaceholder: {
        id: 'purchase-detail.buyerReviewPlaceholder',
        defaultMessage:
          'Your review should let others know about your experience transacting with this seller.'
      },
      waitForBuyer: {
        id: 'purchase-detail.waitForBuyer',
        defaultMessage:
          'Fulfill this order and wait for the buyer to complete the sale'
      },
      fulfillObligation: {
        id: 'purchase-detail.fulfillObligation',
        defaultMessage:
          'The buyer is waiting for you to fulfill this order. You will get paid when the buyer completes the sale.'
      },
      awaitSellerReview: {
        id: 'purchase-detail.awaitSellerReview',
        defaultMessage: 'Wait for the seller to leave a review'
      },
      completeByReviewing: {
        id: 'purchase-detail.completeByReviewing',
        defaultMessage: 'Leave a review of the buyer'
      },
      clickToReview: {
        id: 'purchase-detail.clickToReview',
        defaultMessage:
          'Leaving a review lets other sellers know about your experience with this buyer.'
      },
      reviewSale: {
        id: 'purchase-detail.reviewSale',
        defaultMessage: 'Leave A Review'
      },
      rejectOffer: {
        id: 'purchase-detail.rejectOffer',
        defaultMessage: 'Reject'
      },
      reportProblem: {
        id: 'purchase-detail.reportProblem',
        defaultMessage: 'Report A Problem'
      },
      sellerReviewPlaceholder: {
        id: 'purchase-detail.sellerReviewPlaceholder',
        defaultMessage:
          'Your review should inform others about your experience transacting with this buyer.'
      },
      withdrawOffer: {
        id: 'purchase-detail.withdrawOffer',
        defaultMessage: 'Withdraw Offer'
      }
    })

    this.nextSteps = {
      created: {
        buyer: {
          prompt: this.props.intl.formatMessage(
            this.intlMessages.awaitApproval
          ),
          instruction: this.props.intl.formatMessage(
            this.intlMessages.awaitApprovalInstruction
          ),
          buttons: [],
          link: {
            functionName: 'handleWithdraw',
            text: this.props.intl.formatMessage(this.intlMessages.withdrawOffer)
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
              functionName: 'acceptOffer',
              text: this.props.intl.formatMessage(this.intlMessages.acceptOffer)
            }
          ],
          link: {
            functionName: 'rejectOffer',
            text: this.props.intl.formatMessage(this.intlMessages.rejectOffer)
          }
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
            text: this.props.intl.formatMessage(this.intlMessages.reportProblem)
          },
          reviewable: true
        },
        seller: {
          prompt: this.props.intl.formatMessage(this.intlMessages.waitForBuyer),
          instruction: this.props.intl.formatMessage(
            this.intlMessages.fulfillObligation
          ),
          buttons: [],
          link: {
            functionName: 'handleProblem',
            text: this.props.intl.formatMessage(this.intlMessages.reportProblem)
          },
          showSellerSteps: true
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
              text: this.props.intl.formatMessage(this.intlMessages.reviewSale)
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
      this.setState({
        listing,
        purchase
      })
      if (listing) {
        this.getListingSchema()
      }
      await this.loadSeller(listing.seller)
      await this.loadBuyer(purchase.buyer)
    } catch (error) {
      console.error(`Error loading purchase ${offerId}`)
      console.error(error)
    }
  }

  getListingSchema() {
    const schemaType = camelCaseToDash(
      this.state.listing.schemaType.replace('schema.', '')
    )

    fetch(`schemas/${schemaType}.json`)
      .then(response => response.json())
      .then(schemaJson => {
        const translatedSchema = translateSchema(schemaJson, schemaType)
        this.setState({
          translatedSchema
        })
      })
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

    if (rating < 1) {
      return this.setState(prevState => {
        return { form: { ...prevState.form, invalid: true } }
      })
    }

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
    this.withdrawOffer(() => this.toggleModal('rejection'))
  }

  handleWithdraw() {
    this.toggleModal('withdraw')
  }

  async withdrawOffer(onSuccess) {
    const { offerId } = this.props
    const { purchase, listing } = this.state
    const offer = purchase

    try {
      this.setState({ processing: true })

      const transactionReceipt = await origin.marketplace.withdrawOffer(
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
        transactionTypeKey: 'withdrawOffer',
        offer,
        listing
      })

      onSuccess && onSuccess()

      this.setState({ processing: false })
    } catch (error) {
      this.setState({ processing: false })

      console.error('Error accepting offer')
      console.error(error)
    }
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
    // undo inference if it exists
    if (this.state.problemInferred) {
      this.setState({
        problemInferred: false
      })
    }

    this.toggleModal('confirmation')
  }

  // rating: 1 <= integer <= 5
  handleRating(rating) {
    this.setState(prevState => {
      return { form: { ...prevState.form, invalid: false, rating } }
    })

    // anticipate the need for a dispute per Josh
    if (rating < 3) {
      this.setState({ problemInferred: true })

      this.toggleModal('confirmation')
    }
  }

  handleReviewText(e) {
    const { value } = e.target

    this.setState(prevState => {
      return { form: { ...prevState.form, reviewText: value } }
    })
  }

  async initiateDispute() {
    const { web3Account } = this.props
    const { issue, listing, purchase } = this.state

    try {
      this.setState({ processing: true })

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

      const counterpartyAddress =
        web3Account === purchase.buyer ? listing.seller : purchase.buyer
      const roomId = origin.messaging.generateRoomId(
        web3Account,
        counterpartyAddress
      )
      const keys = origin.messaging.getSharedKeys(roomId)

      // disclose shared decryption key with arbitrator if one exists
      if (keys.length) {
        await origin.messaging.sendConvMessage(ARBITRATOR_ACCOUNT, {
          decryption: { keys, roomId }
        })
      }

      // send a message to arbitrator if form is not blank
      issue.length &&
        origin.messaging.sendConvMessage(ARBITRATOR_ACCOUNT, {
          content: issue
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

  handleEnableMessaging() {
    const { enableMessaging, intl, storeWeb3Intent, web3Account } = this.props

    if (web3Account) {
      enableMessaging()
    } else {
      storeWeb3Intent(intl.formatMessage(this.intlMessages.enableMessaging))
    }

    // TODO:John - if possible, modify startConversing() method to accept a confirmation callback
    // or returna promise so we don't have to do this janky interval
    this.enableMessagingInterval = setInterval(() => {
      if (origin.messaging.canSendMessages()) {
        this.toggleModal('prerequisite')
        this.toggleModal('issue')

        clearInterval(this.enableMessagingInterval)
      }
    }, 1000)
  }

  handleCancelPrerequisite() {
    this.toggleModal('prerequisite')
    if (this.enableMessagingInterval) {
      clearInterval(this.enableMessagingInterval)
    }
  }

  render() {
    const { messagingEnabled, web3Account } = this.props
    const {
      buyer,
      form,
      listing,
      modalsOpen,
      problemInferred,
      processing,
      purchase,
      seller,
      translatedSchema,
      areSellerStepsOpen
    } = this.state
    const availability = offerStatusToListingAvailability(purchase.status)
    const isPending = availability === 'pending'
    const isSold = availability === 'sold'
    const { invalid, rating, reviewText } = form

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
    const created = purchase.createdAt * 1000 // convert seconds since epoch to ms

    const offerWithdrawn = purchase.event('OfferWithdrawn')
    const offerDisputed = purchase.event('OfferDisputed')
    const offerFinalized = purchase.event('OfferFinalized')

    const priceEth = `${Number(purchase.totalPrice.amount).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 5,
        maximumFractionDigits: 5
      }
    )} ETH`

    const counterparty = ['buyer', 'seller'].find(str => str !== perspective)
    const counterpartyUser = counterparty === 'buyer' ? buyer : seller
    const step = offerStatusToStep(purchase.status)
    const maxStep = perspective === 'seller' || offerDisputed ? 4 : 3

    const nextStep = perspective && this.nextSteps[purchase.status]
    const {
      buttons,
      instruction,
      link,
      placeholderText,
      prompt,
      reviewable,
      showSellerSteps
    } = nextStep ? nextStep[perspective] : { buttons: [] }

    const buyerName = buyer.profile ? (
      `${buyer.profile.firstName} ${buyer.profile.lastName}`
    ) : (
      <UnnamedUser />
    )
    const sellerName = seller.profile ? (
      `${seller.profile.firstName} ${seller.profile.lastName}`
    ) : (
      <UnnamedUser />
    )
    const arbitrationIsAvailable =
      ARBITRATOR_ACCOUNT && web3Account !== ARBITRATOR_ACCOUNT

    return (
      <div className="purchase-detail">
        <div className="container">
          <div className="row">
            <div className="col-12">
              {offerFinalized && (
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
              )}
              {!offerFinalized &&
                !offerWithdrawn && (
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
              )}
              <h1>
                {listing.name}
                {isPending && <PendingBadge />}
                {isSold && <SoldBadge />}
                {/*!!listing.boostValue && (
                  <span className={`boosted badge boost-${listing.boostLevel}`}>
                    <img
                      src="images/boost-icon-arrow.svg"
                      role="presentation"
                    />
                  </span>
                )*/}
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
                          <SellerBadge />
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
                          <BuyerBadge />
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
                    <div
                      className={`guidance text-center${
                        showSellerSteps && areSellerStepsOpen
                          ? ' with-seller-steps'
                          : ''
                      }`}
                    >
                      <div className="triangles d-flex justify-content-between">
                        {[...Array(maxStep)].map((undef, i) => {
                          const count = i + 1
                          const visible =
                            step === count /* matched */ ||
                            (step === 0 &&
                              !i) /* unknown, fallback to beginning */ ||
                            (step > maxStep &&
                              count === maxStep) /* include end if passed */
                          return (
                            <div
                              key={`triangle-pair-${count}`}
                              className={`triangle-pair${
                                visible ? '' : ' hidden'
                              }`}
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
                      {reviewable &&
                        instruction && (
                        <div className="instruction">{instruction}</div>
                      )}
                      {!reviewable && (
                        <div className="instruction">
                          {instruction || (
                            <FormattedMessage
                              id={'purchase-detail.nothingToDo'}
                              defaultMessage={
                                'There is nothing for you to do at this time. Check back later.'
                              }
                            />
                          )}
                        </div>
                      )}
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
                            {invalid && (
                              <div className="invalid-feedback d-block">
                                <FormattedMessage
                                  id={'purchase-detail.reviewError'}
                                  defaultMessage={
                                    'Select a rating of 1-5 stars.'
                                  }
                                />
                              </div>
                            )}
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
                      {!reviewable &&
                        !!buttons.length && (
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
                      )}
                      {showSellerSteps && (
                        <div className="seller-steps">
                          <div className="toggle-container">
                            <p
                              className="toggle-btn"
                              onClick={() =>
                                this.setState({
                                  areSellerStepsOpen: !areSellerStepsOpen
                                })
                              }
                            >
                              {areSellerStepsOpen ? (
                                <FormattedMessage
                                  id={'purchase-detail.hideSellerSteps'}
                                  defaultMessage={'Hide Fulfillment Checklist'}
                                />
                              ) : (
                                <FormattedMessage
                                  id={'purchase-detail.showSellerSteps'}
                                  defaultMessage={'Show Fulfillment Checklist'}
                                />
                              )}
                            </p>
                          </div>
                          {areSellerStepsOpen && (
                            <div className="list-container text-left">
                              <p className="text-center">
                                <FormattedMessage
                                  id={'purchase-detail.fulfillmentChecklist'}
                                  defaultMessage={'Fulfillment Checklist'}
                                />
                              </p>
                              <ol>
                                {translatedSchema &&
                                  translatedSchema.properties &&
                                  translatedSchema.properties.sellerSteps &&
                                  translatedSchema.properties.sellerSteps
                                    .enumNames &&
                                  translatedSchema.properties.sellerSteps.enumNames.map(
                                    step => <li key={step}>{step}</li>
                                  )}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                      {link &&
                        (arbitrationIsAvailable ||
                          link.functionName !== 'handleProblem') && (
                        <div className="link-container">
                          <a
                            href="#"
                            onClick={e => {
                              e.preventDefault()

                              this[link.functionName]()
                            }}
                          >
                            {link.text}
                          </a>
                        </div>
                      )}
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
              <TransactionHistory purchase={purchase} />
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
                    <h1 className="title placehold">
                      {listing.name}
                    </h1>
                    <p className="ws-aware description placehold">
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
                  <Reviews userAddress={listing.seller} />
                </Fragment>
              )}
            </div>
            <div className="col-12 col-lg-4">
              {created && (
                <div className="summary text-center">
                  <h2>
                    {isPending && (
                      <FormattedMessage
                        id={'purchase-detail.summaryPending'}
                        defaultMessage={'Pending'}
                      />
                    )}
                    {isSold && (
                      <FormattedMessage
                        id={'purchase-detail.summarySold'}
                        defaultMessage={'Sold'}
                      />
                    )}
                  </h2>
                  <div className="recap m-auto">
                    <OfferStatusEvent offer={purchase} />
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
                </div>
              )}
            </div>
          </div>
        </div>
        {processing && <ProviderModal />}
        <ConfirmationModal
          isOpen={modalsOpen.confirmation}
          inferred={problemInferred}
          onCancel={() => this.toggleModal('confirmation')}
          onSubmit={() => {
            this.toggleModal('confirmation')

            if (messagingEnabled) {
              this.toggleModal('issue')
            } else {
              this.toggleModal('prerequisite')
            }
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
        <PrerequisiteModal
          isOpen={modalsOpen.prerequisite}
          perspective={perspective}
          onCancel={this.handleCancelPrerequisite}
          onSubmit={this.handleEnableMessaging}
        />
        <RejectionModal
          isOpen={modalsOpen.rejection}
          handleToggle={() => this.toggleModal('rejection')}
        />
        <WithdrawModal
          isOpen={modalsOpen.withdraw}
          onCancel={() => this.toggleModal('withdraw')}
          onSubmit={() => {
            this.toggleModal('withdraw')
            this.withdrawOffer()
          }}
        />
      </div>
    )
  }
}

const mapStateToProps = ({ app }) => {
  const { messagingEnabled, web3 } = app
  const web3Account = web3.account
  return {
    web3Account: web3Account,
    messagingEnabled
  }
}

const mapDispatchToProps = dispatch => ({
  updateTransaction: (confirmationCount, transactionReceipt) =>
    dispatch(updateTransaction(confirmationCount, transactionReceipt)),
  upsertTransaction: transaction => dispatch(upsertTransaction(transaction)),
  enableMessaging: () => dispatch(enableMessaging()),
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PurchaseDetail))
