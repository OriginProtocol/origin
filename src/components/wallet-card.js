import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { getEthBalance, getOgnBalance } from 'actions/Wallet'

import Avatar from 'components/avatar'
import EtherscanLink from 'components/etherscan-link'
import Identicon from 'components/identicon'
import MessageNew from 'components/message-new'

import { getFiatPrice } from 'utils/priceUtils'

import origin from '../services/origin'

class WalletCard extends Component {
  constructor(props) {
    super(props)

    this.handleToggle = this.handleToggle.bind(this)
    this.state = {
      modalOpen: false,
      ethToUsdBalance: 0
    }
  }

  async convertEthToUsd() {
    const ethToUsdBalance = await getFiatPrice( this.props.wallet.ethBalance, 'USD' )

    this.setState({
      ethToUsdBalance
    })
  }

  componentDidMount() {
    this.props.getEthBalance()
    this.props.getOgnBalance()

    this.convertEthToUsd()
  }

  componentDidUpdate(prevProps) {
    const { ethBalance } = this.props.wallet

    if (ethBalance !== prevProps.wallet.ethBalance) {
      this.convertEthToUsd()
    }
  }

  handleToggle(e) {
    e.preventDefault()

    this.setState({ modalOpen: !this.state.modalOpen })
  }

  render() {
    const { profile, wallet, web3Account, withMenus, withProfile } = this.props
    const { address, ethBalance, ognBalance } = wallet
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
                  id={'wallet-card.ethAddress'}
                  defaultMessage={'ETH Address:'}
                />
              </div>
            )}
            <div>
              {address ? (
                <EtherscanLink hash={address} />
              ) : (
                <FormattedMessage
                  id={'wallet-card.noEthAccountConnected'}
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
                id={'wallet-card.accountBalances'}
                defaultMessage={'Account Balances'}
              />
              <div className="d-flex align-items-start">
                <img src="images/eth-icon.svg" role="presentation" />
                <div className="amounts">
                  <div className="eth">
                    {
                      `${Number(ethBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 5,
                        maximumFractionDigits: 5
                      })}`
                      || 0
                    }&nbsp;
                    <span className="symbol">ETH</span></div>
                  <div className="usd">{this.state.ethToUsdBalance} USD</div>
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
                  <div className="ogn">
                    {
                      `${Number(ognBalance).toLocaleString(undefined)}`
                      || 0
                    }&nbsp;
                    <span className="symbol">OGN</span>
                  </div>
                  {/* Via Matt 9/4/2018: Not necessary until we have a liquid conversion rate */}
                  {/* <div className="usd">0.00 USD</div> */}
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

const matchDispatchToProps = dispatch => ({
  getEthBalance: () => dispatch(getEthBalance()),
  getOgnBalance: () => dispatch(getOgnBalance())
})

export default connect(mapStateToProps, matchDispatchToProps)(WalletCard)
