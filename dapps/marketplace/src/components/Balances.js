import React from 'react'
import { fbt } from 'fbt-runtime'

import Price from 'components/Price'
import withWalletBalances from 'hoc/withWalletBalances'
import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'

const Balances = ({ currencies, title, className, onClose }) => {
  const EnrollButton = withEnrolmentModal('button')

  const titleEl = title || (
    <fbt desc="Balances.account-balance">Account Balance</fbt>
  )

  return (
    <div className={`balances${className ? ` ${className}` : ''}`}>
      <h5>{titleEl}</h5>
      {currencies.map(c => (
        <div className={`account ${c.code.toLowerCase()}`} key={c.id}>
          <div>
            <div className="name">{c.name}</div>
            <div className="fiat">
              {c.id === 'token-OGN' ? (
                `${c.balance} OGN`
              ) : (
                <Price price={{ amount: c.balance, currency: c.id }} />
              )}
            </div>
          </div>
          <div>
            <div className="symbol">{c.code}</div>
            <div className="balance">
              {c.id !== 'token-OGN' ? (
                `${c.balance} ${c.code}`
              ) : (
                <EnrollButton
                  className="more-ogn"
                  onClose={onClose}
                  onNavigation={onClose}
                  goToWelcomeWhenNotEnrolled="true"
                >
                  <fbt desc="Balances.getMoreOGN">Get more</fbt>
                </EnrollButton>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default withWalletBalances(Balances, [
  'token-ETH',
  'token-DAI',
  'token-OGN'
])

require('react-styl')(`
  .balances
    h5
      margin: 0.5rem 0 1rem
    .account
      padding-left: 2rem
      position: relative
      margin-bottom: 1.25rem
      &:last-of-type
        margin-bottom: 0
      &:before
        content: ""
        position: absolute
        left: 0
        top: 6px
        display: block
        width: 1.5rem
        height: 1.5rem
        background: url(images/eth-icon.svg) no-repeat center
        background-size: cover
      &.dai:before
        background-image: url(images/dai-icon.svg)
      &.ogn:before
        background-image: url(images/ogn-icon.svg)
      > div
        font-weight: normal
        display: flex
        justify-content: space-between
        &:nth-child(1)
          font-size: 14px
        &:nth-child(2)
          color: var(--steel)
          font-size: 10px
        .fiat
          font-weight: bold
      .more-ogn
        background: url(images/growth/blue-add-icon.svg) no-repeat 0px 3px
        background-size: 9px
        padding: 0 0 0 12px
        color: var(--steel)
        border: 0

`)
