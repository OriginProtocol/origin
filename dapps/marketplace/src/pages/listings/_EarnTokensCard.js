import React from 'react'

import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const EarnTokensCard = () => {
  return (
    <div className="earn-tokens-card">
      <Link to={'/campaigns'}>
        <div className="header">
          <h5>
            <fbt desc="listingCard.earnTokens">
              Earn
              <span>Origin Tokens</span>
            </fbt>
          </h5>
        </div>
      </Link>
      <div className="title">
        <fbt desc="listingCard.earnTokens.from">From the Origin Team</fbt>
      </div>
    </div>
  )
}

export default EarnTokensCard

require('react-styl')(`
  .earn-tokens-card
    .header
      text-align: center
      border-radius: 10px
      margin: 1rem 0
      padding-top: 75%
      position: relative
      background-color: var(--clear-blue)
      h5
        position: absolute
        bottom: 0
        left: 0
        right: 0
        top: 0
        font-size: 14px
        margin: auto 0
        color: var(--white)
        padding: 1rem 0
        display: flex
        flex-direction: column
        font-weight: bold
        span
          text-transform: uppercase
        &:before
          content: ''
          display: block
          background-image: url('images/growth/token-stack.svg')
          background-position: center
          background-size: contain
          background-repeat: no-repeat
          margin-bottom: 0.6rem
          flex: 1
    .title
      color: #94a7b5
      font-size: 14px

`)
