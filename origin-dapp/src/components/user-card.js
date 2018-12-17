import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { fetchUser } from 'actions/User'

import Avatar from 'components/avatar'
import Contact from 'components/contact'
import EtherscanLink from 'components/etherscan-link'
import Identicon from 'components/identicon'
import UnnamedUser from 'components/unnamed-user'

import { formattedAddress } from 'utils/user'

class UserCard extends Component {
  componentWillMount() {
    this.props.fetchUser(this.props.userAddress)
  }

  render() {
    const {
      listingId,
      purchaseId,
      title,
      user,
      userAddress,
      wallet
    } = this.props
    const { fullName, profile, attestations } = user
    const contactButtonIncluded = userAddress && formattedAddress(userAddress) !== formattedAddress(wallet.address)

    return (
      <div className="user-card placehold">
        <div className="identity">
          <h3>
            {title.toLowerCase() === 'buyer' && (
              <FormattedMessage
                id={'user-card.headingBuyer'}
                defaultMessage={'About the Buyer'}
              />
            )}
            {title.toLowerCase() === 'seller' && (
              <FormattedMessage
                id={'user-card.headingSeller'}
                defaultMessage={'About the Seller'}
              />
            )}
          </h3>
          <div className="d-flex">
            <div className="image-container">
              <Link to={`/users/${userAddress}`}>
                <Identicon address={userAddress} size={50} />
              </Link>
            </div>
            <div>
              <div>
                <FormattedMessage
                  id={'user-card.ethAddress'}
                  defaultMessage={'ETH Address:'}
                />
              </div>
              <div className="address">
                {userAddress && <EtherscanLink hash={userAddress} />}
              </div>
            </div>
          </div>
          <hr className="dark sm" />
          <div className="d-flex">
            <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
            <div className="identification d-flex flex-column justify-content-between">
              <div>
                <Link to={`/users/${userAddress}`}>
                  {fullName || <UnnamedUser />}
                </Link>
              </div>
              {attestations &&
                !!attestations.length && (
                <div>
                  {attestations.find(a => a.service === 'phone') && (
                    <Link to={`/users/${userAddress}`}>
                      <img
                        src="images/phone-icon-verified.svg"
                        alt="phone verified icon"
                      />
                    </Link>
                  )}
                  {attestations.find(a => a.service === 'email') && (
                    <Link to={`/users/${userAddress}`}>
                      <img
                        src="images/email-icon-verified.svg"
                        alt="email verified icon"
                      />
                    </Link>
                  )}
                  {attestations.find(a => a.service === 'facebook') && (
                    <Link to={`/users/${userAddress}`}>
                      <img
                        src="images/facebook-icon-verified.svg"
                        alt="Facebook verified icon"
                      />
                    </Link>
                  )}
                  {attestations.find(a => a.service === 'twitter') && (
                    <Link to={`/users/${userAddress}`}>
                      <img
                        src="images/twitter-icon-verified.svg"
                        alt="Twitter verified icon"
                      />
                    </Link>
                  )}
                  {attestations.find(a => a.service === 'airbnb') && (
                    <Link to={`/users/${userAddress}`}>
                      <img
                        src="images/airbnb-icon-verified.svg"
                        alt="Airbnb verified icon"
                      />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {contactButtonIncluded && (
          <Contact
            listingId={listingId}
            purchaseId={purchaseId}
            recipientAddress={userAddress}
            recipientTitle={title}
            className="view-profile placehold top-btn"
          />
        )}
        <Link
          to={`/users/${userAddress}`}
          className="btn view-profile placehold"
        >
          <FormattedMessage
            id={'transaction-progress.viewProfile'}
            defaultMessage={'View Profile'}
          />
        </Link>
      </div>
    )
  }
}

const mapStateToProps = ({ users, wallet }, { userAddress }) => {
  return {
    user: users.find(u => {
      return formattedAddress(u.address) === formattedAddress(userAddress)
    }) || {},
    wallet
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: addr => dispatch(fetchUser(addr))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserCard)
