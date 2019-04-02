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
            <Price price={{ amount: ethBalance, currency: 'token-ETH' }} />
          </div>
        </div>
      </div>
      <div className="account dai justify-content-between">
        <div className="d-flex">
          <div className="icon" />
          <div className="balance">
            <div className="coin dai">
              <TokenBalance account={account} token="DAI" />
              <span>DAI</span>
            </div>
          </div>
        </div>
        {/* <div className="actions">
          <button className="btn btn-outline-primary">Activate</button>
          <button className="btn btn-outline-primary">Get</button>
        </div> */}
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
            children={fbt('Get Started', 'Get Started')}
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
      &.dai .icon
        background-image: url(images/dai-icon.svg)
      .actions
        display: flex
        flex-direction: row
        .btn
          margin-left: 0.5rem
          height: 24px
          padding: 0 0.25rem 0 0
          border-radius: 1rem
          font-weight: normal
          font-size: 12px
          display: flex
          align-items: center
          &::before
            content: "";
            background: url(images/growth/blue-add-icon.svg) no-repeat;
            width: 1rem;
            height: 1rem;
            display: inline-block;
            background-size: contain;
            margin: 0 0.25rem;
          &:hover::before
            background-image: url(images/add-icon-white.svg)
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
          &.dai > span
            color: #fec102
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
