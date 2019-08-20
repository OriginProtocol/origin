import React, { useEffect } from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import CoinLogo from 'components/CoinLogo'

import Exposure from 'components/ListingExposure'

import Store from 'utils/store'
const store = Store('sessionStorage')

const Success = ({ match, listing, multiUnit }) => {
  useEffect(() => {
    store.set('create-listing', undefined)
  }, [true])

  const hasBudget = multiUnit || listing.__typename !== 'UnitListing'

  return (
    <>
      <h1>
        <Link to={'/'} className="back d-md-none" />
        <fbt desc="PromoteListing.title">Promote Listing</fbt>
      </h1>
      <div className="success">
        <h4>
          <fbt desc="Success!">Success!</fbt>
        </h4>
        <div>
          <fbt desc="PromoteListing.promoted">
            You&apos;ve successfully promoted your listing.
          </fbt>
        </div>
        <div className="summary">
          {hasBudget ? (
            <>
              <div>
                <div>
                  <fbt desc="PromoteListing.commissionPerUnit">
                    Commission per Unit Sold
                  </fbt>
                </div>
                <div>
                  <CoinLogo coin="ogn" />
                  {listing.commissionPerUnit}
                </div>
              </div>
              <div>
                <div>
                  <fbt desc="PromoteListing.totalBudget">Total Budget</fbt>
                </div>
                <div>
                  <CoinLogo coin="ogn" />
                  {listing.commission}
                </div>
              </div>
            </>
          ) : (
            <div>
              <div>
                <fbt desc="PromoteListing.commissionAmount">
                  Commission Amount
                </fbt>
              </div>
              <div>
                <CoinLogo coin="ogn" />
                {listing.commissionPerUnit}
              </div>
            </div>
          )}
          <div>
            <div>
              <fbt desc="PromoteListing.listingExposure">Listing Exposure</fbt>
            </div>
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
            <fbt desc="CreateListing.ViewListing">View My Listing</fbt>
          </Link>
          <Link className="btn btn-primary btn-rounded btn-lg" to={`/create`}>
            <fbt desc="CreateListing.CreateAnotherListing">
              Create Another Listing
            </fbt>
          </Link>
        </div>
      </div>
    </>
  )
}

export default Success

require('react-styl')(`
  .promote-listing
    .success
      display: flex
      flex-direction: column
      align-items: center
      text-align: center
      min-height: calc(100vh - 8rem)
      font-weight: 300
      font-size: 18px
      padding: 2.5rem 0 1rem 0
      &:before
        content: ""
        height: 6rem
        width: 6rem
        background: url(images/checkmark-icon-large.svg) no-repeat
        background-size: contain
        background-position: center
        display: block
      h4
        margin-bottom: 1rem
        font-size: 20px
        font-weight: bold
      .summary
        border-radius: 10px
        border: solid 1px #eaf0f3
        background-color: #f3f7f9
        padding: 1rem 1.5rem
        margin: 1rem -1rem
        width: 100%
        > div
          display: flex
          justify-content: space-between
          &:not(:last-child)
            margin-bottom: 0.5rem
          > div:nth-child(1)
            margin-right: 1rem
      .actions
        .btn
          margin: 0.75rem
  @media (max-width: 767.98px)
    .promote-listing
      .success
        .actions
          .btn
            margin: 0 0 0.75rem 0
`)
