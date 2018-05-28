import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { showAlert } from '../actions/Alert'
import { storeWeb3Intent } from '../actions/App'

import Modal from './modal'
import Review from './review'
import UserCard from './user-card'

// temporary - we should be getting an origin instance from our app,
// not using a global singleton
import origin from '../services/origin'

/* linking to contract Etherscan requires knowledge of which network we're on */
const etherscanDomains = {
  1: 'etherscan.io',
  3: 'ropsten.etherscan.io',
  4: 'rinkeby.etherscan.io',
  42: 'kovan.etherscan.io',
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
    }

    this.handleBuyClicked = this.handleBuyClicked.bind(this)
  }

  async componentWillMount() {
    if (this.props.listingAddress) {
      // Load from IPFS
      await this.loadListing()
      await this.loadPurchases()
      this.loadReviews()
    }
    else if (this.props.listingJson) {
      const obj = Object.assign({}, this.props.listingJson, { loading: false })
      // Listing json passed in directly
      this.setState(obj)
    }
  }

  async loadListing() {
    try {
      const listing = await origin.listings.get(this.props.listingAddress)
      const obj = Object.assign({}, listing, { loading: false })
      this.setState(obj)
    } catch (error) {
      this.props.showAlert('There was an error loading this listing.')
      console.error(`Error fetching contract or IPFS info for listing: ${this.props.listingAddress}`)
      console.error(error)
    }
  }

  async loadPurchases() {
    const { listingAddress } = this.props

    try {
      const length = await origin.listings.purchasesLength(listingAddress)
      console.log('Purchase count:', length)

      for (let i = 0; i < length; i++) {
        let purchaseAddress = await origin.listings.purchaseAddressByIndex(listingAddress, i)
        let purchase = await origin.purchases.get(purchaseAddress)
        console.log('Purchase:', purchase)

        this.setState((prevState) => {
          return { purchases: [...prevState.purchases, purchase] }
        })
      }
    } catch(error) {
      console.error(`Error fetching purchases for listing: ${listingAddress}`)
      console.error(error)
    }
  }

  async loadReviews() {
    const { purchases } = this.state

    try {
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

  async componentWillMount() {
    if (this.props.listingAddress) {
      // Load from IPFS
      await this.loadListing()
      await this.loadPurchases()
      this.loadReviews()
    }
    else if (this.props.listingJson) {
      const obj = Object.assign({}, this.props.listingJson, { loading: false })
      // Listing json passed in directly
      this.setState(obj)
    }
    const networkId = await web3.eth.net.getId()
    this.setState({
      etherscanDomain: etherscanDomains[networkId],
    })
  }

  async handleBuyClicked() {
    this.props.storeWeb3Intent('buy this listing')

    if (web3.givenProvider && this.props.web3Account) {
      const unitsToBuy = 1
      const totalPrice = (unitsToBuy * this.state.price)
      this.setState({step: this.STEP.METAMASK})
      try {
        const transactionReceipt = await origin.listings.buy(this.state.address, unitsToBuy, totalPrice)
        console.log('Purchase request sent.')
        this.setState({step: this.STEP.PROCESSING})
        await origin.contractService.waitTransactionFinished(transactionReceipt.transactionHash)
        this.setState({step: this.STEP.PURCHASED})
      } catch (error) {
        window.err = error
        console.error(error)
        this.setState({step: this.STEP.ERROR})
      }
    }
  }

  resetToStepOne() {
    this.setState({step: this.STEP.VIEW})
  }

  render() {
    const unitsAvailable = parseInt(this.state.unitsAvailable) // convert string to integer
    const buyersReviews = this.state.reviews.filter(r => r.revieweeRole === 'SELLER')
    const userIsSeller = this.state.sellerAddress === this.props.web3Account

    return (
      <div className="listing-detail">
        {this.state.step === this.STEP.METAMASK &&
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/spinner-animation.svg" role="presentation"/>
            </div>
            Confirm transaction<br />
            Press &ldquo;Submit&rdquo; in MetaMask window
          </Modal>
        }
        {this.state.step === this.STEP.PROCESSING &&
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/spinner-animation.svg" role="presentation"/>
            </div>
            Processing your purchase<br />
            Please stand by...
          </Modal>
        }
        {this.state.step === this.STEP.PURCHASED &&
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/circular-check-button.svg" role="presentation"/>
            </div>
            Purchase was successful.
            <div className="button-container">
              <Link to="/my-purchases" className="btn btn-clear">
                Go To Purchases
              </Link>
            </div>
          </Modal>
        }
        {this.state.step === this.STEP.ERROR && (
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/flat_cross_icon.svg" role="presentation" />
            </div>
            There was a problem purchasing this listing.<br />See the console for more details.
            <div className="button-container">
              <a
                className="btn btn-clear"
                onClick={e => {
                  e.preventDefault()
                  this.resetToStepOne()
                }}
              >
                OK
              </a>
            </div>
          </Modal>
        )}
        {(this.state.loading || (this.state.pictures && !!this.state.pictures.length)) &&
          <div className="carousel">
            {this.state.pictures.map(pictureUrl => (
              <div className="photo" key={pictureUrl}>
                {(new URL(pictureUrl).protocol === "data:") &&
                  <img src={pictureUrl} role='presentation' />
                }
              </div>
            ))}
          </div>
        }

        <div className={`container listing-container${this.state.loading ? ' loading' : ''}`}>
          <div className="row">
            <div className="col-12 col-md-8 detail-info-box">
              <div className="category placehold">{this.state.category}</div>
              <h1 className="title text-truncate placehold">{this.state.name}</h1>
              <p className="description placehold">{this.state.description}</p>
              {/* Via Stan 5/25/2018: Hide until contracts allow for unitsAvailable > 1 */}
              {/*!!unitsAvailable && unitsAvailable < 5 &&
                <div className="units-available text-danger">Just {unitsAvailable.toLocaleString()} left!</div>
              */}
              {this.state.ipfsHash &&
                <div className="ipfs link-container">
                  <a href={origin.ipfsService.gatewayUrlForHash(this.state.ipfsHash)} target="_blank">
                    View on IPFS<img src="images/carat-blue.svg" className="carat" alt="right carat" />
                  </a>
                </div>
              }
              {/* Remove per Matt 5/28/2018 */}
              {/* this.state.address && this.state.etherscanDomain &&
                <div className="etherscan link-container">
                  <a href={`https://${(this.state.etherscanDomain)}/address/${(this.state.address)}#internaltx`} target="_blank">
                    View on Etherscan<img src="images/carat-blue.svg" className="carat" alt="right carat" />
                  </a>
                </div>
              */}
              <div className="debug">
                <li>IPFS: {this.state.ipfsHash}</li>
                <li>Seller: {this.state.sellerAddress}</li>
                <li>Units: {unitsAvailable}</li>
              </div>
              {/* Hidden for current deployment */}
              {/*!this.state.loading && this.state.purchases.length > 0 &&
                <Fragment>
                  <hr />
                  <h2>Purchases</h2>
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: '200px' }}>Status</th>
                        <th scope="col">TxHash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.purchases.map(({ address, stage }) =>
                        <tr key={address}>
                          <td>{stage.replace("_"," ")}</td>
                          <td className="text-truncate"><Link to={`/purchases/${address}`}>{address}</Link></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Fragment>
              */}
            </div>
            <div className="col-12 col-md-4">
              {!!this.state.price && !!parseFloat(this.state.price) &&
                <div className="buy-box placehold">
                  <div className="price d-flex justify-content-between">
                    <div>Price</div>
                    <div className="text-right">
                      {Number(this.state.price).toLocaleString(undefined, {minimumFractionDigits: 3})} ETH
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
                                      {Number(price).toLocaleString(undefined, {minimumFractionDigits: 3})} ETH
                                    </div>
                                  </div> */}
                  {!this.state.loading && this.state.address &&
                    <div className="btn-container">
                      {!!unitsAvailable && !userIsSeller &&
                        <button
                          className="btn btn-primary"
                          onClick={this.handleBuyClicked}
                          disabled={!this.state.address}
                          onMouseDown={e => e.preventDefault()}
                        >
                          Buy Now
                        </button>
                      }
                      {!!unitsAvailable && userIsSeller &&
                        <Link to="/my-listings" className="btn">My Listings</Link>
                      }
                      {!unitsAvailable &&
                        <div className="sold-banner">
                          <img src="images/sold-tag.svg" role="presentation" />
                          Sold Out
                        </div>
                      }
                    </div>
                  }
                </div>
              }
              {this.state.sellerAddress && <UserCard title="seller" userAddress={this.state.sellerAddress} />}
            </div>
          </div>
          {this.props.withReviews &&
            <div className="row">
              <div className="col-12 col-md-8">
                <hr />
                <div className="reviews">
                  <h2>Reviews <span className="review-count">{buyersReviews.length}</span></h2>
                  {buyersReviews.map(r => <Review key={r.transactionHash} review={r} />)}
                  {/* To Do: pagination */}
                  {/* <a href="#" className="reviews-link">Read More<img src="/images/carat-blue.svg" className="down carat" alt="down carat" /></a> */}
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    onMobile: state.app.onMobile,
    web3Account: state.app.web3.account,
    web3Intent: state.app.web3.intent,
  }
}

const mapDispatchToProps = dispatch => ({
  showAlert: (msg) => dispatch(showAlert(msg)),
  storeWeb3Intent: (intent) => dispatch(storeWeb3Intent(intent)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ListingsDetail)
