import React, { Component, Fragment } from 'react'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import { connect } from 'react-redux'

import EtherscanLink from 'components/etherscan-link'
import Identicon from 'components/Identicon'
import MessageNew from 'components/message-new'

import origin from '../../services/origin'

class Wallet extends Component {
  constructor(props) {
    super(props)

    this.handleToggle = this.handleToggle.bind(this)
    this.state = { modalOpen: false }
  }

  handleToggle(e) {
    e.preventDefault()

    this.setState({ modalOpen: !this.state.modalOpen })
  }

  render() {
    const { address, balance, identityAddress } = this.props
    const canMessageUser = origin.messaging.canConverse(address)

    return (
      <div className="wallet">
        <div className="d-flex">
          <div className="image-container">
            <Identicon address={address} />
          </div>
          <div className="eth d-flex flex-column justify-content-between">
            {address && 
              <div>
                <FormattedMessage
                  id={ '_Wallet.ethAddress' }
                  defaultMessage={ 'ETH Address:' }
                />
              </div>
            }
            <div className="address">
              {address ? 
                <EtherscanLink hash={address} /> :
                <FormattedMessage
                  id={ '_Wallet.noEthAccountConnected' }
                  defaultMessage={ 'No ETH Account Connected' }
                />
              }
            </div>
            {canMessageUser &&
              <a href="#" className="contact" onClick={this.handleToggle}>Contact</a>
            }
          </div>
        </div>
        {balance &&
          <Fragment>
            <hr className="dark sm" />
            <div className="detail d-flex">
              <div>
                <FormattedMessage
                  id={ '_Wallet.accountBalance' }
                  defaultMessage={ 'Account Balance:' }
                />
              </div>
              <div>
                <FormattedMessage
                  id={ '_Wallet.ethBalance' }
                  defaultMessage={ '{balance} ETH' }
                  values={{ balance: <FormattedNumber value={ balance } /> }}
                />
              </div>
            </div>
          </Fragment>
        }
        {/* Hidden for current deployment */}
        {/*<div className="detail d-flex">
          <div>Transaction History:</div>
          <div>
            <a onClick={() => alert('To do')}>ETH</a> | <a onClick={() => alert('To do')}>Tokens</a>
          </div>
        </div>*/}
        {/* Hidden for current deployment */}
        {/* identityAddress &&
          <div>
            <a href={`https://erc725.originprotocol.com/#/identity/${identityAddress}`} target="_blank">Identity Contract Detail</a>
          </div>
        */}
        {canMessageUser &&
          <MessageNew
            open={this.state.modalOpen}
            recipientAddress={address}
            handleToggle={this.handleToggle}
          />
        }
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    // for reactivity
    messagingEnabled: state.app.messagingEnabled,
  }
}

export default connect(mapStateToProps)(Wallet)
