import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import AvailabilityCalculatorHourly from '@origin/graphql/src/utils/AvailabilityCalculatorHourly'

import Redirect from 'components/Redirect'
import Link from 'components/Link'
import WeekCalendar from 'components/WeekCalendar'
import CurrencySelect from 'components/CurrencySelect'

import { formInput, formFeedback } from 'utils/formHelpers'

class ListingHourlyAvailability extends Component {
  constructor(props) {
    super(props)
    this.state = {
      price: this.props.listing.price,
      customPrice: false,
      available: true,
      range: '',
      calculator: new AvailabilityCalculatorHourly({
        price: props.listing.price,
        workingHours: props.listing.workingHours,
        booked: props.listing.booked,
        unavailable: props.listing.unavailable,
        customPricing: props.listing.customPricing
      })
    }
  }

  render() {
    if (this.state.valid) {
      return <Redirect to={this.props.next} push />
    }

    return (
      <>
        <h1>
          <Link to={this.props.prev} className="back d-md-none" />
          <fbt desc="createListing.availability">Availability</fbt>
        </h1>
        <div className="row">
          <div className="col-md-8">
            <form
              className="listing-step no-pad"
              onSubmit={e => {
                e.preventDefault()
                this.setState({ valid: true })
              }}
            >
              {this.state.valid !== false ? null : (
                <div className="alert alert-danger">
                  <fbt desc="fix errors">Please fix the errors below...</fbt>
                </div>
              )}

              <WeekCalendar
                range={this.state.range}
                availability={this.state.calculator}
                workingHours={this.state.workingHours}
                onChange={state => this.setState(state)}
                showBooked={true}
                currency={this.props.listing.currency}
                originalCurrency
              />

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
          <div className="col-md-4">
            {this.state.range ? (
              this.renderAvailabilty()
            ) : (
              <div className="gray-box">
                <fbt desc="listing.create.fractional.calendar.help">
                  Click the calendar to enter pricing and availability
                  information. To select multiple time slots, click the start
                  and then click the end.
                </fbt>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  renderAvailabilty() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    const [start, end] = this.state.range.split('/')

    return (
      <div className="availability-editor">
        <div className="form-group">
          <label>
            <fbt desc="create.fractional.start-date">Start Date</fbt>
          </label>
          <input className="form-control" type="date" value={start} readOnly />
        </div>
        <div className="form-group">
          <label>
            <fbt desc="create.fractional.end-date">End Date</fbt>
          </label>
          <input className="form-control" type="date" value={end} readOnly />
        </div>
        {/* <div className="form-group">
          <label>Availability</label>
          <div className="btn-group w-100">
            <button className="btn btn-outline-secondary active">
              Available
            </button>
            <button className="btn btn-outline-secondary">Booked</button>
            <button className="btn btn-outline-secondary">Unavailable</button>
          </div>
        </div> */}
        <div className="form-group inline-label">
          <label>
            <fbt desc="create.fractional.available">Available</fbt>
          </label>
          <div>
            <input
              type="radio"
              checked={this.state.available}
              onChange={() => this.setState({ available: true })}
            />
            <div>
              <fbt desc="yes">Yes</fbt>
            </div>
          </div>
          <div>
            <input
              type="radio"
              checked={!this.state.available}
              onChange={() => this.setState({ available: false })}
            />
            <div>
              <fbt desc="no">No</fbt>
            </div>
          </div>
        </div>
        {!this.state.available ? null : (
          <div className="form-group">
            <div className="inline-label mb-2">
              <label>
                <fbt desc="listing.create.customPricing">Custom Pricing</fbt>
              </label>
              <div>
                <input
                  type="radio"
                  checked={!this.state.customPrice}
                  onChange={() => this.setState({ customPrice: false })}
                />
                <div>
                  <fbt desc="no">No</fbt>
                </div>
              </div>
              <div>
                <input
                  type="radio"
                  checked={this.state.customPrice}
                  onChange={() => this.setState({ customPrice: true })}
                />
                <div>
                  <fbt desc="yes">Yes</fbt>
                </div>
              </div>
            </div>
            {!this.state.customPrice ? null : (
              <>
                <div className="d-flex">
                  <div style={{ flex: 1, marginRight: '1rem' }}>
                    <div className="with-symbol">
                      <input {...input('price')} />
                      <CurrencySelect value={this.props.listing.currency} />
                    </div>
                  </div>
                </div>
                {Feedback('price')}
              </>
            )}
          </div>
        )}
        <div className="action-buttons">
          <button
            className="btn btn-outline-primary btn-rounded"
            onClick={() => this.setState({ range: '' })}
            children={fbt('Cancel', 'Cancel')}
          />
          <button
            className="btn btn-outline-primary btn-rounded"
            onClick={() => {
              const calculator = this.state.calculator
              calculator.update(
                this.state.range,
                this.state.available ? 'available' : 'unavailable',
                this.state.customPrice ? this.state.price : 'reset'
              )
              this.setState({
                calculator,
                range: '',
                price: this.props.listing.price,
                customPrice: false,
                available: true
              })

              const { booked, customPricing, unavailable } = calculator.opts

              this.props.onChange({
                ...this.props.listing,
                booked,
                customPricing,
                unavailable
              })
            }}
            children={fbt('Save', 'Save')}
          />
        </div>
      </div>
    )
  }
}

export default ListingHourlyAvailability

require('react-styl')(`
`)
