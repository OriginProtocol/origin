import React from 'react'
import { fbt } from 'fbt-runtime'

import CoinPrice from 'components/CoinPrice'
import Price from 'components/Price'
import Tooltip from 'components/Tooltip'

import numberFormat from 'utils/numberFormat'

const WarningIcon = ({ tooltip }) => (
  <Tooltip tooltip={tooltip} placement="top">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="21"
      viewBox="0 0 22 21"
      className="warning-icon"
    >
      <path
        fill="#F4C110"
        d="M11 17.646a1.146 1.146 0 1 1 0-2.293 1.146 1.146 0 0 1 0 2.293zm-.917-3.896h1.834V7.333h-1.834v6.417zM11 0L0 20.167h22L11 0z"
      />
    </svg>
  </Tooltip>
)

function escrowStatus(status) {
  return status.match(/accepted|disputed|pending/i)
    ? fbt('Held', 'EscrowDetails.held')
    : fbt('Released', 'EscrowDetails.released')
}

const EscrowDetails = ({ offer }) => (
  <ul className="escrow-details list-unstyled">
    <li className="escrow-amount">
      <span>
        <fbt desc="EscrowDetails.amount">Amount</fbt>
      </span>
      <span>
        {offer.totalPrice.currency.id.match('DAI') && (
          <>
            <CoinPrice iconOnly coin="dai" />
            {numberFormat(offer.totalPrice.amount, 2)}
            &nbsp;
            {'DAI'}
          </>
        )}
        {offer.totalPrice.currency.id.match('ETH') && (
          <>
            <CoinPrice iconOnly coin="eth" />
            {numberFormat(offer.totalPrice.amount, 5)}
            &nbsp;
            {'ETH'}
          </>
        )}
      </span>
    </li>
    <li className="escrow-value">
      <span>
        <fbt desc="EscrowDetails.value">Current Value</fbt>
        {offer.totalPrice.currency.id.match('ETH') && (
          <WarningIcon
            tooltip={fbt(
              'Ether is highly volatile and it’s value can change significantly in a short period of time.',
              'EscrowDetails.volatility'
            )}
          />
        )}
      </span>
      <span>
        <Price price={offer.totalPrice} />
      </span>
    </li>
    <li className="escrow-status">
      <span>
        <fbt desc="EscrowDetails.status">Status</fbt>
      </span>
      <span>{escrowStatus(offer.statusStr)}</span>
    </li>
  </ul>
)

export default EscrowDetails

require('react-styl')(`
  .escrow-details
    background: var(--pale-grey-eight)
    border-radius: var(--default-radius)
    font-size: 18px
    font-weight: normal
    padding: 1rem 1.5rem
    li
      display: flex;
      justify-content: space-between;
      padding: 0.375rem 0 0.375rem 1.25rem
      span:nth-child(1)
        color: var(--dusk)
      span:nth-child(2)
        color: #000
        span
          color: #000
      background-position: left center
      background-repeat: no-repeat
      background-size: 0.75rem
      &.escrow-amount
        background-image: url(images/order/price-unit-icon.svg)
      &.escrow-value
        background-image: url(images/order/total-price-icon.svg)
        .warning-icon
          margin-left: 0.5rem
          vertical-align: sub
      &.escrow-status
        background-image: url(images/order/escrow-status-icon.svg)

`)
