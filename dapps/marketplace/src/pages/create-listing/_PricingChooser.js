import React, { useCallback } from 'react'
import { fbt } from 'fbt-runtime'

import AcceptedTokenListItem from 'components/AcceptedTokenListItem'

import supportedTokens from '@origin/graphql/src/utils/supportedTokens'

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
        {
          supportedTokens.map(tokenId => (
            <AcceptedTokenListItem
              key={tokenId}
              token={tokenId}
              selected={selectedTokens.includes(tokenId)}
              onSelect={toggleCurrencies}
            />
            
          ))
        }
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
