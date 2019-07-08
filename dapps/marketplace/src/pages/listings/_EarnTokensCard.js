import React from 'react'

import { fbt } from 'fbt-runtime'
import { Query } from 'react-apollo'

import enrollmentStatusQuery from 'queries/EnrollmentStatus'

import withWallet from 'hoc/withWallet'
import Link from 'components/Link'

const EarnTokensCard = ({ wallet }) => {
  return (
    <Query
      query={enrollmentStatusQuery}
      variables={{
        walletAddress: wallet || '0xdummyAddress'
      }}
      // enrollment info can change, do not cache it
      fetchPolicy="network-only"
    >
      {({ error, data }) => {
        if (error) {
          console.error(error)
        }

        return (
          <div className="earn-tokens-card">
            <Link
              to={
                data && data.enrollmentStatus === 'Enrolled'
                  ? '/campaigns'
                  : '/welcome'
              }
            >
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
      }}
    </Query>
  )
}

export default withWallet(EarnTokensCard)

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
