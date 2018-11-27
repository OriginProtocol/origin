import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import {
  FormattedMessage,
  FormattedNumber,
  defineMessages,
  injectIntl
} from 'react-intl'

import { showAlert } from 'actions/Alert'
import { storeWeb3Intent } from 'actions/App'
import {
  update as updateTransaction,
  upsert as upsertTransaction
} from 'actions/Transaction'

import Modal from 'components/modal'
import Review from 'components/review'
import UserCard from 'components/user-card'

import getCurrentProvider from 'utils/getCurrentProvider'
import { translateListingCategory } from 'utils/translationUtils'

import origin from '../services/origin'

/* linking to contract Etherscan requires knowledge of which network we're on */
const etherscanDomains = {
  1: 'etherscan.io',
  3: 'ropsten.etherscan.io',
  4: 'rinkeby.etherscan.io',
  42: 'kovan.etherscan.io'
}

class ListingsDetail extends Component {
  constructor(props) {
    super(props)

    this.STEP = {
      VIEW: 1,
      METAMASK: 2,
      PROCESSING: 3,
      PURCHASED: 4,
      ERROR: 5
    }

    this.state = {
      etherscanDomain: null,
      loading: true,
      pictures: [],
      reviews: [],
      purchases: [],
      step: this.STEP.VIEW,
      currentProvider: getCurrentProvider(
        origin && origin.contractService && origin.contractService.web3
      )
    }

    this.intlMessages = defineMessages({
      loadingError: {
        id: 'listing-detail.loadingError',
        defaultMessage: 'There was an error loading this listing.'
      }
    })

    this.handleBuyClicked = this.handleBuyClicked.bind(this)
  }

  async loadListing() {
    try {
      const rawListing = await origin.marketplace.getListing(
        this.props.listingAddress
      )
      const listing = rawListing.ipfsData.data
      const translatedListing = translateListingCategory(listing)
      const obj = Object.assign({}, rawListing, translatedListing, {
        loading: false,
        status: rawListing.status
      })
      this.setState(obj)
    } catch (error) {
      this.props.showAlert(
        this.props.formatMessage(this.intlMessages.loadingError)
      )
      console.error(
        `Error fetching contract or IPFS info for listing: ${
          this.props.listingAddress
        }`
      )
      console.error(error)
    }
  }

  async loadReviews() {
    try {
      const reviews = await origin.marketplace.getListingReviews(
        this.props.listingAddress
      )
      this.setState({ reviews })
    } catch (error) {
      console.error(error)
      console.error(`Error fetching reviews`)
    }
  }

  async componentWillMount() {
    if (this.props.listingAddress) {
      // Load from IPFS
      await this.loadListing()
      await this.loadReviews()
    } else if (this.props.listingJson) {
      const obj = Object.assign({}, this.props.listingJson, { loading: false })
      // Listing json passed in directly
      this.setState(obj)
    }
    const networkId = await web3.eth.net.getId()
    this.setState({
      etherscanDomain: etherscanDomains[networkId]
    })
  }

  async handleBuyClicked() {
    this.props.storeWeb3Intent('buy this listing')

    if ((web3.givenProvider && this.props.web3Account) || origin.contractService.walletLinker) {
      const unitsToBuy = 1
      const totalPrice = unitsToBuy * this.state.price
      try {
        this.setState({ step: this.STEP.PROCESSING })
        const transactionReceipt = await origin.marketplace.makeOffer(
          this.props.listingAddress,
          { price: totalPrice },
          (confirmationCount, transactionReceipt) => {
            this.props.updateTransaction(confirmationCount, transactionReceipt)
          }
        )
        this.props.upsertTransaction({
          ...transactionReceipt,
          transactionTypeKey: 'buyListing'
        })
        this.setState({ step: this.STEP.PURCHASED })
      } catch (error) {
        console.error(error)
        this.setState({ step: this.STEP.ERROR })
      }
    }
  }

  resetToStepOne() {
    this.setState({ step: this.STEP.VIEW })
  }

