import React from 'react'

import {
  getTokenName,
  getTokenSymbol,
  getTokenTooltip,
  tokenToCoinLogoMap
} from 'utils/tokenUtils'

import CoinLogo from 'components/CoinLogo'
import Tooltip from 'components/Tooltip'

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

const AcceptedTokenListItem = ({ selected, onSelect, token, hideTooltip }) => {
  return (
    <div className="accepted-token-list-item" onClick={() => onSelect(token)}>
      <div className={`token-info${selected ? ' active' : ' disabled'}`}>
        {tokenToCoinLogoMap[token] && (
          <CoinLogo coin={tokenToCoinLogoMap[token]} className="lg" />
        )}
        <div className="name">
          {getTokenName(token)}
          {` `}
          <div className="symbol">{getTokenSymbol(token)}</div>
        </div>
      </div>
      {hideTooltip === true ? null : (
        <div className="token-tooltip">
          <HelpIcon tooltip={getTokenTooltip(token)} />
        </div>
      )}
    </div>
  )
}

export default AcceptedTokenListItem

require('react-styl')(`
  .accepted-token-list-item
    display: flex
    align-items: center
    margin-bottom: 0.5rem
    .token-info
      display: flex
      flex: 1
      border: solid 1px #6a8296
      background-color: #eaf0f3
      padding: 0.5rem 1rem
      border-radius: 0.5rem
      font-size: 20px
      align-items: center
      cursor: pointer
      &.disabled
        background-color: white
        opacity: 1
        border-color: #c2cbd3
        .coin-price
          filter: grayscale(100%)
      &.active:after
        background-image: url('images/checkmark-blue.svg')
        background-size: 1.5rem
        background-repeat: no-repeat
        background-position: center
        display: inline-block
        width: 2rem
        content: ''
        height: 1.5rem
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
    .token-tooltip
      padding: 0 1rem
      display: flex
      align-items: center
`)
