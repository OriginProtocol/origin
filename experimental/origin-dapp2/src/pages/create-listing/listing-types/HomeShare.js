import React from 'react'

import Price from 'components/Price'

import { formInput, formFeedback } from 'utils/formHelpers'

const HomeShareListing = ({ listing, onChange }) => {
  const input = formInput(listing, state => onChange(state))
  const Feedback = formFeedback(listing)

  return (
    <>
      <div className="form-group">
        <label>Default Weekday Pricing (Sunday - Thursday nights)</label>
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
          Price is always in ETH, USD is an estimate.
        </div>
      </div>
      <div className="form-group">
        <label>Default Weekend Pricing (Friday &amp; Saturday nights)</label>
        <div className="d-flex">
          <div style={{ flex: 1, marginRight: '1rem' }}>
            <div className="with-symbol">
              <input {...input('weekendPrice')} />
              <span className="eth">ETH</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="with-symbol corner">
              <Price
                el="input"
                amount={listing.weekendPrice}
                className="form-control form-control-lg"
              />
              <span className="usd">USD</span>
            </div>
          </div>
        </div>
        {Feedback('weekendPrice')}
      </div>
    </>
  )
}

export default HomeShareListing
