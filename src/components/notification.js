import React, { Component, Fragment } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { fetchUser } from 'actions/User'

import origin from '../services/origin'

// support other derived notifications in the future
const NON_PURCHASE_RELATED_MESSAGE = 'A message from Origin that does not involve a listing'

class NotificationMessage extends Component {
  constructor(props){
    super(props)

    this.intlMessages = defineMessages({
      shippingPending: {
        id: 'notification.purchaseCreated',
        defaultMessage: 'You have a new purchase.',
      },
      buyerPending: {
        id: 'notification.purchaseSent',
        defaultMessage: 'Your purchase has been shipped.',
      },
      sellerPending: {
        id: 'notification.purchaseReceived',
        defaultMessage: 'You have a new review.',
      },
      complete: {
        id: 'notification.purchaseComplete',
        defaultMessage: 'You have a new review.',
      },
    });
  }

  render() {
    const { className, listing, stage } = this.props
    let message

    switch(stage) {
      case 'complete':
        message = this.props.intl.formatMessage(this.intlMessages.complete)
        break
      case 'seller_pending':
        message = this.props.intl.formatMessage(this.intlMessages.sellerPending)
        break
      case 'buyer_pending':
        message = this.props.intl.formatMessage(this.intlMessages.buyerPending)
        break
      case 'shipping_pending':
        message = this.props.intl.formatMessage(this.intlMessages.shippingPending)
        break
      default:
        return <p className={className || ''}>{NON_PURCHASE_RELATED_MESSAGE}</p>
    }

    return (
      <div className={`message${className ? ` ${className}` : ''}`}>{message}</div>
    )
  }
}

class Notification extends Component {
  constructor(props){
    super(props)

    const { notification, web3Account } = this.props
    const { listing, purchase } = notification.resources
    const counterpartyAddress = [listing.sellerAddress, purchase.buyerAddress].find(addr => addr !== web3Account)

    this.handleClick = this.handleClick.bind(this)
    this.state = {
      counterpartyAddress,
      counterpartyName: '',
      listing,
      purchase,
    }
  }

  componentWillMount() {
    this.props.fetchUser(this.state.counterpartyAddress)
  }

  componentDidUpdate() {
    const user = this.props.users.find(u => u.address === this.state.counterpartyAddress)
    const counterpartyName = user && user.fullName

    if (this.state.counterpartyName !== counterpartyName) {
      this.setState({ counterpartyName })
    }
  }

  async handleClick() {
    try {
      await origin.notifications.set({ id: this.props.notification.id, status: 'read' })
    } catch(e) {
      console.error(e)
    }
  }

  render() {
    const { intl, notification } = this.props
    const { counterpartyAddress, counterpartyName, listing, purchase } = this.state
    const { pictures } = listing
    const listingImageURL = pictures && pictures.length && (new URL(pictures[0])).protocol === "data:" && pictures[0]

    return (
      <li className="list-group-item notification">
        <Link to={`/purchases/${purchase.address}`} onClick={this.handleClick}>
          <div className="d-flex align-items-stretch">
            <div className="image-container d-flex align-items-center justify-content-center">
              {!listing.address && <img src="images/origin-icon-white.svg" alt="Origin zero" />}
              {listing.address && !listingImageURL && <img src="images/origin-icon-white.svg" alt="Origin zero" />}
              {listing.address && listingImageURL && <img src={listingImageURL} className="listing-related" alt={listing.name} />}
            </div>
            <div className="content-container d-flex flex-column justify-content-between">
              <NotificationMessage
                intl={intl}
                listing={listing}
                stage={purchase.stage}
                className={`text-truncate${counterpartyAddress ? '' : ' no-counterparty'}`}
              />
              {listing &&
                <div className="listing text-truncate">{listing.name}</div>
              }
              {counterpartyAddress &&
                <div className="counterparty d-flex">
                  <div className="text-truncate">
                    <strong>
                      {notification.perspective === 'buyer' &&
                        <FormattedMessage
                          id={ 'purchase-detail.buyer' }
                          defaultMessage={ 'Buyer' }
                        />
                      }
                      {notification.perspective === 'seller' &&
                        <FormattedMessage
                          id={ 'purchase-detail.seller' }
                          defaultMessage={ 'Seller' }
                        />
                      }
                    </strong>:
                    &nbsp;
                    {counterpartyName || 'Unnamed User'}
                  </div>
                  <div className="text-truncate text-muted">{counterpartyAddress}</div>
                </div>
              }
            </div>
            <div className="button-container m-auto">
              <button className="btn">
                <img src="images/carat-blue.svg" className="carat" alt="right carat" />
              </button>
            </div>
          </div>
        </Link>
      </li>
    )
  }
}

const mapStateToProps = state => {
  return {
    users: state.users,
    web3Account: state.app.web3.account,
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: address => dispatch(fetchUser(address))
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Notification))
