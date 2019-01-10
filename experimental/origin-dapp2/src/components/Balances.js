import React from 'react'

import TokenBalance from 'components/TokenBalance'
import Price from 'components/Price'

const Balances = ({ balance, account }) => (
  <div className="balances">
    <h5>Account Balance</h5>
    <div className="account eth">
      <div className="icon" />
      <div className="balance">
        <div className="coin">
          {balance.eth}
          <span>ETH</span>
        </div>
        <div className="usd">
          <Price amount={balance.eth} />
        </div>
      </div>
    </div>
    <div className="account ogn">
      <div className="icon" />
      <div className="balance">
        <div className="coin">
          <TokenBalance account={account} token="OGN" />
          <span>OGN</span>
        </div>
        <div className="usd">0.00 USD</div>
      </div>
    </div>
  </div>
)

export default Balances

require('react-styl')(`
  .balances
    .account
      display: flex
      margin-bottom: 1rem
      margin-top: 0.75rem
      &:last-child
        margin-bottom: 0
      .icon
        width: 1.5rem
        height: 1.5rem
        background: url(images/eth-icon.svg) no-repeat center
        background-size: cover
        margin-right: 0.5rem
      &.ogn .icon
        background-image: url(images/ogn-icon.svg)
      .balance
        font-weight: bold
        .coin
          font-size: 24px
          line-height: 24px
          > span
            color: var(--dark-purple)
            font-size: 10px
            margin-left: 0.25rem
        .usd
          font-size: 10px
          line-height: 10px
          color: var(--steel)
          letter-spacing: 0.8px
`)
