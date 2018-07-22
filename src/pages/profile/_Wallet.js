import React, { Component } from 'react'
import { FormattedMessage, FormattedNumber } from 'react-intl'

import EtherscanLink from 'components/etherscan-link'
import Identicon from 'components/Identicon'

class Wallet extends Component {
  render() {
    const { address, balance, identityAddress } = this.props

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
          </div>
        </div>
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
      </div>
    )
  }
}

export default Wallet
