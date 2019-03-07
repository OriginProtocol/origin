import React from 'react'

import Price from 'components/Price'

import { formInput, formFeedback } from 'utils/formHelpers'

const UnitListing = ({ listing, onChange }) => {
  const input = formInput(listing, state => onChange(state))
  const Feedback = formFeedback(listing)

  const isMulti = Number(listing.quantity || 0) > 1

  return (
    <>
      <div className="form-group">
        <label>Quantity</label>
        <input
          {...input('quantity')}
          placeholder="How many are you selling?"
          type="number"
          pattern="\d*"
        />
        {Feedback('quantity')}
      </div>
      <div className="form-group">
        <label>{`Price${isMulti ? ' (per unit)' : ''}`}</label>
        <div className="d-flex">
          <div style={{ flex: 1, marginRight: '1rem' }}>
            <div className="with-symbol">
              <input {...input('price')} />
              <span className="eth">ETH</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="with-symbol corner">
              <Price
                el="input"
                amount={listing.price}
                className="form-control form-control-lg"
              />
              <span className="usd">USD</span>
            </div>
          </div>
        </div>
        {Feedback('price')}
        <div className="help-text price">
          The cost to buy this listing. Price is always in ETH, USD is an
          estimate.
        </div>
      </div>
    </>
  )
}

export default UnitListing
