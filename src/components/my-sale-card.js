import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import moment from 'moment'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import { fetchUser } from 'actions/User'

import PurchaseProgress from 'components/purchase-progress'

import { translateListingCategory } from 'utils/translationUtils'

class MySaleCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      soldAtTime: null
    }

    this.setSoldAtTime = this.setSoldAtTime.bind(this)

    this.intlMessages = defineMessages({
      ETH: {
        id: 'my-sale-card.ethereumCurrencyAbbrev',
        defaultMessage: 'ETH'
      },
      unnamedUser: {
        id: 'my-sale-card.unnamedUser',
        defaultMessage: 'Unnamed User'
      }
    })
  }

  componentWillMount() {
    this.props.fetchUser(
      this.props.purchase.buyerAddress,
      this.props.intl.formatMessage(this.intlMessages.unnamedUser)
    )
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  setSoldAtTime(soldAt) {
    this.setState({
      soldAtTime: moment(soldAt).fromNow()
    })
  }

  render() {
    const { listing, purchase, user } = this.props

    if (!listing) {
      console.error(`Listing not found for purchase ${purchase.id}`)
      return null
    }

    const { name, pictures, price } = translateListingCategory(
      listing.ipfsData.data
    )
    const buyerName =
      (user &&
        user.profile &&
        `${user.profile.firstName} ${user.profile.lastName}`) ||
      this.props.intl.formatMessage(this.intlMessages.unnamedUser)
    const photo = pictures && pictures.length > 0 && pictures[0]
    const soldAt = Number(purchase.createdAt) * 1000 // convert seconds since epoch to ms
    const step = Number(purchase.status)

    return (
      <div className="sale card">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row">
            <div className="purchase order-3 order-lg-1">
              <h2 className="title">
                <Link to={`/purchases/${purchase.id}`}>{name}</Link>
              </h2>
              <h2 className="title">
                <FormattedMessage
                  id={'my-sale-card.buyerNameLink'}
                  defaultMessage={'sold to {linkToBuyer}'}
                  values={{
                    linkToBuyer: (
                      <Link to={`/users/${user.address}`}>{buyerName}</Link>
                    )
                  }}
                />
              </h2>
              <p className="address text-muted">{user.address}</p>
              <div className="d-flex">
                <p className="price">
                  <FormattedMessage
                    id={'my-sale-card.price'}
                    defaultMessage={'Price: {price}'}
                    values={{ price }}
                  />
                </p>
                {/* Not Yet Relevant */}
                {/*<p className="quantity">Quantity: {quantity.toLocaleString()}</p>*/}
              </div>
            </div>
            <div className="timestamp-container order-2 text-muted text-right">
              <p className="timestamp">
                {this.state.soldAtTime || this.setSoldAtTime(soldAt)}
              </p>
            </div>
            <div className="aspect-ratio order-1 order-lg-3">
              <div
                className={`${
                  photo ? '' : 'placeholder '
                }image-container d-flex justify-content-center`}
              >
                <img
                  src={photo || 'images/default-image.svg'}
                  role="presentation"
                />
              </div>
            </div>
          </div>
          <PurchaseProgress
            currentStep={step}
            purchase={purchase}
            perspective="seller"
            subdued={true}
          />
          <div className="d-flex justify-content-between actions">
            {step === 1 && (
              <p>
                <FormattedMessage
                  id={'my-sale-card.nextStep1'}
                  defaultMessage={'{nextStep} Send the order to buyer'}
                  values={{ nextStep: <strong>Next Step:</strong> }}
                />
              </p>
            )}
            {step === 2 && (
              <p>
                <FormattedMessage
                  id={'my-sale-card.nextStep2'}
                  defaultMessage={'{nextStep} Wait for buyer to receive order'}
                  values={{ nextStep: <strong>Next Step:</strong> }}
                />
              </p>
            )}
            {step === 3 && (
              <p>
                <FormattedMessage
                  id={'my-sale-card.nextStep3'}
                  defaultMessage={'{nextStep} Withdraw funds'}
                  values={{ nextStep: <strong>Next Step:</strong> }}
                />
              </p>
            )}
            {step === 4 && (
              <p>
                <FormattedMessage
                  id={'my-sale-card.orderComplete'}
                  defaultMessage={'This order is complete'}
                />
              </p>
            )}
            <p className="link-container">
              <Link to={`/purchases/${purchase.id}`}>
                <FormattedMessage
                  id={'my-sale-card.viewDetails'}
                  defaultMessage={'View Details'}
                />
                <img
                  src="images/carat-blue.svg"
                  className="carat"
                  alt="right carat"
                />
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, { purchase }) => {
  return {
    user: state.users.find(u => u.address === purchase.buyerAddress) || {}
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: (addr, msg) => dispatch(fetchUser(addr, msg))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MySaleCard))
