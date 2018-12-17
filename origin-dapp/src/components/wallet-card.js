import React, { Component, Fragment } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { fetchUser } from 'actions/User'
import { getEthBalance, getOgnBalance } from 'actions/Wallet'

import Avatar from 'components/avatar'
import Contact from 'components/contact'
import Dropdown from 'components/dropdown'
import EtherscanLink from 'components/etherscan-link'
import Identicon from 'components/identicon'
import Tooltip from 'components/tooltip'
import UnnamedUser from 'components/unnamed-user'

import { getFiatPrice } from 'utils/priceUtils'
import { formattedAddress } from 'utils/user'

import origin from '../services/origin'

class WalletCard extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      yourBalance: {
        id: '_wallet-card.yourBalance',
        defaultMessage:
          'You have <img class="ogn-icon" src="images/ogn-icon.svg" role="presentation" /><span class="ogn">0 OGN</span>'
      },
      balanceText: {
        id: '_wallet-card.balanceText',
        defaultMessage:
          'Having OGN is not required but will allow you \
        to create a listing that will be more visible to buyers.'
      },
      getOGN: {
        id: '_wallet-card.getOgn',
        defaultMessage: 'Get OGN'
      },
      recommendation: {
        id: '_wallet-card.recommendation',
        defaultMessage: '(recommended)'
      },
      learnMore: {
        id: '_wallet-card.learnMore',
        defaultMessage: 'Learn more'
      }
    })

    this.state = { ethDropdown: false }
  }

  componentDidMount() {
    const {
      address,
      fetchUser,
      getEthBalance,
      getOgnBalance
    } = this.props

    getEthBalance()
    getOgnBalance()

    address && fetchUser(address)
  }

  componentDidUpdate(prevProps) {
    const { address, fetchUser } = this.props

    if (address !== prevProps.address) {
      fetchUser(address)
    }
  }

  render() {
    const {
      address,
      ethBalance,
      ognBalance,
      users,
      wallet,
      withBalanceTooltip,
      withMenus,
      withProfile
    } = this.props
    const user =
      users.find(
        u => formattedAddress(u.address) === formattedAddress(address)
      ) || {}
    const { attestations = [], fullName, profile = {} } = user
    const ethToUsdBalance = getFiatPrice(ethBalance, 'USD')
    const contactButtonIncluded = formattedAddress(address) !== formattedAddress(wallet.address)
    const balanceTooltip = (
      <div>
        <p
          className="tooltip-balance-heading tooltip-align-left"
          dangerouslySetInnerHTML={{
            __html: this.props.intl.formatMessage(this.intlMessages.yourBalance)
          }}
        />
        <p
          className="tooltip-balance-text tooltip-align-left"
          dangerouslySetInnerHTML={{
            __html: this.props.intl.formatMessage(this.intlMessages.balanceText)
          }}
        />
        <p className="tooltip-align-left">
          <a
            href="/#/about-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="learn-more"
            dangerouslySetInnerHTML={{
              __html: `${this.props.intl.formatMessage(
                this.intlMessages.learnMore
              )} ▸`
            }}
          />
        </p>
      </div>
    )

    return (
      <div className="wallet-container">
        <div className={`wallet${contactButtonIncluded ? ' appended' : ''}`}>
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
            </div>
          </div>
          {ethBalance !== undefined && (
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
                      {`${Number(ethBalance).toLocaleString(undefined, {
                        minimumFractionDigits: 5,
                        maximumFractionDigits: 5
                      })}` || 0}
                      &nbsp;
                      <span className="symbol">ETH</span>
                    </div>
                    <div className="usd">{ethToUsdBalance} USD</div>
                  </div>
                  {withMenus && (
                    <Dropdown
                      open={this.state.ethDropdown}
                      onClose={() => this.setState({ ethDropdown: false })}
                    >
                      <button
                        type="button"
                        id="ethMenuButton"
                        onClick={() => this.setState({ ethDropdown: true })}
                        className="d-flex flex-column justify-content-between"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <div className="dot" />
                        <div className="dot" />
                        <div className="dot" />
                      </button>
                      <div
                        className={`dropdown-menu dropdown-menu-right${
                          this.state.ethDropdown ? ' show' : ''
                        }`}
                        aria-labelledby="ethMenuButton"
                      >
                        {address && (
                          <EtherscanLink
                            hash={address}
                            className="dropdown-item"
                          >
                            <FormattedMessage
                              id={'wallet-card.transactionHistory'}
                              defaultMessage={'Transaction History'}
                            />
                          </EtherscanLink>
                        )}
                        {/*
                          <a className="dropdown-item" href="#">
                            <FormattedMessage
                              id={'wallet-card.addTokens'}
                              defaultMessage={'Add Tokens'}
                            />
                          </a>
                        */}
                      </div>
                    </Dropdown>
                  )}
                </div>
                <div className="d-flex align-items-start">
                  {!withBalanceTooltip && (
                    <img src="images/ogn-icon.svg" role="presentation" />
                  )}
                  {withBalanceTooltip && (
                    <Tooltip
                      placement="left"
                      delay={{ show: 0, hide: 5000 }}
                      trigger={['hover', 'focus']}
                      content={balanceTooltip}
                    >
                      <a className="ogn-balance">
                        <img src="images/ogn-icon.svg" role="presentation" />
                      </a>
                    </Tooltip>
                  )}
                  <div className="amounts">
                    <div className="ogn">
                      {`${Number(ognBalance).toLocaleString(undefined)}` || 0}
                      &nbsp;
                      <span className="symbol">OGN</span>
                    </div>
                    {/* Via Matt 9/4/2018: Not necessary until we have a liquid conversion rate */}
                    {/* <div className="usd">0.00 USD</div> */}
                  </div>
                  {withMenus && (
                    <Dropdown
                      open={this.state.ognDropdown}
                      onClose={() => this.setState({ ognDropdown: false })}
                    >
                      <button
                        type="button"
                        id="ognMenuButton"
                        onClick={() => this.setState({ ognDropdown: true })}
                        className="d-flex flex-column justify-content-between"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <div className="dot" />
                        <div className="dot" />
                        <div className="dot" />
                      </button>
                      <div
                        className={`dropdown-menu dropdown-menu-right${
                          this.state.ognDropdown ? ' show' : ''
                        }`}
                        aria-labelledby="ognMenuButton"
                      >
                        {address && (
                          <EtherscanLink
                            hash={address}
                            tokenAddress={origin.token.contractAddress}
                            className="dropdown-item"
                          >
                            Transaction History
                          </EtherscanLink>
                        )}
                        {/*
                          <a className="dropdown-item" href="#">
                            Add Tokens
                          </a>
                        */}
                      </div>
                    </Dropdown>
                  )}
                </div>
              </div>
            </Fragment>
          )}
          {withProfile && (
            <Fragment>
              <hr className="dark sm" />
              <div className="d-flex">
                <Link to="/profile">
                  <Avatar image={profile.avatar} placeholderStyle="blue" />
                </Link>
                <div className="identification d-flex flex-column justify-content-between">
                  <div>
                    <Link to="/profile">{fullName || <UnnamedUser />}</Link>
                  </div>
                  {!!attestations.length && (
                    <div className="attestations">
                      {attestations.find(a => a.service === 'phone') && (
                        <Link to="/profile">
                          <img
                            src="images/phone-icon-verified.svg"
                            alt="phone verified icon"
                          />
                        </Link>
                      )}
                      {attestations.find(a => a.service === 'email') && (
                        <Link to="/profile">
                          <img
                            src="images/email-icon-verified.svg"
                            alt="email verified icon"
                          />
                        </Link>
                      )}
                      {attestations.find(a => a.service === 'facebook') && (
                        <Link to="/profile">
                          <img
                            src="images/facebook-icon-verified.svg"
                            alt="Facebook verified icon"
                          />
                        </Link>
                      )}
                      {attestations.find(a => a.service === 'twitter') && (
                        <Link to="/profile">
                          <img
                            src="images/twitter-icon-verified.svg"
                            alt="Twitter verified icon"
                          />
                        </Link>
                      )}
                      {attestations.find(a => a.service === 'airbnb') && (
                        <Link to="/profile">
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
            </Fragment>
          )}
        </div>
        {contactButtonIncluded && (
          <Contact recipientAddress={address} className="btn contact-user" />
        )}
      </div>
    )
  }
}

const mapStateToProps = ({ exchangeRates, users, wallet }) => {
  return {
    exchangeRates,
    users,
    wallet
  }
}

const matchDispatchToProps = dispatch => ({
  fetchUser: address => dispatch(fetchUser(address)),
  getEthBalance: () => dispatch(getEthBalance()),
  getOgnBalance: () => dispatch(getOgnBalance())
})

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(injectIntl(WalletCard))
