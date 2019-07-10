import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import omit from 'lodash/omit'

import Redirect from 'components/Redirect'
import Link from 'components/Link'
import CurrencySelect from 'components/CurrencySelect'

import { formInput, formFeedback } from 'utils/formHelpers'

import PricingChooser from './_PricingChooser'

class ListingPricing extends Component {
  constructor(props) {
    super(props)
    this.state = omit(props.listing, 'valid')
  }

  componentDidMount() {
    if (this.priceInput) {
      this.priceInput.focus()
    }
  }

  render() {
    if (this.state.valid) {
      return <Redirect to={this.props.next} push />
    }

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    const isMulti = Number(this.state.quantity || 0) > 1

    return (
      <>
        <h1>
          <Link to={this.props.prev} className="back d-md-none" />
          <fbt desc="createListing.pricing">Pricing</fbt>
        </h1>
        <div className="row">
          <div className="col-md-8">
            <form
              className="listing-step"
              onSubmit={e => {
                e.preventDefault()
                this.validate()
              }}
            >
              {this.state.valid !== false ? null : (
                <div className="alert alert-danger">
                  <fbt desc="fix errors">Please fix the errors below...</fbt>
                </div>
              )}

              <PricingChooser {...input('acceptedTokens', true)}>
                <div className="form-group">
                  <label>
                    {!isMulti && <fbt desc="price-single-unit">Price</fbt>}
                    {isMulti && (
                      <fbt desc="price-multi-unit">Price Per Unit</fbt>
                    )}
                  </label>
                  <div className="with-symbol">
                    <input
                      ref={r => (this.priceInput = r)}
                      {...input('price')}
                      placeholder={fbt(
                        'Enter amount',
                        'createListing.enterPrice'
                      )}
                    />
                    <CurrencySelect
                      {...input('currency', true)}
                      showCode={false}
                    />
                  </div>
                  {Feedback('price')}
                  <div className="help-text mt-2">
                    <fbt desc="create.details.help-text.price">
                      Price is an approximation of what you will receive.
                    </fbt>
                    <a
                      href="#/about/payments"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      &nbsp;
                      <fbt desc="create.details.help-text.price.more">
                        Learn More
                      </fbt>
                    </a>
                  </div>
                </div>
              </PricingChooser>

              <div className="actions">
                <Link
                  className="btn btn-outline-primary d-none d-md-inline-block"
                  to={this.props.prev}
                >
                  <fbt desc="back">Back</fbt>
                </Link>
                <button type="submit" className="btn btn-primary">
                  <fbt desc="continue">Continue</fbt>
                </button>
              </div>
            </form>
          </div>
          <div className="col-md-4 d-none d-md-block">
            <div className="gray-box">
              <fbt desc="create.details.help">
                <h5>Add Listing Details</h5>
                Be sure to give your listing an appropriate title and
                description to let others know what you&apos;re offering. Adding
                some photos will increase the chances of selling your listing.
              </fbt>
            </div>
          </div>
        </div>
      </>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.price) {
      newState.priceError = fbt('Price is required', 'Price is required')
    } else if (!this.state.price.match(/^-?[0-9.]+$/)) {
      newState.priceError = fbt(
        'Price must be a number',
        'Price must be a number'
      )
    } else if (Number(this.state.price) < 0) {
      newState.priceError = fbt(
        'Price must be greater than zero',
        'Price must be greater than zero'
      )
    }

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    if (!newState.valid) {
      window.scrollTo(0, 0)
    } else if (this.props.onChange) {
      this.props.onChange(this.state)
    }
    this.setState(newState)
    return newState.valid
  }
}

export default ListingPricing
