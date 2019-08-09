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
  const [value, setValue] = useState(String(commissionPerUnit))
  const inputRef = useRef()
  useEffect(() => inputRef.current.focus(), [inputRef])
  useEffect(() => setValue(String(commissionPerUnit)), [commissionPerUnit])

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
          {`OGN Balance: `} <CoinLogo />
          {tokenBalance}
          {listing.__typename !== 'UnitListing' || !multiUnit ? null : (
            <div>{`Units Available: ${unitsAvailable}`}</div>
          )}
        </div>
        <h4>{`Commission${multiUnit ? ' per Unit Sold' : ''}`}</h4>

        <div className="input-wrap">
          <input
            className="form-control"
            name="commissionPerUnit"
            type="tel"
            ref={inputRef}
            value={value}
            maxLength={String(tokenBalance).length}
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
            {`${unitsAvailable} units `}&times;{' '}
            <b>{`${commissionPerUnit} OGN`}</b> ={' '}
            {`${numberFormat(commissionPerUnit * unitsAvailable)} OGN`}
          </div>
        )}

        <div className="exposure">
          {`Listing exposure: `}
          <Exposure listing={listing} />
        </div>
        <div className="actions">
          <Link
            to={`/promote/${match.params.listingId}`}
            className="btn btn-outline-primary btn-rounded btn-lg mr-3 d-none d-sm-inline-block"
          >
            Back
          </Link>
          {multiUnit || listing.__typename !== 'UnitListing' ? (
            <Link
              to={`/promote/${match.params.listingId}/budget`}
              className="btn btn-primary btn-rounded btn-lg"
            >
              Continue
            </Link>
          ) : (
            <WithPrices
              price={{ amount: value, currency: { id: 'token-OGN' } }}
              target={'token-OGN'}
              targets={['token-OGN']}
            >
              {({ tokenStatus }) => (
                <UpdateListing
                  refetch={refetch}
                  listing={listing}
                  listingTokens={listingTokens}
                  tokenBalance={tokenBalance}
                  tokenStatus={tokenStatus}
                  className="btn btn-primary btn-rounded btn-lg"
                  children={fbt('Promote Now', 'promoteListing.promoteNow')}
                />
              )}
            </WithPrices>
          )}
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