  render() {
    const isActive = this.state.status === 'active'
    const buyersReviews = this.state.reviews
    const userIsSeller = this.state.seller === this.props.web3Account

    return (
      <div className="listing-detail">
        {this.state.step === this.STEP.METAMASK && (
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/spinner-animation.svg" role="presentation" />
            </div>
            <FormattedMessage
              id={'listing-detail.confirmTransaction'}
              defaultMessage={'Confirm transaction'}
            />
            <br />
            <FormattedMessage
              id={'listing-detail.pressSubmitInMetaMask'}
              defaultMessage={'Press {submit} in {currentProvider} window'}
              values={{
                currentProvider: this.state.currentProvider,
                submit: <span>&ldquo;Submit&rdquo;</span>
              }}
            />
          </Modal>
        )}
        {this.state.step === this.STEP.PROCESSING && (
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/spinner-animation.svg" role="presentation" />
            </div>
            <FormattedMessage
              id={'listing-detail.processingPurchase'}
              defaultMessage={'Processing your purchase'}
            />
            <br />
            <FormattedMessage
              id={'listing-detail.pleaseStandBy'}
              defaultMessage={'Please stand by...'}
            />
          </Modal>
        )}
        {this.state.step === this.STEP.PURCHASED && (
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/circular-check-button.svg" role="presentation" />
            </div>
            <FormattedMessage
              id={'listing-detail.purchaseSuccessful'}
              defaultMessage={'Success!'}
            />
            <div className="disclaimer">
              <FormattedMessage
                id={'listing-detail.successDisclaimer'}
                defaultMessage={
                  'Your purchase will be visible within a few seconds.'
                }
              />
            </div>
            <div className="button-container">
              <Link to="/my-purchases" className="btn btn-clear">
                <FormattedMessage
                  id={'listing-detail.goToPurchases'}
                  defaultMessage={'Go To Purchases'}
                />
              </Link>
            </div>
          </Modal>
        )}
        {this.state.step === this.STEP.ERROR && (
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/flat_cross_icon.svg" role="presentation" />
            </div>
            <FormattedMessage
              id={'listing-detail.errorPurchasingListing'}
              defaultMessage={'There was a problem purchasing this listing.'}
            />
            <br />
            <FormattedMessage
              id={'listing-detail.seeConsoleForDetails'}
              defaultMessage={'See the console for more details.'}
            />
            <div className="button-container">
              <a
                className="btn btn-clear"
                onClick={e => {
                  e.preventDefault()
                  this.resetToStepOne()
                }}
              >
                <FormattedMessage
                  id={'listing-detail.OK'}
                  defaultMessage={'OK'}
                />
              </a>
            </div>
          </Modal>
        )}
        {(this.state.loading ||
          (this.state.pictures && !!this.state.pictures.length)) && (
          <div className="carousel">
            {this.state.pictures.map(pictureUrl => (
              <div className="photo" key={pictureUrl}>
                <img src={pictureUrl} role="presentation" />
              </div>
            ))}
          </div>
        )}

        <div
          className={`container listing-container${
            this.state.loading ? ' loading' : ''
          }`}
        >
          <div className="row">
            <div className="col-12 col-md-8 detail-info-box">
              <div className="category placehold">{this.state.category}</div>
              <h1 className="title text-truncate placehold">
                {this.state.name}
              </h1>
              <p className="description placehold">{this.state.description}</p>
              {/* Via Stan 5/25/2018: Hide until contracts allow for unitsAvailable > 1 */}
              {/*!!unitsAvailable && unitsAvailable < 5 &&
                <div className="units-available text-danger">
                  <FormattedMessage
                    id={ 'listing-detail.unitsAvailable' }
                    defaultMessage={ 'Just {unitsAvailable} left!' }
                    values={{ unitsAvailable: <FormattedNumber value={ this.state.unitsAvailable } /> }}
                  />
                </div>
              */}
              {this.state.ipfsHash && (
                <div className="ipfs link-container">
                  <a
                    href={origin.ipfsService.gatewayUrlForHash(
                      this.state.ipfsHash
                    )}
                    target="_blank"
                  >
                    <FormattedMessage
                      id={'listing-detail.viewOnIpfs'}
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
              <div className="debug">
                <li>
                  <FormattedMessage
                    id={'listing-detail.IPFS'}
                    defaultMessage={'IPFS: {ipfsHash}'}
                    values={{ ipfsHash: this.state.ipfsHash }}
                  />
                </li>
                <li>
                  <FormattedMessage
                    id={'listing-detail.seller'}
                    defaultMessage={'Seller: {sellerAddress}'}
                    values={{ sellerAddress: this.state.seller }}
                  />
                </li>
                <li>
                  <FormattedMessage
                    id={'listing-detail.IPFS'}
                    defaultMessage={'IPFS: {ipfsHash}'}
                    values={{ ipfsHash: this.state.ipfsHash }}
                  />
                </li>
              </div>
            </div>
            <div className="col-12 col-md-4">
              {!!this.state.price &&
                !!parseFloat(this.state.price) && (
                <div className="buy-box placehold">
                  <div className="price d-flex justify-content-between">
                    <div>
                      <FormattedMessage
                        id={'listing-detail.price'}
                        defaultMessage={'Price'}
                      />
                    </div>
                    <div className="text-right">
                      {Number(this.state.price).toLocaleString(undefined, {
                        maximumFractionDigits: 5,
                        minimumFractionDigits: 5
                      })}
                        &nbsp;
                      <FormattedMessage
                        id={'listing-detail.ethereumCurrencyAbbrev'}
                        defaultMessage={'ETH'}
                      />
                    </div>
                  </div>
                  {/* Via Matt 4/5/2018: Hold off on allowing buyers to select quantity > 1 */}
                  {/* <div className="quantity d-flex justify-content-between">
                                    <div>Quantity</div>
                                    <div className="text-right">
                                      {Number(1).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="total-price d-flex justify-content-between">
                                    <div>Total Price</div>
                                    <div className="price text-right">
                                      {Number(price).toLocaleString(undefined, {minimumFractionDigits: 5, maximumFractionDigits: 5})} ETH
                                    </div>
                                  </div> */}
                  {!this.state.loading && (
                    <div className="btn-container">
                      {isActive &&
                          !userIsSeller && (
                        <button
                          className="btn btn-primary"
                          onClick={this.handleBuyClicked}
                          // disabled={!this.state.address}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <FormattedMessage
                            id={'listing-detail.buyNow'}
                            defaultMessage={'Buy Now'}
                          />
                        </button>
                      )}
                      {isActive &&
                          userIsSeller && (
                        <Link to="/my-listings" className="btn">
                              My Listings
                        </Link>
                      )}
                      {!isActive && (
                        <div className="sold-banner">
                          <img
                            src="images/sold-tag.svg"
                            role="presentation"
                          />
                          <FormattedMessage
                            id={'listing-detail.soldOut'}
                            defaultMessage={'Sold Out'}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {this.state.seller && (
                <UserCard
                  title="seller"
                  listingAddress={this.props.listingAddress}
                  userAddress={this.state.seller}
                />
              )}
            </div>
          </div>
          {this.props.withReviews && (
            <div className="row">
              <div className="col-12 col-md-8">
                <hr />
                <div className="reviews">
                  <h2>
                    <FormattedMessage
                      id={'listing-detail.reviews'}
                      defaultMessage={'Reviews'}
                    />
                    &nbsp;
                    <span className="review-count">
                      <FormattedNumber value={buyersReviews.length} />
                    </span>
                  </h2>
                  {buyersReviews.map(r => (
                    <Review key={r.transactionHash} review={r} />
                  ))}
                  {/* To Do: pagination */}
                  {/* <a href="#" className="reviews-link">Read More<img src="/images/carat-blue.svg" className="down carat" alt="down carat" /></a> */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    onMobile: state.app.onMobile,
    web3Account: state.app.web3.account,
    web3Intent: state.app.web3.intent
  }
}

const mapDispatchToProps = dispatch => ({
  showAlert: msg => dispatch(showAlert(msg)),
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent)),
  updateTransaction: (confirmationCount, transactionReceipt) =>
    dispatch(updateTransaction(confirmationCount, transactionReceipt)),
  upsertTransaction: transaction => dispatch(upsertTransaction(transaction))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ListingsDetail))
