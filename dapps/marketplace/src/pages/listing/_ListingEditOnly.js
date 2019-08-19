import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import Price from 'components/Price'
import tokenPrice from 'utils/tokenPrice'
import CoinLogo from 'components/CoinLogo'
import Exposure from 'components/ListingExposure'

import withWallet from 'hoc/withWallet'
import withTokenBalance from 'hoc/withTokenBalance'

const SingleUnitCommission = ({ listing }) => (
  <>
    <div className="row">
      <div>
        <fbt desc="listing.commissionPerUnit">Commission</fbt>
      </div>
      <div>
        <CoinLogo coin="ogn" />
        {tokenPrice(listing.commissionPerUnit)}
      </div>
    </div>
  </>
)

const MultiUnitCommission = ({ listing }) => (
  <>
    <div className="row">
      <div>
        <fbt desc="listing.commissionPerUnit">Commission per Unit</fbt>
      </div>
      <div>
        <CoinLogo coin="ogn" />
        {tokenPrice(listing.commissionPerUnit)}
      </div>
    </div>
    <div className="row">
      <div>
        <fbt desc="listing.totalCommissionBudget">Total Budget</fbt>
      </div>
      <div>
        <CoinLogo coin="ogn" />
        {tokenPrice(listing.commission)}
      </div>
    </div>
    <div className="row">
      <div>
        <fbt desc="listing.totalCommissionBudgetRemaining">
          Total Budget Remaining
        </fbt>
      </div>
      <div>
        <CoinLogo coin="ogn" />
        {tokenPrice(listing.depositAvailable)}
      </div>
    </div>
  </>
)

const PromoteCTACmp = ({ listing, tokenBalance }) => (
  <div className="promote-listing-cta">
    <h6>
      <fbt desc="PromoteListing.promoteCta">Promote your listing with</fbt>
      <CoinLogo coin="ogn" />
      <span>OGN</span>
    </h6>
    <div>
      <fbt desc="PromoteListing.moreExposure">
        Get more exposure and sell faster.
      </fbt>
    </div>

    {tokenBalance ? (
      <Link
        className="btn btn-primary btn-rounded"
        to={`/promote/${listing.id}`}
        children={fbt('Promote Now', 'PromoteListing.promoteNow')}
      />
    ) : (
      <Link
        to="/about/tokens"
        className="listing-action-link"
        children={fbt('How to get OGN', 'PromoteListing.promoteNow')}
      />
    )}
  </div>
)

const PromoteCTA = withWallet(withTokenBalance(PromoteCTACmp))

const Commission = ({ listing }) => {
  if (window.localStorage.promoteEnabled !== 'true') {
    return null
  }

  if (listing.commissionPerUnit === '0') {
    return <PromoteCTA listing={listing} />
  }

  return (
    <>
      <div className="listing-buy-editonly mt-3 listing-commission">
        {listing.__typename !== 'UnitListing' || listing.multiUnit ? (
          <MultiUnitCommission listing={listing} />
        ) : (
          <SingleUnitCommission listing={listing} />
        )}
        <div className="row">
          <div>
            <fbt desc="listing.exposure">Listing Exposure</fbt>
          </div>
          <div>
            <Exposure listing={listing} />
          </div>
        </div>
      </div>

      <Link
        className="listing-action-link"
        to={`/promote/${listing.id}/amount`}
        children={fbt('Edit Commisison', 'listing.editCommission')}
      />
    </>
  )
}

const EditOnly = ({
  listing,
  isAnnouncement,
  isFractional,
  isFractionalHourly,
  isSingleUnit,
  isService
}) => (
  <div className="listing-buy">
    {isAnnouncement ? null : (
      <div className="price">
        <Price listing={listing} descriptor />
      </div>
    )}
    {isSingleUnit && listing.status === 'pending' ? (
      <div className="status">
        <div className="status-title">
          <fbt desc="Pending">Pending</fbt>
        </div>
        <div className="status-text">
          <fbt desc="UnitListing.offerMadeOnListing">
            An offer has been made on this listing
          </fbt>
        </div>
      </div>
    ) : null}
    {isFractional ||
    isFractionalHourly ||
    isAnnouncement ||
    isSingleUnit ? null : (
      <div className="listing-buy-editonly">
        <div className="row">
          <div>
            <fbt desc="number of units that have been sold">Sold</fbt>
          </div>
          <div>{listing.unitsSold}</div>
        </div>
        <div className="row">
          <div>
            <fbt desc="number of units whose transaction are pending">
              Pending
            </fbt>
          </div>
          <div>{listing.unitsPending}</div>
        </div>
        {isService ? null : (
          <div className="row">
            <div>
              <fbt desc="number of units available">Available</fbt>
            </div>
            <div>{listing.unitsAvailable}</div>
          </div>
        )}
      </div>
    )}
    <Link
      className="listing-action-link"
      to={`/listing/${listing.id}/edit`}
      children={fbt('Edit listing', 'EditListing')}
    />

    <Commission listing={listing} />
  </div>
)

export default EditOnly

require('react-styl')(`
  .listing-buy
    .listing-buy-editonly
      padding: 1rem 0 0 0
      border-top: 1px solid #dde6ea
      .row
        margin-bottom: 1rem
        font-size: 18px
        &:last-child
          margin-bottom: 0
        > div:nth-child(1)
          flex: 1
          padding-left: 1rem
        > div:nth-child(2)
          flex: 1
          text-align: right
          padding-right: 1rem
          font-weight: bold
    .promote-listing-cta
      border: 1px solid #eaf0f3
      background-color: #f3f7f9
      text-align: center
      margin: 1rem 0 1rem 0
      padding: 1rem
      font-size: 18px
      .btn
        margin: 1.25rem 0 0.5rem 0
      h6
        font-size: 20px
        font-weight: 900
        span
          color: #007fff
        .coin-logo
          margin-left: 0.5rem
          vertical-align: -1px

  @media (max-width: 767.98px)
    .listing-buy
      .promote-listing-cta
        margin: 1rem -1rem 1rem -1rem
        border-width: 1px 0

`)
