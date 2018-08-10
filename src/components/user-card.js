import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'

import { fetchUser } from 'actions/User'

import Avatar from 'components/avatar'
import EtherscanLink from 'components/etherscan-link'
import MessageNew from 'components/message-new'

import origin from '../services/origin'

class UserCard extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      unnamedUser: {
        id: 'user-card.unnamedUser',
        defaultMessage: 'Unnamed User'
      }
    })

    this.handleToggle = this.handleToggle.bind(this)
    this.state = { modalOpen: false }
  }

  componentWillMount() {
    this.props.fetchUser(
      this.props.userAddress,
      this.props.intl.formatMessage(this.intlMessages.unnamedUser)
    )
  }

  handleToggle(e) {
    e.preventDefault()

    this.setState({ modalOpen: !this.state.modalOpen })
  }

  render() {
    const {
      listingAddress,
      purchaseAddress,
      title,
      user,
      userAddress
    } = this.props
    const { fullName, profile, attestations } = user
    const userCanReceiveMessages = origin.messaging.canReceiveMessages(
      userAddress
    )

    return (
      <div className="user-card placehold">
        <div className="identity">
          <h3>
            <FormattedMessage
              id={'user-card.heading'}
              defaultMessage={'About the {title}'}
              values={{ title }}
            />
          </h3>
          <div className="d-flex">
            <div className="image-container">
              <Link to={`/users/${userAddress}`}>
                <img
                  src="images/identicon.png"
                  srcSet="images/identicon@2x.png 2x, images/identicon@3x.png 3x"
                  alt="wallet icon"
                />
              </Link>
            </div>
            <div>
              <div>
                <FormattedMessage
                  id={'transaction-progress.ethAddress'}
                  defaultMessage={'ETH Address:'}
                />
              </div>
              <div className="address">
                {userAddress && <EtherscanLink hash={userAddress} />}
              </div>
              {userAddress &&
                userCanReceiveMessages && (
                <a href="#" className="contact" onClick={this.handleToggle}>
                    Contact
                </a>
              )}
            </div>
          </div>
          <hr className="dark sm" />
          <div className="d-flex">
            <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
            <div className="identification d-flex flex-column justify-content-between">
              <div>
                <Link to={`/users/${userAddress}`}>{fullName}</Link>
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
        <Link
          to={`/users/${userAddress}`}
          className="btn view-profile placehold"
        >
          <FormattedMessage
            id={'transaction-progress.viewProfile'}
            defaultMessage={'View Profile'}
          />
        </Link>
        {userCanReceiveMessages && (
          <MessageNew
            open={this.state.modalOpen}
            recipientAddress={userAddress}
            listingAddress={listingAddress}
            purchaseAddress={purchaseAddress}
            handleToggle={this.handleToggle}
          />
        )}
      </div>
    )
  }
}

const mapStateToProps = (state, { userAddress }) => {
  return {
    // for reactivity
    messagingEnabled: state.app.messagingEnabled,
    // for reactivity
    messagingInitialized: state.app.messagingInitialized,
    user: state.users.find(u => u.address === userAddress) || {}
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: (addr, msg) => dispatch(fetchUser(addr, msg))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserCard))
