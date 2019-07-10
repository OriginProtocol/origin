import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

import Exposure from './_Exposure'

const HowWorks = ({ match, listing, tokenBalance, onChange }) => (
  <>
    <h1>
      <Link
        to={`/promote/${match.params.listingId}`}
        className="back d-md-none"
      />
      <fbt desc="PromoteListing.title">Promote Listing</fbt>
    </h1>
    <div className="amount">
      <div className="balance">{`OGN Balance: ${tokenBalance} OGN`}</div>
      <h4>Commission Amount per Sale</h4>
      <div className="help">Paid out each time a sale is made.</div>
      <div>
        <input className="form-control" value={listing.commissionPerUnit} />
      </div>
      <div>
        {`3 potential sales x `}
        <b>{`${listing.commissionPerUnit} OGN`}</b> ={' '}
        {`${listing.commissionPerUnit * 3} OGN`}
      </div>
      <div>
        {`Listing exposure: `}
        <Exposure listing={listing} />
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
            onChange({ ...listing, commissionPerUnit: Number(e.target.value) })
          }
        />
      </div>
      <div className="actions">
        <Link
          to={`/promote/${match.params.listingId}`}
          className="btn btn-outline-primary btn-rounded btn-lg mr-3"
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

export default HowWorks

require('react-styl')(`
  .input-range
    padding: 0
    margin: 0
    display: inline-block
    vertical-align: top
    width: 100%
    > input
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
        cursor: pointer;
`)
