import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import $ from 'jquery'

import { updateNotification } from 'actions/Notification'
import { fetchUser } from 'actions/User'

import NotificationMessage from 'components/notification-message'
import UnnamedUser from 'components/unnamed-user'

class Notification extends Component {
  constructor(props) {
    super(props)

    const { notification, web3Account } = this.props
    const { listing, purchase } = notification.resources
    const counterpartyAddress = [listing.seller, purchase.buyer].find(
      addr => addr !== web3Account
    )

    this.handleClick = this.handleClick.bind(this)
    this.state = {
      counterpartyAddress,
      counterpartyName: '',
      listing,
      purchase
    }
  }

  componentWillMount() {
    this.props.fetchUser(this.state.counterpartyAddress)
  }

  componentDidUpdate() {
    const user = this.props.users.find(
      u => u.address === this.state.counterpartyAddress
    )
    const counterpartyName = user && user.fullName

    if (this.state.counterpartyName !== counterpartyName) {
      this.setState({ counterpartyName })
    }
  }

  handleClick() {
    this.props.updateNotification(this.props.notification.id, 'read')

    $('#notificationsDropdown').dropdown('toggle')
  }

  render() {
    const { notification } = this.props
    const {
      counterpartyAddress,
      counterpartyName,
      listing,
      purchase
    } = this.state

    const listingImageURL =
      listing.media && listing.media.length && listing.media[0].url

    return (
      <li className="list-group-item notification">
        <Link to={`/purchases/${purchase.id}`} onClick={this.handleClick}>
          <div className="d-flex align-items-stretch">
            <div className="image-container d-flex align-items-center justify-content-center">
              {!listing.id && (
                <img src="images/origin-icon-white.svg" alt="Origin zero" />
              )}
              {listing.id &&
                !listingImageURL && (
                <img src="images/origin-icon-white.svg" alt="Origin zero" />
              )}
              {listing.id &&
                listingImageURL && (
                <img
                  src={listingImageURL}
                  className="listing-related"
                  alt={listing.name}
                />
              )}
            </div>
            <div className="content-container d-flex flex-column justify-content-between">
              <NotificationMessage
                type={notification.type}
                className={`text-truncate${
                  counterpartyAddress ? '' : ' no-counterparty'
                }`}
              />
              {listing && (
                <div className="listing text-truncate">{listing.name}</div>
              )}
              {counterpartyAddress && (
                <div className="counterparty d-flex">
                  <div className="text-truncate">
                    <strong>
                      {notification.perspective === 'buyer' && (
                        <FormattedMessage
                          id={'notification.buyer'}
                          defaultMessage={'Buyer'}
                        />
                      )}
                      {notification.perspective === 'seller' && (
                        <FormattedMessage
                          id={'notification.seller'}
                          defaultMessage={'Seller'}
                        />
                      )}
                    </strong>: &nbsp;
                    {counterpartyName || <UnnamedUser />}
                  </div>
                  <div className="text-truncate text-muted">
                    {counterpartyAddress}
                  </div>
                </div>
              )}
            </div>
            <div className="button-container m-auto">
              <button className="btn">
                <img
                  src="images/carat-blue.svg"
                  className="carat"
                  alt="right carat"
                />
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
    web3Account: state.app.web3.account
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
