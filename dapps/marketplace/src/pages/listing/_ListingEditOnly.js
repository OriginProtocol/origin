import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import Price from 'components/Price'
import tokenPrice from 'utils/tokenPrice'
import CoinLogo from 'components/CoinLogo'
import Exposure from 'components/ListingExposure'

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

    {listing.commissionPerUnit === '0' ? (
      <div>
        <Link
          className="listing-action-link"
          to={`/promote/${listing.id}`}
          children={fbt('Promote listing', 'listing.editCommission')}
        />
      </div>
    ) : (
      <>
        <div className="listing-buy-editonly mt-3">
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
    )}
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
        font-size: 16px
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
`)
