import React, { Component } from 'react'
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { fetchUser } from 'actions/User'

import NotificationMessage from 'components/notification-message'

import origin from '../services/origin'

class Notification extends Component {
  constructor(props) {
    super(props)

    const { notification, web3Account } = this.props
    const { listing, purchase } = notification.resources
    const counterpartyAddress = [
      listing.sellerAddress,
      purchase.buyerAddress
    ].find(addr => addr !== web3Account)

    this.intlMessages = defineMessages({
      unnamedUser: {
        id: 'notification.unnamedUser',
        defaultMessage: 'Unnamed User'
      }
    })

    this.handleClick = this.handleClick.bind(this)
    this.state = {
      counterpartyAddress,
      counterpartyName: '',
      listing,
      purchase
    }
  }

  componentWillMount() {
    this.props.fetchUser(
      this.state.counterpartyAddress,
      this.props.intl.formatMessage(this.intlMessages.unnamedUser)
    )
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

  async handleClick() {
    try {
      await origin.notifications.set({
        id: this.props.notification.id,
        status: 'read'
      })
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    const { notification } = this.props
    const {
      counterpartyAddress,
      counterpartyName,
      listing,
      purchase
    } = this.state
    const { pictures } = listing
    const listingImageURL = pictures && pictures.length && pictures[0]

    return (
      <li className="list-group-item notification">
        <Link to={`/purchases/${purchase.id}`} onClick={this.handleClick}>
          <div className="d-flex align-items-stretch">
            <div className="image-container d-flex align-items-center justify-content-center">
              {!listing.address && (
                <img src="images/origin-icon-white.svg" alt="Origin zero" />
              )}
              {listing.address &&
                !listingImageURL && (
                <img src="images/origin-icon-white.svg" alt="Origin zero" />
              )}
              {listing.address &&
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
                    {counterpartyName || 'Unnamed User'}
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
  fetchUser: (addr, msg) => dispatch(fetchUser(addr, msg))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Notification))
