import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { updateNotification } from 'actions/Notification'
import { fetchUser } from 'actions/User'

import NotificationMessage from 'components/notification-message'
import UnnamedUser from 'components/unnamed-user'

import { formattedAddress } from 'utils/user'

class Notification extends Component {
  constructor(props) {
    super(props)

    const { notification, wallet } = this.props
    const { listing, offer } = notification.resources
    const counterpartyAddress = [listing.seller, offer.buyer].find(
      addr => formattedAddress(addr) !== formattedAddress(wallet.address)
    )

    this.handleClick = this.handleClick.bind(this)
    this.listingImageElement = this.listingImageElement.bind(this)
    this.state = {
      counterpartyAddress,
      counterpartyName: '',
      listing,
      offer
    }
  }

  componentWillMount() {
    this.props.fetchUser(this.state.counterpartyAddress)
  }

  componentDidUpdate() {
    const user = this.props.users.find(
      u => formattedAddress(u.address) === formattedAddress(this.state.counterpartyAddress)
    )
    const counterpartyName = user && user.fullName

    if (this.state.counterpartyName !== counterpartyName) {
      this.setState({ counterpartyName })
    }
  }

  handleClick() {
    this.props.updateNotification(this.props.notification.id, 'read')
    if (this.props.onClick) {
      this.props.onClick()
    }
  }

  listingImageElement(listing) {
    const listingImageURL =
      listing.media && listing.media.length && listing.media[0].url

    // Listing has an id and an image to display
    if (listing.id && listingImageURL) {
      return (
        <img
          src={listingImageURL}
          className="listing-related"
          alt={listing.name}
        />
      )
    }
    // White labelled and has an icon URL set
    else if (this.isWhiteLabel && this.iconUrl) {
      return (
        <img src={this.iconUrl} alt="No listing image" />
      )
    }
    // Origin zero by default
    return (
      <img src="images/origin-icon-white.svg" alt="Origin zero" />
    )
  }

  render() {
    const { notification } = this.props
    const {
      counterpartyAddress,
      counterpartyName,
      listing,
      offer
    } = this.state


    return (
      <li className="list-group-item notification">
        <Link to={`/purchases/${offer.id}`} onClick={this.handleClick}>
          <div className="d-flex align-items-stretch">
            <div className="image-container d-flex align-items-center justify-content-center">
              {this.listingImageElement(listing)}
            </div>
            <div className="content-container d-flex flex-column justify-content-between">
              <NotificationMessage
                type={notification.type}
                className={`text-truncate${
                  counterpartyAddress ? '' : ' no-counterparty'
                }`}
              />
              {listing && (
                <div className="listing text-truncate" title={listing.name}>{listing.name}</div>
              )}
              {counterpartyAddress && (
                <div className="counterparty d-flex">
                  <div className="text-truncate">
                    <strong>
                      {/* This approach is naive and won't work once we include "offer withdrawn/rejected" notifications */}
                      {notification.perspective === 'seller' && (
                        <FormattedMessage
                          id={'notification.buyer'}
                          defaultMessage={'Buyer'}
                        />
                      )}
                      {notification.perspective === 'buyer' && (
                        <FormattedMessage
                          id={'notification.seller'}
                          defaultMessage={'Seller'}
                        />
                      )}
                    </strong>: &nbsp;
                    {counterpartyName || <UnnamedUser />}
                  </div>
                  <div className="text-truncate text-muted" title={formattedAddress(counterpartyAddress)}>
                    {formattedAddress(counterpartyAddress)}
                  </div>
                </div>
              )}
            </div>
            <div className="button-container m-auto">
              <button className="btn d-flex justify-content-center">
                <img
                  src="images/caret-blue.svg"
                  className="caret"
                  alt="right caret"
                />
              </button>
            </div>
          </div>
        </Link>
      </li>
    )
  }
}

const mapStateToProps = ({ users, wallet, config }) => {
  return {
    iconUrl: config.iconUrl,
    isWhiteLabel: config.isWhiteLabel,
    users,
    wallet
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: addr => dispatch(fetchUser(addr)),
  updateNotification: (id, status) => dispatch(updateNotification(id, status))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Notification)
