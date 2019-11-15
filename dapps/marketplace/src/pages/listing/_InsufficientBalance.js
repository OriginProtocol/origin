import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const tokenToMessageMap = {
  'token-ETH': (
    <fbt desc="InsufficientBalance.notEnoughETH">Not enough Ethereum</fbt>
  ),
  'token-DAI': (
    <fbt desc="InsufficientBalance.notEnoughDAI">Not enough DAI</fbt>
  ),
  'token-OGN': (
    <fbt desc="InsufficientBalance.notEnoughOGN">Not enough Origin Tokens</fbt>
  ),
  'token-OKB': (
    <fbt desc="InsufficientBalance.notEnoughOKB">
      Not enough OKB Tokens.{' '}
      <a
        href="https://www.okex.com/activities/pro/okb"
        target="_blank"
        rel="noopener noreferrer"
      >
        Get More
      </a>
    </fbt>
  ),
  'token-USDT': (
    <fbt desc="InsufficientBalance.notEnoughUSDT">Not enough Tether</fbt>
  ),
  generic: (
    <fbt desc="InsufficientBalance.notEnoughBalance">Not enough balance</fbt>
  )
}

const InsufficientBalance = ({ token }) => {
  const message = tokenToMessageMap[token] || tokenToMessageMap.generic

  return (
    <div className="insufficient-token-balance">
      {message}
      <Link className="tokens-link" to="/about/crypto">
        <fbt desc="InsufficientBalance.howToGetCrypto">
          Where can I get some?
        </fbt>
      </Link>
    </div>
  )
}

export default InsufficientBalance

require('react-styl')(`
  .insufficient-token-balance
    text-align: center
    margin: 1.5rem 0
    font-size: 18px
    color: #ff0000
    margin: 2.5rem 0 1.5rem 0
    font-weight: bold
    .tokens-link
      display: block
      margin-top: 0.5rem
      &:after
        content: '>'
        padding-left: 0.5rem
`)
