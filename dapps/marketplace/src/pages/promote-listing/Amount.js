import React, { useState, useEffect, useRef } from 'react'
import { fbt } from 'fbt-runtime'

import numberFormat from 'utils/numberFormat'

import Link from 'components/Link'
import CoinLogo from 'components/CoinLogo'
import Exposure from 'components/ListingExposure'
import WithPrices from 'components/WithPrices'

import UpdateListing from 'pages/create-listing/mutations/UpdateListing'

const PromoteListingAmount = ({
  match,
  listing,
  tokenBalance,
  onChange,
  multiUnit,
  listingTokens,
  refetch
}) => {
  const { unitsAvailable, commissionPerUnit } = listing
  const [value, setValue] = useState(
    commissionPerUnit === '0' ? '' : String(commissionPerUnit)
  )
  const inputRef = useRef()
  useEffect(() => inputRef.current.focus(), [inputRef])
  useEffect(() => {
    setValue(commissionPerUnit === '0' ? '' : String(commissionPerUnit))
  }, [commissionPerUnit])

  const calcCommission = commissionPerUnit => {
    let commission = tokenBalance
    if (listing.__typename === 'UnitListing') {
      commission = commissionPerUnit * unitsAvailable
    }
    return {
      commissionPerUnit,
      commission: Math.min(tokenBalance, commission)
    }
  }

  let next, message
  const needsBudget = multiUnit || listing.__typename !== 'UnitListing'
  if (needsBudget) {
    next = (
      <Link
        to={`/promote/${match.params.listingId}/budget`}
        className="btn btn-primary btn-rounded btn-lg"
      >
        {fbt('Continue', 'Continue')}
      </Link>
    )
  } else {
    next = (
      <WithPrices
        price={{ amount: value, currency: { id: 'token-OGN' } }}
        target={'token-OGN'}
        targets={['token-OGN']}
      >
        {({ tokenStatus }) => {
          if (!tokenStatus.hasBalance || !value || value === '0') {
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
              listingPromotion={true}
              className="btn btn-primary btn-rounded btn-lg"
              children={fbt('Promote Now', 'promoteListing.promoteNow')}
            />
          )
        }}
      </WithPrices>
    )
  }

  if (!value || value === '0') {
    message = (
      <div className="enter-amount">
        <fbt desc="PromoteListing.enterAmount">
          Please enter a commission amount
        </fbt>
      </div>
    )
  } else if (tokenBalance < Number(value) && !needsBudget) {
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
          to={`/promote/${match.params.listingId}`}
          className="back d-md-none"
        />
        <fbt desc="PromoteListing.title">Promote Listing</fbt>
      </h1>
      <div className="amount">
        <div className="balance">
          <fbt desc="PromoteListing.OGNBalance">OGN Balance: </fbt>
          {` `}
          <CoinLogo />
          {tokenBalance}
          {listing.__typename !== 'UnitListing' || !multiUnit ? null : (
            <div>
              <fbt desc="PromoteListing.unitsAvailable">
                {'Units Available: '}
                <fbt:param name="unitsAvailable">{unitsAvailable}</fbt:param>
              </fbt>
            </div>
          )}
        </div>
        <h4>
          {multiUnit ? (
            <fbt desc="PromoteListing.commissionPerUnit">
              Commission per Unit Sold
            </fbt>
          ) : (
            <fbt desc="PromoteListing.commissionAmount">Commission Amount</fbt>
          )}
        </h4>
        {multiUnit ? null : (
          <div className="desc">
            <fbt desc="PromoteListing.paidOnSale">
              Paid out when your listing is sold.
            </fbt>
          </div>
        )}

        <div className="input-wrap">
          <input
            className="form-control"
            name="commissionPerUnit"
            autoComplete="no"
            type="tel"
            ref={inputRef}
            value={value}
            onChange={e => {
              const amount = e.target.value
              setValue(amount)
              if (!amount) {
                onChange({ ...listing, ...calcCommission(0) })
              } else if (amount.match(/^[0-9]+$/)) {
                onChange({
                  ...listing,
                  ...calcCommission(Number(e.target.value || 0))
                })
              }
            }}
          />
          <div className="ogn">
            <CoinLogo /> OGN
          </div>
        </div>

        <div
          className="input-range"
          style={{ '--val': `${commissionPerUnit}%` }}
        >
          <input
            type="range"
            min="0"
            max="100"
            value={commissionPerUnit}
            onChange={e => {
              onChange({
                ...listing,
                ...calcCommission(Number(e.target.value || 0))
              })
            }}
          />
        </div>
        {!multiUnit ? null : (
          <div className="calc">
            <fbt desc="PromoteListing.unitsAvailable">
              <fbt:param name="unitsAvailable">{unitsAvailable}</fbt:param>
              {' units '}&times;{' '}
              <b>
                <fbt:param name="commissionPerUnit">
                  {commissionPerUnit}
                </fbt:param>
                {' OGN'}
              </b>
              {' = '}
              <fbt:param name="totalOGN">
                {numberFormat(commissionPerUnit * unitsAvailable)}
              </fbt:param>
              {' OGN'}
            </fbt>
          </div>
        )}
        {message ? (
          message
        ) : (
          <div className="exposure">
            <fbt desc="PromoteListing.exposure">Listing exposure:</fbt>{' '}
            <Exposure listing={listing} />
          </div>
        )}
        <div className="actions">
          <Link
            to={`/promote/${match.params.listingId}`}
            className="btn btn-outline-primary btn-rounded btn-lg mr-3 d-none d-sm-inline-block"
          >
            {fbt('Back', 'Back')}
          </Link>
          {next}
        </div>
      </div>
    </>
  )
}

export default PromoteListingAmount

require('react-styl')(`
  .promote-listing
    text-align: center
    .balance
      font-size: 16px
      font-weight: 300
    h4
      margin-top: 1.5rem
      font-size: 20px
      font-weight: bold
    .desc
      font-size: 16px
    .not-enough,.enter-amount
      margin: 1.5rem 0
      font-weight: bold
      font-size: 14px
      line-height: 1.5rem
    .not-enough
      color: #ff0000
    .amount
      .form-control
        border: 0
        height: 1em
      .input-wrap
        margin-top: 1.5rem
    .amount,.budget
      .help
        font-size: 14px
        font-weight: 300
      .form-control
        font-size: 44px
        text-align: center
        color: #000
        &:focus
          box-shadow: unset
      .calc
        font-size: 14px
        font-weight: 300
      .exposure
        font-weight: bold
        font-size: 14px
        margin: 1.5rem 0
        line-height: 1.5rem
        .badge
          margin-left: 0.375rem
      .input-wrap
        position: relative
        > .ogn
          position: absolute
          top: 50%
          right: 0
          transform: translateY(-50%)
          background-color: #ebf0f3
          border-radius: 2rem
          padding: 5px 8px 5px 6px
          font-weight: 900
          display: flex;
          align-items: center
          line-height: 1em
          color: #007fff

    .input-range
      padding: 0
      margin: 0
      display: inline-block
      vertical-align: top
      width: 100%
      > input
        width: 100%
        -webkit-appearance: none
        --track-background: linear-gradient(to right, #fec100 0, #fec100 calc(var(--val) - 3px), #c0cbd4 0) no-repeat 0 45% / 100% 40%;
        outline: 0
        &::-webkit-slider-runnable-track
          background: var(--track-background)
          height: 5px
        &::-webkit-slider-thumb
          -webkit-appearance: none
          border: 2px solid black
          background: white
          margin-top: -6px
          width: 16px
          height: 16px
          border-radius: 50%
          cursor: pointer
`)
