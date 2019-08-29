import React, { useState } from 'react'

import { fbt } from 'fbt-runtime'

import queryString from 'query-string'

import withIdentity from 'hoc/withIdentity'
import withEnrolmentStatus from 'hoc/withEnrolmentStatus'

import Link from 'components/Link'
import Redirect from 'components/Redirect'
import UserActivationLink from 'components/UserActivationLink'

const SignUpForRewards = withIdentity(({ identity }) => {
  const LinkComponent = identity ? Link : UserActivationLink

  const destination = { pathname: '/campaigns' }

  return (
    <div className="listing-card rewards-signup-card">
      <LinkComponent to={destination} location={destination}>
        <div className="main-pic">
          <div>
            <fbt desc="listingCard.earnTokens">
              Earn
              <span>Origin Tokens</span>
            </fbt>
          </div>
        </div>
      </LinkComponent>
      <h5>
        <fbt desc="listingCard.earnTokens.from">From the Origin Team</fbt>
      </h5>
    </div>
  )
})

const BuyListingsForRewards = () => {
  const [shouldRedirect, setShouldRedirect] = useState(false)

  if (shouldRedirect) {
    return (
      <Redirect
        to={{
          pathname: '/search',
          search: queryString.stringify({
            ognListings: true
          })
        }}
      />
    )
  }
  return (
    <div className="listing-card earn-tokens-card">
      <div
        className="main-pic"
        onClick={() => {
          setShouldRedirect(true)
        }}
      >
        <div>
          <h3>
            <fbt desc="listingCard.buyAndEarn">
              Buy stuff &amp; earn tokens!
            </fbt>
          </h3>
        </div>
      </div>
    </div>
  )
}

const EarnTokensCard = ({ growthEnrollmentStatus, ...props }) => {
  if (growthEnrollmentStatus === 'Enrolled') {
    // Show Enrolled Card
    return <BuyListingsForRewards />
  }

  return <SignUpForRewards {...props} />
}

export default withEnrolmentStatus(EarnTokensCard)

require('react-styl')(`
  .listing-card
    &.rewards-signup-card, &.earn-tokens-card
      .main-pic
        text-align: center
        position: relative
        background-color: var(--clear-blue)
        > div
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
      h5
        color: #94a7b5
    &.earn-tokens-card
      .main-pic
        background-color: #283f55
        > div
          padding: 0
          border-radius: 10px
          overflow: hidden
          &:before
            background-image: url('images/growth/buy-promo-graphic.svg')
            background-position: bottom
            background-size: cover
          h3
            font-family: var(--heading-font)
            font-weight: bold
            font-size: 18px
  @media (max-width: 767.98px)
    .listing-card.earn-tokens-card
      .main-pic > div
        &:before
          position: absolute
          background-position: top
          background-size: contain
          top: 0
          bottom: 0
          right: 0
          left: 0
          margin: 0 10px
        h3
          position: absolute
          bottom: 0
          left: 0
          right: 0
          margin-bottom: 0.5rem
          padding: 0 20px
          font-size: 14px
          line-height: 1

`)
