import React, { useState, useEffect, useRef } from 'react'
import { fbt } from 'fbt-runtime'

import numberFormat from 'utils/numberFormat'

import Link from 'components/Link'
import CoinLogo from 'components/CoinLogo'

import Exposure from './_Exposure'

const PromoteListingAmount = ({ match, listing, tokenBalance, onChange }) => {
  const [value, setValue] = useState(String(listing.commissionPerUnit))
  const inputRef = useRef()
  useEffect(() => inputRef.current.focus(), [inputRef])
  useEffect(() => {
    setValue(String(listing.commissionPerUnit))
  }, [listing.commissionPerUnit])

  const unitsAvailable = listing.unitsAvailable

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
          <div>{`Units Available: ${unitsAvailable}`}</div>
        </div>
        <h4>Commission per Unit Sold</h4>

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
                onChange({ ...listing, commissionPerUnit: 0 })
              } else if (amount.match(/^[0-9]+$/)) {
                onChange({
                  ...listing,
                  commissionPerUnit: Number(e.target.value || 0)
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
          style={{ '--val': `${listing.commissionPerUnit}%` }}
        >
          <input
            type="range"
            min="0"
            max="100"
            value={listing.commissionPerUnit}
            onChange={e =>
              onChange({
                ...listing,
                commissionPerUnit: Number(e.target.value)
              })
            }
          />
        </div>

        <div className="calc">
          {`${unitsAvailable} units `}&times;{' '}
          <b>{`${listing.commissionPerUnit} OGN`}</b> ={' '}
          {`${numberFormat(listing.commissionPerUnit * unitsAvailable)} OGN`}
        </div>

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
          <Link
            to={`/promote/${match.params.listingId}/budget`}
            className="btn btn-primary btn-rounded btn-lg"
          >
            Continue
          </Link>
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
        font-size: 14px
        margin: 1.5rem 0
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
`)
