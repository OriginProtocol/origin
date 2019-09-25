import React from 'react'
import { fbt } from 'fbt-runtime'

import CoinLogo from 'components/CoinLogo'
import Tooltip from 'components/Tooltip'

const tokenToCoinLogoMap = {
  'token-ETH': 'eth',
  'token-DAI': 'dai',
  'token-OGN': 'ogn'
}

const HelpIcon = ({ tooltip }) => (
  <Tooltip tooltip={tooltip} placement="top">
    <svg width="21" height="21" viewBox="0 0 21 21" className="help-icon">
      <path
        fillRule="evenodd"
        d="M12.87 6.86c-.465.397-1.155.388-1.54-.019-.386-.406-.322-1.057.143-1.453.465-.396 1.155-.387 1.54.02.385.407.322 1.057-.143 1.453m-4.149 7.148c.494-1.566 1.428-3.44 1.593-3.915.24-.689-.184-.994-1.522.183l-.297-.56c1.525-1.66 4.668-2.036 3.598.536-.667 1.606-1.145 2.69-1.418 3.526-.398 1.22.607.725 1.592-.184.133.218.177.29.311.541-2.186 2.081-4.612 2.265-3.857-.127M10.5-.001C4.701 0 0 4.702 0 10.5 0 16.3 4.701 21 10.5 21S21 16.3 21 10.5C21 4.702 16.299 0 10.5 0"
      />
    </svg>
  </Tooltip>
)

/**
 * Returns the display name of tokens
 * @param {String} token Can be one of [token-ETH, token-DAI, token-OGN]
 */
function getTokenName(token) {
  switch (token) {
    case 'token-ETH':
      return <fbt desc="Ethereum">Ethereum</fbt>
    case 'token-DAI':
      return <fbt desc="MakerDai">Maker Dai</fbt>
    case 'token-OGN':
      return <fbt desc="Origin Token">Origin Token</fbt>
  }

  return null
}

/**
 * Returns tooltip content for the given token
 * @param {String} token Can be one of [token-ETH, token-DAI, token-OGN]
 */
function getTokenTooltip(token) {
  switch (token) {
    case 'token-ETH':
      return (
        <fbt desc="pricingChooser.ether">
          Ether is good for short term listings.
        </fbt>
      )
    case 'token-DAI':
      return (
        <fbt desc="pricingChooser.dai">
          Maker Dai is good for long term listings like rentals or property
          sales.
        </fbt>
      )
    case 'token-OGN':
      return <fbt desc="pricingChooser.ogn">Origin Token</fbt>
  }

  return null
}

function getTokenSymbol(token) {
  // token-ETH => ETH, token-DAI => token-OGN => OGN
  return token ? token.split('-').pop() : null
}

const AcceptedTokenListItem = ({ selected, onSelect, token, hideTooltip }) => {
  return (
    <div
      className={`accepted-token-list-item${
        selected ? ' active' : ' disabled'
      }`}
      onClick={() => onSelect(token)}
    >
      {tokenToCoinLogoMap[token] && (
        <CoinLogo coin={tokenToCoinLogoMap[token]} className="lg" />
      )}
      <div className="name">
        {getTokenName(token)}
        {` `}
        <div className="symbol">{getTokenSymbol(token)}</div>
      </div>
      {hideTooltip === true ? null : (
        <HelpIcon tooltip={getTokenTooltip(token)} />
      )}
    </div>
  )
}

export default AcceptedTokenListItem

require('react-styl')(`
  .accepted-token-list-item
    display: flex
    border: 1px solid #c0cbd4
    background: #eaf0f3
    padding: 0.5rem 1rem
    border-radius: 0.5rem
    font-size: 20px
    align-items: center
    cursor: pointer
    &:not(:last-child)
      margin-bottom: 0.5rem
    &.disabled
      background-color: white
      opacity: 1
      .coin-price
        filter: grayscale(100%)
    .name
      margin-right: auto
      display: flex
      align-items: baseline
      margin-left: 0.5rem
      .symbol
        font-size: 14px
        color: var(--bluey-grey)
        font-weight: bold
        margin-left: 0.5rem
`)
