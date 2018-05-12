import React, { Component } from 'react'

import Identicon from 'components/Identicon'

class Wallet extends Component {
  render() {
    var address = this.props.address

    return (
      <div className="wallet">
        <div className="d-flex">
          <div className="image-container">
            <Identicon address={this.props.address} />
          </div>
          <div className="eth d-flex flex-column justify-content-between">
            <div>ETH Address:</div>
            <div className="address">
              <strong>{address}</strong>
            </div>
          </div>
        </div>
        <hr className="dark sm" />
        <div className="detail d-flex">
          <div>Account Balance:</div>
          <div>{this.props.balance} ETH</div>
        </div>
        <div className="detail d-flex">
          <div>Transaction History:</div>
          <div>
            <a onClick={() => alert('To do')}>ETH</a> | <a onClick={() => alert('To do')}>Tokens</a>
          </div>
        </div>
      </div>
    )
  }
}

export default Wallet
