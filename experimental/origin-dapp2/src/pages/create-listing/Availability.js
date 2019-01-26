import React, { Component } from 'react'

import Steps from 'components/Steps'
import Link from 'components/Link'
import Calendar from 'components/Calendar'
import Price from 'components/Price'

import { formInput, formFeedback } from 'utils/formHelpers'

class Availability extends Component {
  constructor(props) {
    super(props)
    this.state = {
      price: '',
      customPrice: false,
      available: true,
      rangeSelected: false
    }
  }

  render() {
    const { listing } = this.props
    return (
      <div className="row">
        <div className="col-md-8">
          <div className="create-listing">
            <div className="wrap create-listing-calendar">
              <div className="step">Step 3</div>
              <div className="step-description">
                Edit availability &amp; Pricing
              </div>
              <Steps steps={3} step={2} />

              <form
                onSubmit={e => {
                  e.preventDefault()
                }}
              >
                {this.state.valid !== false ? null : (
                  <div className="alert alert-danger">
                    Please fix the errors below...
                  </div>
                )}

                <Calendar
                  weekdayPrice={listing.weekdayPrice}
                  weekendPrice={listing.weekendPrice}
                  onChange={state => this.setState(state)}
                />

                <div className="actions">
                  <Link
                    className="btn btn-outline-primary"
                    to={'/create/step-2'}
                  >
                    Back
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          {this.state.rangeSelected ? (
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

    return (
      <div className="availability-editor">
        <div className="form-group">
          <label>Start Date</label>
          <input className="form-control" type="date" />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input className="form-control" type="date" />
        </div>
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
      </div>
    )
  }
}

export default Availability

require('react-styl')(`
  .create-listing
    .create-listing-calendar
      border: transparent

    .availability-editor
      margin-top: 8rem
      border: 1px solid var(--light)
      border-radius: 5px
      padding: 1rem
      font-size: 18px
      font-weight: normal
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
