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
      ),
      // TODO:John - wire up boost level & boost amount to actual data
      boostLevel: 'Medium',
      boostAmount: 10
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
        this.props.listingId
      )
      const listing = rawListing.ipfsData.data
      const translatedListing = translateListingCategory(listing)

      this.setState({
        ...rawListing,
        ...translatedListing,
        loading: false
      })
    } catch (error) {
      this.props.showAlert(
        this.props.formatMessage(this.intlMessages.loadingError)
      )
      console.error(
        `Error fetching contract or IPFS info for listing: ${
          this.props.listingId
        }`
      )
      console.error(error)
    }
  }

  async loadReviews() {
    try {
      const reviews = await origin.marketplace.getListingReviews(
        this.props.listingId
      )
      this.setState({ reviews })
    } catch (error) {
      console.error(error)
      console.error(`Error fetching reviews`)
    }
  }

  async componentWillMount() {
    if (this.props.listingId) {
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

    if (web3.givenProvider && this.props.web3Account) {
      this.setState({ step: this.STEP.METAMASK })
      const unitsToBuy = 1
      const totalPrice = unitsToBuy * this.state.price
      try {
        this.setState({ step: this.STEP.PROCESSING })
        const transactionReceipt = await origin.marketplace.makeOffer(
          this.props.listingId,
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
    const { boostLevel, boostAmount, category, currentProvider, description, ipfsHash, loading, name, pictures, price, reviews, seller, step, unitsAvailable } = this.state
    const isActive = !!unitsAvailable
    const userIsSeller = seller === this.props.web3Account

    return (
      <div className="listing-detail">
        {step === this.STEP.METAMASK && (
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
                currentProvider,
                submit: <span>&ldquo;Submit&rdquo;</span>
              }}
            />
          </Modal>
        )}
        {step === this.STEP.PROCESSING && (
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
        {step === this.STEP.PURCHASED && (
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
        {step === this.STEP.ERROR && (
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
        {(loading ||
          (pictures && !!pictures.length)) && (
          <div className="carousel">
            {pictures.map(pictureUrl => (
              <div className="photo" key={pictureUrl}>
                <img src={pictureUrl} role="presentation" />
              </div>
            ))}
          </div>
        )}

        <div className={`container listing-container${loading ? ' loading' : ''}`}>
          <div className="row">
            <div className="col-12 col-md-8 detail-info-box">
              <div className="category placehold d-flex">
                <div>{category}</div>
                {!loading && boostLevel &&
                  <span className={ `boosted badge boost-${boostLevel}` }>
                    <span>&#x2197;</span>
                    { boostLevel }
                  </span>
                }
              </div>
              <h1 className="title text-truncate placehold">
                {name}
              </h1>
              <p className="description placehold">{description}</p>
              {/* Via Stan 5/25/2018: Hide until contracts allow for unitsAvailable > 1 */}
              {/*!!unitsAvailable && unitsAvailable < 5 &&
                <div className="units-available text-danger">
                  <FormattedMessage
                    id={ 'listing-detail.unitsAvailable' }
                    defaultMessage={ 'Just {unitsAvailable} left!' }
                    values={{ unitsAvailable: <FormattedNumber value={ unitsAvailable } /> }}
                  />
                </div>
              */}
              {ipfsHash && (
                <div className="ipfs link-container">
                  <a
                    href={origin.ipfsService.gatewayUrlForHash(ipfsHash)}
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
                    values={{ ipfsHash }}
                  />
                </li>
                <li>
                  <FormattedMessage
                    id={'listing-detail.seller'}
                    defaultMessage={'Seller: {sellerAddress}'}
                    values={{ sellerAddress: seller }}
                  />
                </li>
                <li>
                  <FormattedMessage
                    id={'listing-detail.IPFS'}
                    defaultMessage={'IPFS: {ipfsHash}'}
                    values={{ ipfsHash }}
                  />
                </li>
              </div>
            </div>
            <div className="col-12 col-md-4">
              {!!price &&
                !!parseFloat(price) && (
                <div className="buy-box placehold">
                  <div className="price">
                    <img src="images/eth-icon.svg" role="presentation" />
                    {Number(price).toLocaleString(undefined, {
                      maximumFractionDigits: 5,
                      minimumFractionDigits: 5
                    })}
                      &nbsp;
                    <FormattedMessage
                      id={'listing-detail.ethereumCurrencyAbbrev'}
                      defaultMessage={'ETH'}
                    />
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
                  {!loading && (
                    <div className="btn-container">
                      {isActive &&
                          !userIsSeller && (
                        <button
                          className="btn btn-primary"
                          onClick={this.handleBuyClicked}
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
                      {!isActive &&
                        <span className="sold badge">
                          <FormattedMessage
                            id={'listing-detail.soldOut'}
                            defaultMessage={'Sold Out'}
                          />
                        </span>
                      }
                    </div>
                  )}
                  {boostLevel &&
                    <div className="boost-level">
                      <hr/>
                      <div className="row">
                        <div className="col-sm-6">
                          <p>Boost Level</p>
                          <a href="#" target="_blank" rel="noopener noreferrer">What is this?</a>
                        </div>
                        <div className="col-sm-6 text-right">
                          <p>{ boostLevel }</p>
                          <p>
                            <img src="images/ogn-icon.svg" role="presentation" />
                            <span className="font-bold">{ boostAmount }</span>&nbsp;
                            <span className="font-blue font-bold">OGN</span>
                            <p className="help-block">1.00 USD</p>
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              )}
              {seller &&
                <UserCard
                  title="seller"
                  listingId={this.props.listingId}
                  userAddress={seller}
                />
              }
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
                      <FormattedNumber value={reviews.length} />
                    </span>
                  </h2>
                  {reviews.map(r => (
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
