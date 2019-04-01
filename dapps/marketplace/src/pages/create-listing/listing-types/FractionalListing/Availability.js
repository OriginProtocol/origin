import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import AvailabilityCalculator from '@origin/graphql/src/utils/AvailabilityCalculator'

import Steps from 'components/Steps'
import Calendar from 'components/Calendar'
import Price from 'components/Price'
import Link from 'components/Link'
import Redirect from 'components/Redirect'

import { formInput, formFeedback } from 'utils/formHelpers'

class Availability extends Component {
  constructor(props) {
    super(props)
    this.state = {
      price: this.props.listing.price,
      customPrice: false,
      available: true,
      range: '',
      calculator: new AvailabilityCalculator({
        weekdayPrice: props.listing.price,
        weekendPrice: props.listing.weekendPrice,
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
      <div className="row">
        <div className="col-md-8">
          <div className="create-listing-calendar">
            <div className="wrap">
              <div className="step">
                <fbt desc="create.details.step">
                  Step
                  <fbt:param name="create.details.fractional.step">
                    {this.props.step}
                  </fbt:param>
                </fbt>
              </div>
              <div className="step-description">
                <fbt desc="create.edit-availability.description">
                  Edit availability &amp; Pricing
                </fbt>
              </div>
              <Steps steps={this.props.steps} step={this.props.step} />

              <form
                onSubmit={e => {
                  e.preventDefault()
                  this.setState({ valid: true })
                }}
              >
                {this.state.valid !== false ? null : (
                  <div className="alert alert-danger">
                    <fbt desc="listing.create.errors">
                      Please fix the errors below...
                    </fbt>
                  </div>
                )}

                <Calendar
                  range={this.state.range}
                  availability={this.state.calculator}
                  onChange={state => this.setState(state)}
                  showBooked={true}
                />

                <div className="actions">
                  <Link
                    className="btn btn-outline-primary"
                    to={this.props.prev}
                  >
                    <fbt desc="listing.create.back">Back</fbt>
                  </Link>
                  <button className="btn btn-primary" type="submit">
                    <fbt desc="listing.create.review">Review</fbt>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          {this.state.range ? (
            this.renderAvailabilty()
          ) : (
            <div className="gray-box">
              <fbt desc="listing.create.fractional.calendar.help">
                Click the calendar to enter pricing and availability
                information. To select multiple time slots, click the starting
                time slot and drag to the ending one.
              </fbt>
            </div>
          )}
        </div>
      </div>
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
              <fbt desc="yes5">Yes</fbt>
            </div>
          </div>
          <div>
            <input
              type="radio"
              checked={!this.state.available}
              onChange={() => this.setState({ available: false })}
            />
            <div>
              <fbt desc="no6">No</fbt>
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
                      <span className="eth">ETH</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="with-symbol corner">
                      <Price
                        el="input"
                        amount={this.state.price}
                        className="form-control form-control-lg"
                      />
                      <span className="usd">USD</span>
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

export default Availability
