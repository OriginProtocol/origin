import React, { Component, Fragment } from 'react'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Avatar from 'components/avatar'
import EtherscanLink from 'components/etherscan-link'
import Identicon from 'components/identicon'
import MessageNew from 'components/message-new'
import { getFiatPrice } from 'utils/priceUtils'

import origin from '../services/origin'

class Wallet extends Component {
  constructor(props) {
    super(props)

    this.handleToggle = this.handleToggle.bind(this)
    this.state = {
      modalOpen: false,
      ethBalance: this.props.balance,
      usdBalance: 0
    }
  }

  async convertEthToUsd() {
    const usdBalance = await getFiatPrice( this.props.balance, 'USD' )
    this.setState({
      usdBalance
    })
  }

  componentDidMount() {
    this.convertEthToUsd()
  }

  componentDidUpdate() {
    if (this.props.balance !== this.state.ethBalance) {
      this.convertEthToUsd()
      this.setState({
        ethBalance: this.props.balance
      })
    }
  }

  handleToggle(e) {
    e.preventDefault()

    this.setState({ modalOpen: !this.state.modalOpen })
  }

  render() {
    const { address, balance, profile, web3Account, withMenus, withProfile } = this.props
    const { user } = profile
    const userCanReceiveMessages =
      address !== web3Account && origin.messaging.canReceiveMessages(address)

    return (
      <div className="wallet">
        <div className="d-flex">
          <div className="image-container">
            <Identicon address={address} size={50} />
          </div>
          <div className="address d-flex flex-column justify-content-between">
            {address && (
              <div>
                <FormattedMessage
                  id={'wallet.ethAddress'}
                  defaultMessage={'ETH Address:'}
                />
              </div>
            )}
            <div>
              {address ? (
                <EtherscanLink hash={address} />
              ) : (
                <FormattedMessage
                  id={'wallet.noEthAccountConnected'}
                  defaultMessage={'No ETH Account Connected'}
                />
              )}
            </div>
            {userCanReceiveMessages && (
              <a href="#" className="contact" onClick={this.handleToggle}>
                Contact
              </a>
            )}
          </div>
        </div>
        {userCanReceiveMessages && (
          <MessageNew
            open={this.state.modalOpen}
            recipientAddress={address}
            handleToggle={this.handleToggle}
          />
        )}
        {/* Hidden for current deployment */}
        {/* identityAddress &&
          <div>
            <a href={`https://erc725.originprotocol.com/#/identity/${identityAddress}`} target="_blank">Identity Contract Detail</a>
          </div>
        */}
        {address === web3Account &&
          <Fragment>
            <hr className="dark sm" />
            <div className="balances">
              <FormattedMessage
                id={'wallet.accountBalances'}
                defaultMessage={'Account Balances'}
              />
              <div className="d-flex align-items-start">
                <img src="images/eth-icon.svg" role="presentation" />
                <div className="amounts">
                  <div className="eth">{balance}<span className="symbol">ETH</span></div>
                  <div className="usd">{this.state.usdBalance} USD</div>
                </div>
                {withMenus &&
                  <div className="dropdown">
                    <button type="button" id="ethMenuButton" className="d-flex flex-column justify-content-between" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </button>
                    <div className="dropdown-menu dropdown-menu-right" aria-labelledby="ethMenuButton">
                      <a className="dropdown-item" href="#">Transaction History</a>
                      <a className="dropdown-item" href="#">Add Tokens</a>
                    </div>
                  </div>
                }
              </div>
              <div className="d-flex align-items-start">
                <img src="images/ogn-icon.svg" role="presentation" />
                <div className="amounts">
                  <div className="ogn">0<span className="symbol">OGN</span></div>
                  <div className="usd">0.00 USD</div>
                </div>
                {withMenus &&
                  <div className="dropdown">
                    <button type="button" id="ognMenuButton" className="d-flex flex-column justify-content-between" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </button>
                    <div className="dropdown-menu dropdown-menu-right" aria-labelledby="ognMenuButton">
                      <a className="dropdown-item" href="#">Transaction History</a>
                      <a className="dropdown-item" href="#">Add Tokens</a>
                    </div>
                  </div>
                }
              </div>
            </div>
          </Fragment>
        }
        {withProfile &&
          <Fragment>
            <hr className="dark sm" />
            <div className="d-flex">
              <Link to="/profile">
                <Avatar
                  image={user && user.profile && user.profile.avatar}
                  placeholderStyle="blue"
                />
              </Link>
              <div className="identification d-flex flex-column justify-content-between">
                <div>
                  <Link to="/profile">{profile.name}</Link>
                </div>
                <div>
                  {profile.published.phone && (
                    <Link to="/profile">
                      <img
                        src="images/phone-icon-verified.svg"
                        alt="phone verified icon"
                      />
                    </Link>
                  )}
                  {profile.published.email && (
                    <Link to="/profile">
                      <img
                        src="images/email-icon-verified.svg"
                        alt="email verified icon"
                      />
                    </Link>
                  )}
                  {profile.published.facebook && (
                    <Link to="/profile">
                      <img
                        src="images/facebook-icon-verified.svg"
                        alt="Facebook verified icon"
                      />
                    </Link>
                  )}
                  {profile.published.twitter && (
                    <Link to="/profile">
                      <img
                        src="images/twitter-icon-verified.svg"
                        alt="Twitter verified icon"
                      />
                    </Link>
                  )}
                  {profile.published.airbnb && (
                    <Link to="/profile">
                      <img
                        src="images/airbnb-icon-verified.svg"
                        alt="Airbnb verified icon"
                      />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Fragment>
        }
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    // for reactivity
    messagingEnabled: state.app.messagingEnabled,
    // for reactivity
    messagingInitialized: state.app.messagingInitialized,
    profile: state.profile,
    web3Account: state.app.web3.account
  }
}

export default connect(mapStateToProps)(Wallet)
