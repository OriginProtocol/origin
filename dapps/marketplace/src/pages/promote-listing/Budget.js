import React, { useState, useEffect, useRef } from 'react'
import { fbt } from 'fbt-runtime'

import numberFormat from 'utils/numberFormat'

import Link from 'components/Link'
import CoinLogo from 'components/CoinLogo'

import UpdateListing from 'pages/create-listing/mutations/UpdateListing'

const PromoteListingBudget = ({
  match,
  listing,
  tokenBalance,
  onChange,
  listingTokens,
  refetch
}) => {
  const { commission, commissionPerUnit, unitsAvailable } = listing
  const [value, setValue] = useState(String(commission))
  const inputRef = useRef()
  useEffect(() => inputRef.current.focus(), [inputRef])
  useEffect(() => setValue(String(commission)), [commission])

  return (
    <>
      <h1>
        <Link
          to={`/promote/${match.params.listingId}/amount`}
          className="back d-md-none"
        />
        <fbt desc="PromoteListing.title">Promote Listing</fbt>
      </h1>
      <div className="budget">
        <div className="balance">
          {`OGN Balance: `} <CoinLogo />
          {tokenBalance}
          {listing.__typename !== 'UnitListing' ? null : (
            <div>{`Units Available: ${unitsAvailable}`}</div>
          )}
        </div>
        <h4>Total Budget</h4>
        <div className="help">
          Amount you’re willing to spend for all units sold
        </div>
        <div className="input-wrap">
          <input
            className="form-control"
            type="tel"
            ref={inputRef}
            value={value}
            maxLength={String(tokenBalance).length}
            onChange={e => {
              const amount = e.target.value
              setValue(amount)
              if (!amount) {
                onChange({ ...listing, commission: 0 })
              } else if (amount.match(/^[0-9]+$/)) {
                onChange({
                  ...listing,
                  commission: Number(e.target.value || 0)
                })
              }
            }}
          />
          <div className="ogn">
            <CoinLogo /> OGN
          </div>
        </div>
        <div className="calc">
          {`Total commission required to sell ${unitsAvailable} units: ${numberFormat(
            commissionPerUnit * unitsAvailable
          )} OGN`}
        </div>

        <div className="actions">
          <Link
            to={`/promote/${match.params.listingId}/amount`}
            className="btn btn-outline-primary btn-rounded btn-lg mr-3 d-none d-sm-inline-block"
          >
            Back
          </Link>

          <UpdateListing
            refetch={refetch}
            listing={listing}
            listingTokens={listingTokens}
            tokenBalance={tokenBalance}
            className="btn btn-primary btn-rounded btn-lg"
            children={fbt('Promote Now', 'promoteListing.promoteNow')}
          />
        </div>
      </div>
    </>
  )
}

export default PromoteListingBudget

require('react-styl')(`
  .promote-listing
    .budget
      .form-control
        border-width: 0 0 1px 0
        height: 1.5em
        margin-bottom: 0.5rem
        border-radius: 0
      .input-wrap
        margin-top: 0.5rem
      .actions
        margin-top: 1.5rem

`)
