import React from 'react'

import CoinPrice from 'components/CoinPrice'
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
    <div className="form-group">
      <label>Payment</label>
      <div className="pricing-chooser">
        {children}
        <div className="form-group accepted-currencies">
          <label className="mb-0">Accepted Cryptocurrencies</label>
          <div className="help-text price mt-0">
            Buyers will be able to purchase your listing using either of these
            currencies if you select both.
          </div>
          <div className="custom-control custom-checkbox">
            <input
              className="custom-control-input"
              type="checkbox"
              id="dai-checkbox"
              checked={value.indexOf('token-DAI') >= 0}
              onChange={() => {
                const newVal =
                  value.indexOf('token-DAI') >= 0
                    ? value.filter(v => v != 'token-DAI')
                    : [...value, 'token-DAI']
                onChange(newVal.length ? newVal : ['token-ETH'])
              }}
            />
            <label className="custom-control-label" htmlFor="dai-checkbox">
              <CoinPrice coin="dai" iconOnly className="lg" />
              Maker Dai (DAI)
            </label>
            <div className="help-text">Stable but less buyers</div>
            <HelpIcon tooltip="Maker Dai is good for long term listings like rentals or property sales." />
          </div>
          <div className="custom-control custom-checkbox">
            <input
              className="custom-control-input"
              type="checkbox"
              id="eth-checkbox"
              checked={value.indexOf('token-ETH') >= 0}
              onChange={() => {
                const newVal =
                  value.indexOf('token-ETH') >= 0
                    ? value.filter(v => v != 'token-ETH')
                    : [...value, 'token-ETH']
                onChange(newVal.length ? newVal : ['token-DAI'])
              }}
            />
            <label className="custom-control-label" htmlFor="eth-checkbox">
              <CoinPrice coin="eth" iconOnly className="lg" />
              Ether (ETH)
            </label>
            <div className="help-text">Volatile but more buyers</div>
            <HelpIcon tooltip="Ether is good for short term listings." />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingChooser

require('react-styl')(`
  .create-listing .create-listing-step-2 .pricing-chooser
    border: solid 1px var(--light)
    background-color: #f4f6f7
    border-radius: 5px
    padding: 1rem
    .accepted-currencies .custom-checkbox
      display: flex
      align-items: center
      margin-bottom: 0.5rem
      label
        color: #000
        margin-bottom: 0
        &::before
          width: 1.25rem
          height: 1.25rem
        &::after
          width: 1.25rem
          height: 1.25rem
      .coin-price
        margin-left: 0.375rem
        margin-right: 0.125rem
      .help-text
        display: inline-block
        color: var(--bluey-grey)
        margin: 0 0 0 0.5rem
      .help-icon
        margin-left: auto
  svg.help-icon
    path
      fill: var(--bluey-grey)
    &:hover path
      fill: var(--dark-grey-blue)

`)
