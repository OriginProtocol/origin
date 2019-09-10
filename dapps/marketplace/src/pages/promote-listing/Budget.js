import React, { useState, useEffect, useRef } from 'react'
import { fbt } from 'fbt-runtime'

import numberFormat from 'utils/numberFormat'

import Link from 'components/Link'
import CoinLogo from 'components/CoinLogo'
import WithPrices from 'components/WithPrices'

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

  let message
  if (!value || value === '0') {
    message = (
      <div className="enter-amount">
        <fbt desc="PromoteListing.enterBudget">
          Please enter a commission budget
        </fbt>
      </div>
    )
  } else if (tokenBalance < Number(value)) {
    message = (
      <div className="not-enough">
        <fbt desc="PromoteListing.notEnough">Not enough OGN</fbt>
      </div>
    )
  }

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
            <div>
              <fbt desc="PromoteListing.unitsAvailable">
                {'Units Available: '}
                <fbt:param name="unitsAvailable">{unitsAvailable}</fbt:param>
              </fbt>
            </div>
          )}
        </div>
        <h4>
          <fbt desc="PromoteListing.totalBudget">Total Budget</fbt>
        </h4>
        <div className="help">
          <fbt desc="PromoteListing.totalBudgetHelp">
            Amount you’re willing to spend for all units sold
          </fbt>
        </div>
        <div className="input-wrap">
          <input
            className="form-control"
            type="tel"
            autoComplete="no"
            ref={inputRef}
            value={value}
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
          <fbt desc="PromoteListing.commissionRequired">
            {'Total commission required to sell '}
            <fbt:param name="unitsAvailable">{unitsAvailable}</fbt:param>
            {' units: '}
            <fbt:param name="totalCommission">
              {numberFormat(commissionPerUnit * unitsAvailable)}
            </fbt:param>
            {' OGN'}
          </fbt>
        </div>

        {message}

        <div className="actions">
          <Link
            to={`/promote/${match.params.listingId}/amount`}
            className="btn btn-outline-primary btn-rounded btn-lg mr-3 d-none d-sm-inline-block"
          >
            {fbt('Back', 'Back')}
          </Link>

          <WithPrices
            price={{ amount: commission, currency: { id: 'token-OGN' } }}
            target={'token-OGN'}
            targets={['token-OGN']}
            allowanceTarget={listing.contractAddr}
          >
            {({ tokenStatus }) => {
              if (tokenStatus.loading) {
                return (
                  <div
                    className="btn btn-primary btn-rounded btn-lg disabled"
                    children={fbt('Loading', 'Loading')}
                  />
                )
              } else if (
                !tokenStatus.hasBalance ||
                !value ||
                value === '0' ||
                tokenBalance < Number(value)
              ) {
                return (
                  <div
                    className="btn btn-primary btn-rounded btn-lg disabled"
                    children={fbt('Promote Now', 'promoteListing.promoteNow')}
                  />
                )
              }
              return (
                <UpdateListing
                  refetch={refetch}
                  listing={listing}
                  listingTokens={listingTokens}
                  tokenBalance={tokenBalance}
                  tokenStatus={tokenStatus}
                  className="btn btn-primary btn-rounded btn-lg"
                  children={fbt('Promote Now', 'promoteListing.promoteNow')}
                  listingPromotion={true}
                />
              )
            }}
          </WithPrices>
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
`)
