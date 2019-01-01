import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import moment from 'moment-timezone'
import { FormattedMessage, injectIntl } from 'react-intl'

import { fetchUser } from 'actions/User'

import PurchaseProgress from 'components/purchase-progress'
import UnnamedUser from 'components/unnamed-user'

import { offerStatusToStep } from 'utils/offer'
import { formattedAddress } from 'utils/user'

class MySaleCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      soldAtTime: null
    }

    this.setSoldAtTime = this.setSoldAtTime.bind(this)

  }

  componentWillMount() {
    this.props.fetchUser(this.props.purchase.buyer)
  }

  setSoldAtTime(soldAt) {
    this.setState({
      soldAtTime: moment(soldAt).fromNow()
    })
  }

  render() {
    const { listing, purchase, user } = this.props
    const { id: purchaseId, createdAt, status, totalPrice } = purchase

    if (!listing) {
      console.error(`Listing not found for purchase ${purchaseId}`)
      return null
    }

    const { name, pictures, price } = listing
    const priceToShow = listing.listingType === 'fractional' ? totalPrice.amount : price
    const buyerName = (user &&
      user.profile &&
      `${user.profile.firstName} ${user.profile.lastName}`) || <UnnamedUser />
    const photo = pictures && pictures.length > 0 && pictures[0]
    const voided = ['rejected', 'withdrawn'].includes(status)
    const completed = ['finalized', 'ruling', 'sellerReviewed'].includes(status)
    const pending = !voided && !completed
    const step = offerStatusToStep(status)

    return (
      <div className="sale card">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row">
            <div className="purchase order-3 order-lg-1">
              <h2 className="title">
                <Link to={`/purchases/${purchaseId}`}>{name}</Link>
              </h2>
              <h2 className="title">
                {pending && (
                  <FormattedMessage
                    id={'my-sale-card.pendingBuyerNameLink'}
                    defaultMessage={'selling to {linkToBuyer}'}
                    values={{
                      linkToBuyer: (
                        <Link to={`/users/${user.address}`}>{buyerName}</Link>
                      )
                    }}
                  />
                )}
                {completed && (
                  <FormattedMessage
                    id={'my-sale-card.completedBuyerNameLink'}
                    defaultMessage={'sold to {linkToBuyer}'}
                    values={{
                      linkToBuyer: (
                        <Link to={`/users/${user.address}`}>{buyerName}</Link>
                      )
                    }}
                  />
                )}
              </h2>
              <p className="address text-muted">{formattedAddress(user.address)}</p>
              <div className="d-flex">
                <p className="price">
                  <FormattedMessage
                    id={'my-sale-card.price'}
                    defaultMessage={'Price'}
                  />:&nbsp;{Number(priceToShow).toLocaleString(undefined, {
                    minimumFractionDigits: 5,
                    maximumFractionDigits: 5
                  })}
                </p>
                {/* Not Yet Relevant */}
                {/*<p className="quantity">Quantity: {quantity.toLocaleString()}</p>*/}
              </div>
            </div>
            <div className="timestamp-container order-2 text-muted text-right">
              <p className="timestamp">{moment(createdAt * 1000).fromNow()}</p>
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
          {!voided && (
            <PurchaseProgress
              maxStep={4}
              currentStep={step}
              perspective="seller"
              purchase={purchase}
              subdued={true}
            />
          )}
          <div className="d-flex justify-content-between actions">
            <p>
              {!completed ||
                (status === 'finalized' && (
                  <strong>
                    <FormattedMessage
                      id={'my-sale-card.nextStep'}
                      defaultMessage={'Next Step'}
                    />
                    :&nbsp;
                  </strong>
                ))}
              {status === 'created' && (
                <FormattedMessage
                  id={'my-sale-card.accept'}
                  defaultMessage={`Accept or reject the buyer's offer`}
                />
              )}
              {status === 'accepted' && (
                <FormattedMessage
                  id={'my-sale-card.awaitConfirmation'}
                  defaultMessage={'Wait for the buyer to complete the sale'}
                />
              )}
              {status === 'disputed' && (
                <FormattedMessage
                  id={'my-sale-card.awaitContact'}
                  defaultMessage={
                    'Wait to be contacted by an Origin team member'
                  }
                />
              )}
              {status === 'finalized' && (
                <FormattedMessage
                  id={'my-sale-card.reviewSale'}
                  defaultMessage={'Leave a review of the buyer'}
                />
              )}
            </p>
            <p className="link-container">
              <Link to={`/purchases/${purchaseId}`}>
                <FormattedMessage
                  id={'my-sale-card.viewDetails'}
                  defaultMessage={'View Details'}
                />
                <img
                  src="images/caret-blue.svg"
                  className="caret"
                  alt="right caret"
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
    user: state.users.find(u => u.address === purchase.buyer) || {}
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: addr => dispatch(fetchUser(addr))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MySaleCard))
