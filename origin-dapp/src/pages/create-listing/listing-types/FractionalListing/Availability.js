import React, { Component } from 'react'
import AvailabilityCalculator from 'origin-graphql/src/utils/AvailabilityCalculator'

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
      price: '',
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
              <div className="step">{`Step ${this.props.step}`}</div>
              <div className="step-description">
                Edit availability &amp; Pricing
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
                    Please fix the errors below...
                  </div>
                )}

                <Calendar
                  range={this.state.range}
                  availability={this.state.calculator}
                  onChange={state => this.setState(state)}
                  showBooked={true}
                  currency={this.props.listing.currency}
                />

                <div className="actions">
                  <Link
                    className="btn btn-outline-primary"
                    to={this.props.prev}
                  >
                    Back
                  </Link>
                  <button className="btn btn-primary" type="submit">
                    Review
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
              Click the calendar to enter pricing and availability information.
              <br />
              <br />
              To select multiple time slots, click the starting time slot and
              drag to the ending one.
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
          <label>Start Date</label>
          <input className="form-control" type="date" value={start} readOnly />
        </div>
        <div className="form-group">
          <label>End Date</label>
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
          <label>Available</label>
          <div>
            <input
              type="radio"
              checked={this.state.available}
              onChange={() => this.setState({ available: true })}
            />
            <div>Yes</div>
          </div>
          <div>
            <input
              type="radio"
              checked={!this.state.available}
              onChange={() => this.setState({ available: false })}
            />
            <div>No</div>
          </div>
        </div>
        {!this.state.available ? null : (
          <div className="form-group">
            <div className="inline-label mb-2">
              <label>Custom Pricing</label>
              <div>
                <input
                  type="radio"
                  checked={!this.state.customPrice}
                  onChange={() => this.setState({ customPrice: false })}
                />
                <div>No</div>
              </div>
              <div>
                <input
                  type="radio"
                  checked={this.state.customPrice}
                  onChange={() => this.setState({ customPrice: true })}
                />
                <div>Yes</div>
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
            children="Cancel"
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
              this.setState({ calculator, range: '' })

              const { booked, customPricing, unavailable } = calculator.opts

              this.props.onChange({
                ...this.props.listing,
                booked,
                customPricing,
                unavailable
              })
            }}
            children="Save"
          />
        </div>
      </div>
    )
  }
}

export default Availability

require('react-styl')(`
  .create-listing
    .create-listing-calendar
      border: transparent
      .step-description
        font-size: 28px
      .gray-box
        margin-top: 10.5rem
    .availability-editor
      margin-top: 10.5rem
      border: 1px solid var(--light)
      border-radius: 5px
      padding: 1rem
      font-size: 18px
      font-weight: normal
      .action-buttons
        display: flex
        > .btn
          flex: 1
          &:first-child
            margin-right: 1rem
      label
        font-weight: bold
        color: #000
        font-size: 18px
      .sep
        padding: 0 0.5rem;
        align-self: center;
        font-weight: bold;
      .inline-label
        display: flex;
        align-items: center;
        label
          margin-bottom: 0
          margin-right: 1rem
        > div
          margin-left: 1rem
          display: flex
          align-items: baseline
          input
            margin-right: 0.25rem
`)
