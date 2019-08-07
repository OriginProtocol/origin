import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

import Exposure from 'components/ListingExposure'

const Success = ({ match, listing }) => (
  <>
    <h1>
      <Link to={'/'} className="back d-md-none" />
      <fbt desc="PromoteListing.title">Promote Listing</fbt>
    </h1>
    <div className="success">
      <h4>Success!</h4>
      <div>You&apos;ve successfully promoted your listing.</div>
      <div className="summary">
        <div>
          <div>Commission per Sale:</div>
          <div>{`${listing.amount} OGN`}</div>
        </div>
        <div>
          <div>Total Budget:</div>
          <div>{`${listing.budget} OGN`}</div>
        </div>
        <div>
          <div>Listing Exposure:</div>
          <div>
            <Exposure listing={listing} />
          </div>
        </div>
      </div>
      <div className="actions">
        <Link
          to={`/listing/${match.params.listingId}`}
          className="btn btn-primary btn-rounded btn-lg"
        >
          View My Listing
        </Link>
      </div>
    </div>
  </>
)

export default Success

require('react-styl')(`
  .promote-listing
    .success
      display: flex
      flex-direction: column
      align-items: center
      text-align: center
      min-height: calc(100vh - 8rem)
      justify-content: space-around
      font-weight: 300
      font-size: 18px
      padding: 0 1rem
      &:before
        content: ""
        width: 6rem
        height: 6rem
        border-radius: 50%
        background: green
      h4
        margin: 0
        font-size: 20px
        font-weight: bold
      .summary
        border-radius: 10px
        border: solid 1px #eaf0f3
        background-color: #f3f7f9
        padding: 1rem 1.5rem
        > div
          display: flex
          justify-content: space-between
          &:not(:last-child)
            margin-bottom: 0.5rem
          > div:nth-child(1)
            margin-right: 1rem
`)
