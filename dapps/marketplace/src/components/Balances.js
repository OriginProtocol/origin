import React from 'react'
import { fbt } from 'fbt-runtime'

import TokenBalance from 'components/TokenBalance'
import Price from 'components/Price'
import withEthBalance from 'hoc/withEthBalance'
import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'

const Balances = ({ ethBalance, account }) => {
  const EnrollButton = withEnrolmentModal('button')
  const enableGrowth = process.env.ENABLE_GROWTH === 'true'

  return (
    <div className="balances">
      <h5>
        <fbt desc="Balances.account-balance">Account Balance</fbt>
      </h5>
      <div className="account eth">
        <div className="icon" />
        <div className="balance">
          <div className="coin">
            {ethBalance}
            <span>ETH</span>
          </div>
          <div className="usd">
            <Price amount={ethBalance} />
          </div>
        </div>
      </div>
      <div className="account ogn d-flex justify-content-between">
        <div className="d-flex">
          <div className="icon" />
          <div className="balance">
            <div className="coin ogn">
              <TokenBalance account={account} token="OGN" />
              <span>OGN</span>
            </div>
          </div>
        </div>
        {!enableGrowth ? null : (
          <EnrollButton
            className="btn get-ogn d-flex"
            skipjoincampaign="false"
          >
            <img src="images/growth/blue-add-icon.svg" />
          </EnrollButton>
        )}
      </div>
    </div>
  )
}

export default withEthBalance(Balances)

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
          &.ogn > span
            color: #007bff
        .usd
          font-size: 10px
          line-height: 10px
          color: var(--steel)
          letter-spacing: 0.8px
      .get-ogn
        font-weight: bold
        font-size: 12px
        color: var(--clear-blue)
        border: solid 1px var(--clear-blue)
        border-radius: 15px
        padding: 0px 2px
        height: 26px
        .value
          padding-top: 1px
`)
