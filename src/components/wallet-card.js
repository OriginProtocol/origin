import React, { Component, Fragment } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { getEthBalance, getOgnBalance } from 'actions/Wallet'

import Avatar from 'components/avatar'
import EtherscanLink from 'components/etherscan-link'
import Identicon from 'components/identicon'
import MessageNew from 'components/message-new'

import { getFiatPrice } from 'utils/priceUtils'

import origin from '../services/origin'
import $ from 'jquery'

class WalletCard extends Component {
  constructor(props) {
    super(props)

    this.handleToggle = this.handleToggle.bind(this)
    this.state = {
      modalOpen: false,
      ethToUsdBalance: 0
    }

    this.intlMessages = defineMessages({
      yourBalance: {
        id: '_wallet-card.yourBalance',
        defaultMessage: 'You have'
      },
      balanceText: {
        id: '_wallet-card.balanceText',
        defaultMessage: 'Having OGN is not required but will allow you \
        to create a listing that will be more visible to buyers.'
      },
      getOGN: {
        id: '_wallet-card.getOgn',
        defaultMessage: 'Get OGN'
      },
      reccommendation: {
        id: '_wallet-card.reccommendation',
        defaultMessage: '(recommended)'
      },
      learnMore: {
        id: '_wallet-card.learnMore',
        defaultMessage: 'Learn more'
      }
    })  
  }

  async convertEthToUsd() {
    const ethToUsdBalance = await getFiatPrice(this.props.wallet.ethBalance, 'USD')

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

    const balanceTooltip = `
      <p class='tooltip-balance-heading tooltip-align-left'>
        ${this.props.intl.formatMessage(this.intlMessages.yourBalance)}
        <img class='ogn-icon' src = 'images/ogn-icon.svg' role = 'presentation' />
        <span class='ogn'>
          # OGN
        </span>
      </p>
      <p class='tooltip-balance-text tooltip-align-left'>
        ${this.props.intl.formatMessage(this.intlMessages.balanceText)}
      </p>
      <p class='tooltip-align-left'>
        <a href='#' class='add-more-btn add-more-text'>
          <img class='add-more-icon' src='images/add-icon.svg' role='presentation' />
          ${this.props.intl.formatMessage(this.intlMessages.getOGN)}
        </a>
        <span class='recommended'>
          ${this.props.intl.formatMessage(this.intlMessages.reccommendation)}
        </span>
      </p>
      <p class='tooltip-align-left'>
        <a href='/#/about-tokens' target='_blank' class='learn-more'>
          ${this.props.intl.formatMessage(this.intlMessages.learnMore)} ▸
        </a>
      </p>
    `
    $('.ogn-balance').tooltip({ 
      trigger: 'manual', 
      html: true,
      placement: 'left',
      animation: true 
    })
      .on('mouseenter', function () {
        const _this = this;
        $(this).tooltip('show');
        $('.tooltip').on('mouseleave', function () {
          $(_this).tooltip('hide');
        });
      })
      .on('mouseleave', function () {
        const _this = this;
        setTimeout(function () {
          if (!$('.tooltip:hover').length) {
            $(_this).tooltip('hide');
          }
        }, 500);
      });

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

                <a className="ogn-balance"
                  data-toggle="tooltip"
                  data-title={balanceTooltip} 
                >
                  <img src="images/ogn-icon.svg" role="presentation" />
                </a>
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

export default connect(
  mapStateToProps, 
  matchDispatchToProps
)(injectIntl(WalletCard))
