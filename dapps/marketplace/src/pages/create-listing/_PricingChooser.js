import React, { useCallback } from 'react'
import { fbt } from 'fbt-runtime'

import AcceptedTokenListItem from 'components/AcceptedTokenListItem'

const PricingChooser = ({ value, onChange, children }) => {
  const toggleCurrencies = useCallback(
    token => {
      let newValue

      if (value.includes(token)) {
        // Deselect if already selected
        newValue = value.filter(t => t !== token)
        if (!newValue.length) {
          // The default currency
          newValue.push('token-ETH')
        }
      } else {
        // Select if not already selected
        newValue = [...value, token]
      }

      onChange(newValue)
    },
    [value]
  )

  return (
    <div className="pricing-chooser">
      {children}
      <div className="form-group accepted-currencies">
        <label>
          <fbt desc="pricingChooser.acceptedCurrenciesHeading">
            Accepted Cryptocurrencies
          </fbt>
        </label>
        <AcceptedTokenListItem
          token="token-ETH"
          selected={value.includes('token-ETH')}
          onSelect={toggleCurrencies}
        />
        <AcceptedTokenListItem
          token="token-DAI"
          selected={value.includes('token-DAI')}
          onSelect={toggleCurrencies}
        />
        <AcceptedTokenListItem
          token="token-OGN"
          selected={value.includes('token-OGN')}
          onSelect={toggleCurrencies}
        />
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
  svg.help-icon
    path
      fill: var(--bluey-grey)
    &:hover path
      fill: var(--dark-grey-blue)
`)
