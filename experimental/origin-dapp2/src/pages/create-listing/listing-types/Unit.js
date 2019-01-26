import React, { Component } from 'react'

import Price from 'components/Price'

import { formInput, formFeedback } from 'utils/formHelpers'

class UnitListing extends Component {
  render() {

    const isMulti = Number(this.props.quantity || 0) > 1

    const input = formInput(this.props, state => this.props.onChange(state))
    const Feedback = formFeedback(this.props)

    return (
      <>
        <div className="form-group">
          <label>Quantity</label>
          <input
            {...input('quantity')}
            placeholder="How many are you selling?"
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
                  amount={this.props.price}
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
}

export default UnitListing
