import React, { Component } from 'react'

import Identicon from 'components/Identicon'

class Wallet extends Component {
  render() {
    var address = this.props.address,
        fullLen = address.length,
        len = address.length / 2

    return (
      <div className="wallet">
        <div className="d-flex">
          <div className="image-container">
            <Identicon address={this.props.address} />
          </div>
          <div className="eth">
            <p>ETH Address:</p>
            <p className="address">
              <strong>
                {address.slice(0, len)}<wbr />{address.slice(len, fullLen)}
              </strong>
            </p>
          </div>
        </div>
        <hr />
        <div className="detail d-flex">
          <p>Account Balance:</p>
          <p>{this.props.balance} ETH</p>
        </div>
        <div className="detail d-flex">
          <p>Transaction History:</p>
          <p>
            <a href="#">ETH</a> | <a href="#">Tokens</a>
          </p>
        </div>
      </div>
    )
  }
}

export default Wallet
