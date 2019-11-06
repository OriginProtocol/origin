import React, { useCallback } from 'react'
import { fbt } from 'fbt-runtime'

import AcceptedTokenListItem from 'components/AcceptedTokenListItem'

const PricingChooser = ({ value: selectedTokens, onChange, children }) => {
  const toggleCurrencies = useCallback(
    token => {
      let newValue

      if (selectedTokens.includes(token)) {
        // Deselect if already selected
        newValue = selectedTokens.filter(t => t !== token)
      } else {
        // Select if not already selected
        newValue = [...selectedTokens, token]
      }

      onChange(newValue)
    },
    [selectedTokens]
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
          selected={selectedTokens.includes('token-ETH')}
          onSelect={toggleCurrencies}
        />
        <AcceptedTokenListItem
          token="token-DAI"
          selected={selectedTokens.includes('token-DAI')}
          onSelect={toggleCurrencies}
        />
        <AcceptedTokenListItem
          token="token-OGN"
          selected={selectedTokens.includes('token-OGN')}
          onSelect={toggleCurrencies}
        />
        {(process.env.NODE_ENV === 'test' ||
          process.env.ENABLE_OKB === 'true') && (
          <AcceptedTokenListItem
            token="token-OKB"
            selected={selectedTokens.includes('token-OKB')}
            onSelect={toggleCurrencies}
          />
        )}
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
