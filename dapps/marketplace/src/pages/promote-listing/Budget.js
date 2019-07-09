import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const HowWorks = ({ match, listing, onChange }) => {
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
        <div className="balance">OGN Balance:</div>
        <h4>Total Budget</h4>
        <div className="help">
          Amount you’re willing to spend for all combined sales
        </div>
        <div>
          <input
            className="form-control"
            value={listing.budget}
            onChange={e => {
              const val = e.target.value
              if (val.match(/^[0-9]+$/)) {
                onChange({ ...listing, budget: Number(val) })
              }
            }}
          />
        </div>
        <div>
          {`Total commission required to sell 3 units: ${listing.amount *
            3} OGN`}
        </div>

        <div className="actions">
          <Link
            to={`/promote/${match.params.listingId}/amount`}
            className="btn btn-outline-primary btn-rounded btn-lg mr-3"
          >
            Back
          </Link>
          <Link
            to={`/promote/${match.params.listingId}/success`}
            className="btn btn-primary btn-rounded btn-lg"
          >
            Continue
          </Link>
        </div>
      </div>
    </>
  )
}

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
