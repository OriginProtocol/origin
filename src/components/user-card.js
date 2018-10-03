import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'

import { fetchUser } from 'actions/User'
import { storeWeb3Intent } from 'actions/App'

import Avatar from 'components/avatar'
import EtherscanLink from 'components/etherscan-link'
import Identicon from 'components/identicon'
import MessageNew from 'components/message-new'
import UnnamedUser from 'components/unnamed-user'

class UserCard extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      sendMessages: {
        id: 'messages-send.sendMessages',
        defaultMessage: 'send messages'
      }
    })

    this.handleToggle = this.handleToggle.bind(this)
    this.state = { modalOpen: false }
  }

  componentWillMount() {
    this.props.fetchUser(this.props.userAddress)
  }

  handleToggle(e) {
    e.preventDefault()
    const { storeWeb3Intent, intl, web3Account } = this.props
    const intent = intl.formatMessage(this.intlMessages.sendMessages)
    storeWeb3Intent(intent)

    if (web3.givenProvider && web3Account) {
      this.setState({ modalOpen: !this.state.modalOpen })
    }
  }

  render() {
    const {
      listingId,
      purchaseId,
      title,
      user,
      userAddress,
      web3Account
    } = this.props
    const { fullName, profile, attestations } = user

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
              {userAddress &&
                userAddress !== web3Account && (
                <a href="#" className="contact" onClick={this.handleToggle}>
                  <FormattedMessage
                    id={'user-card.enabledContact'}
                    defaultMessage={'Contact'}
                  />
                </a>
              )}
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
        <Link
          to={`/users/${userAddress}`}
          className="btn view-profile placehold"
        >
          <FormattedMessage
            id={'transaction-progress.viewProfile'}
            defaultMessage={'View Profile'}
          />
        </Link>
        <MessageNew
          open={this.state.modalOpen}
          recipientAddress={userAddress}
          listingId={listingId}
          purchaseId={purchaseId}
          handleToggle={this.handleToggle}
        />
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
    user: state.users.find(u => u.address === userAddress) || {},
    web3Account: state.app.web3.account
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: addr => dispatch(fetchUser(addr)),
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserCard))
