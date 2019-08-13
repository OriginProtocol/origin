import React from 'react'
import { fbt } from 'fbt-runtime'

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

const PricingChooser = ({ value, onChange, children }) => {
  return (
    <div className="pricing-chooser">
      {children}
      <div className="form-group accepted-currencies">
        <label>
          <fbt desc="pricingChooser.acceptedCurrenciesHeading">
            Accepted Cryptocurrencies
          </fbt>
        </label>
        <div
          className={`currency${
            value.indexOf('token-DAI') >= 0 ? '' : ' disabled'
          }`}
          onClick={() => {
            const newVal =
              value.indexOf('token-DAI') >= 0
                ? value.filter(v => v != 'token-DAI')
                : [...value, 'token-DAI']
            onChange(newVal.length ? newVal : ['token-ETH'])
          }}
        >
          <CoinLogo coin="dai" className="lg" />
          <div className="name">
            Maker Dai<div className="symbol">DAI</div>
          </div>

          <HelpIcon
            tooltip={fbt(
              'Maker Dai is good for long term listings like rentals or property sales.',
              'PricingChooser.maker'
            )}
          />
        </div>
        <div
          className={`currency${
            value.indexOf('token-ETH') >= 0 ? '' : ' disabled'
          }`}
          onClick={() => {
            const newVal =
              value.indexOf('token-ETH') >= 0
                ? value.filter(v => v != 'token-ETH')
                : [...value, 'token-ETH']
            onChange(newVal.length ? newVal : ['token-DAI'])
          }}
        >
          <CoinLogo coin="eth" className="lg" />
          <div className="name">
            Ethereum <div className="symbol">ETH</div>
          </div>
          <HelpIcon
            tooltip={fbt(
              'Ether is good for short term listings.',
              'pricingChooser.ether'
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default PricingChooser

require('react-styl')(`
  .create-listing
    .listing-step
      .pricing-chooser
        .accepted-currencies
          label
            margin-bottom: 1.5rem
        .currency
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
            opacity: 0.4
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
  svg.help-icon
    path
      fill: var(--bluey-grey)
    &:hover path
      fill: var(--dark-grey-blue)

`)
