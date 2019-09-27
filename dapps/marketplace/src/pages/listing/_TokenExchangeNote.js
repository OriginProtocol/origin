import React from 'react'

import { fbt } from 'fbt-runtime'

const TokenExchangeNote = () => {
  // As of now, only ETH to DAI is possible.
  return (
    <div className="token-exchange-note">
      <fbt desc="paymentOptions.swapEthToDai">
        ETH, of equivalent value, in your wallet will be converted to DAI.
      </fbt>
    </div>
  )
}

export default TokenExchangeNote

require('react-styl')(`
  .token-exchange-note
    text-align: center
    padding: 1.25rem
    background-color: #f3f7f9
    border: solid 1px #eaf0f3
    border-radius: 10px
    font-size: 18px
    margin: 1.5rem 0
  @media (max-width: 767.98px)
    .token-exchange-note
      margin-left: -15px
      margin-right: -15px
`)
