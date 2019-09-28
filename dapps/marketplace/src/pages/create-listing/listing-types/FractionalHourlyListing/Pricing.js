import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import omit from 'lodash/omit'

import IannaTimeZones from '@origin/graphql/src/constants/IannaTimeZones'

import Redirect from 'components/Redirect'
import Link from 'components/Link'
import CurrencySelect from 'components/CurrencySelect'

import { formInput, formFeedback } from 'utils/formHelpers'

import PricingChooser from '../../_PricingChooser'
import StandardHours from './_StandardHours'

const defaultWorkingHours = [
  '',
  '09:00:00/17:00:00',
  '09:00:00/17:00:00',
  '09:00:00/17:00:00',
  '09:00:00/17:00:00',
  '09:00:00/17:00:00',
  ''
]

class ListingPricing extends Component {
  constructor(props) {
    super(props)
    this.state = omit(props.listing, 'valid')
    if (!this.state.workingHours || !this.state.workingHours.length) {
      this.state.workingHours = defaultWorkingHours
    }
    if (!this.state.timeZone) {
      this.state.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  render() {
    if (this.state.valid) {
      return <Redirect to={this.props.next} push />
    }

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

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
                    <fbt desc="create.hourly.price">Default Price per Hour</fbt>
                  </label>
                  <div className="with-symbol">
                    <input {...input('price')} />
                    <CurrencySelect
                      {...input('currency', true)}
                      showCode={false}
                    />
                  </div>
                  {Feedback('price')}
                  <div className="help-text mt-2">
                    <fbt desc="create.fractional.price.help">
                      Price is an approximation of what you will receive.
                    </fbt>
                    <a
                      href="#/about/payments"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      &nbsp;
                      <fbt desc="create.price.help.more">Learn More</fbt>
                    </a>
                  </div>
                </div>
              </PricingChooser>

              <div className="form-group">
                <label>
                  <fbt desc="create.hourly.hours">Standard Available Hours</fbt>
                </label>

                <StandardHours
                  workingHours={this.state.workingHours}
                  onChange={workingHours => this.setState({ workingHours })}
                />
              </div>

              <div className="form-group">
                <label className="mb-0">
                  <fbt desc="create.hourly.time zone">Time Zone</fbt>
                </label>
                <select {...input('timeZone')}>
                  <option value="">UTC</option>
                  {IannaTimeZones.map(id => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
                {Feedback('timeZone')}
              </div>

              <div className="actions">
                <Link
                  className="btn btn-outline-primary d-none d-md-inline-block"
                  to={this.props.prev}
                >
                  <fbt desc="back">Back</fbt>
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    !this.state.acceptedTokens ||
                    !this.state.acceptedTokens.length
                  }
                >
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
    } else if (Number(this.state.price) <= 0) {
      newState.priceError = fbt(
        'Price must be greater than zero',
        'Price must be greater than zero'
      )
    }

    if (!this.state.timeZone) {
      newState.timeZoneError = fbt(
        'Time Zone is required',
        'Time Zone is required'
      )
    } else if (this.state.timeZone.length > 1024) {
      newState.timeZoneError = fbt(
        'Time Zone is too long',
        'Time Zone is too long'
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
