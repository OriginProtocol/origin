import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import omit from 'lodash/omit'

import IannaTimeZones from '@origin/graphql/src/constants/IannaTimeZones'

import Steps from 'components/Steps'
import Wallet from 'components/Wallet'
import ImagePicker from 'components/ImagePicker'
import Redirect from 'components/Redirect'
import Link from 'components/Link'
import PricingChooser from '../_PricingChooser'
import CurrencySelect from 'components/CurrencySelect'

import { formInput, formFeedback } from 'utils/formHelpers'

class Details extends Component {
  constructor(props) {
    super(props)
    if (!props.listing.timeZone) {
      // Default to current timeZone if none is set
      props.listing.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    }
    this.defaultWorkingHoursDay = '09:00:00/17:00:00'
    this.defaultWorkingHours = [
      '',
      '09:00:00/17:00:00',
      '09:00:00/17:00:00',
      '09:00:00/17:00:00',
      '09:00:00/17:00:00',
      '09:00:00/17:00:00',
      ''
    ]
    if (!props.listing.workingHours || props.listing.workingHours.length == 0) {
      props.listing.workingHours = this.defaultWorkingHours
    }
    this.state = omit(props.listing, 'valid')
  }

  componentDidMount() {
    if (this.titleInput) {
      this.titleInput.focus()
    }
  }

  render() {
    if (this.state.valid) {
      return <Redirect to={this.props.next} push />
    }

    // For i18n, we'll need to customize how hours are shown
    const workingHoursSelect = [
      ['00:00:00', '12am'],
      ['01:00:00', '1am'],
      ['02:00:00', '2am'],
      ['03:00:00', '3am'],
      ['04:00:00', '4am'],
      ['05:00:00', '5am'],
      ['06:00:00', '6am'],
      ['07:00:00', '7am'],
      ['08:00:00', '8am'],
      ['09:00:00', '9am'],
      ['10:00:00', '10am'],
      ['11:00:00', '11am'],
      ['12:00:00', '12pm'],
      ['13:00:00', '1pm'],
      ['14:00:00', '2pm'],
      ['15:00:00', '3pm'],
      ['16:00:00', '4pm'],
      ['17:00:00', '5pm'],
      ['18:00:00', '6pm'],
      ['19:00:00', '7pm'],
      ['20:00:00', '8pm'],
      ['21:00:00', '9pm'],
      ['22:00:00', '10pm'],
      ['23:00:00', '11pm']
    ]
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <div className="row">
        <div className="col-md-8">
          <div className="create-listing-step-2">
            <div className="wrap">
              <div className="step">
                <fbt desc="create.details.step">
                  Step
                  <fbt:param name="step">{this.props.step}</fbt:param>
                </fbt>
              </div>
              <div className="step-description">
                <fbt desc="create.details.title">Provide listing details</fbt>
              </div>
              <Steps steps={this.props.steps} step={this.props.step} />

              <form
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
                <div className="form-group">
                  <label>
                    <fbt desc="create.Title">Title</fbt>
                  </label>
                  <input {...input('title')} ref={r => (this.titleInput = r)} />
                  {Feedback('title')}
                </div>
                <div className="form-group">
                  <label className="mb-0">
                    <fbt desc="create.Description">Description</fbt>
                  </label>
                  <div className="help-text">
                    <fbt desc="create.description.hourly">
                      Make sure to include special conditions of your rental
                      here.
                    </fbt>
                  </div>
                  <textarea {...input('description')} />
                  {Feedback('description')}
                </div>

                {/* BEGIN Hourly specific code */}

                <PricingChooser {...input('acceptedTokens', true)}>
                  <div className="form-group">
                    <label>
                      <fbt desc="create.hourly.price">
                        Default Price per Hour
                      </fbt>
                    </label>
                    <div className="with-symbol" style={{ maxWidth: 270 }}>
                      <input {...input('price')} />
                      <CurrencySelect {...input('currency', true)} />
                    </div>
                    {Feedback('price')}
                    <div className="help-text price">
                      <fbt desc="create.price.help">
                        Price is an approximation of what you will receive.
                      </fbt>
                      <a
                        href="#/about/payments"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        &nbsp;<fbt desc="create.price.more">Learn More</fbt>
                      </a>
                    </div>
                  </div>
                </PricingChooser>

                <div className="form-group">
                  <label>
                    <fbt desc="create.hourly.hours">
                      Standard Available Hours
                    </fbt>
                  </label>

                  {/* Note: For i18n, we'll need week to sometimes start on Monday */}
                  {[
                    fbt('Sunday', 'Sunday'),
                    fbt('Monday', 'Monday'),
                    fbt('Tuesday', 'Tuesday'),
                    fbt('Wednesday', 'Wednesday'),
                    fbt('Thursday', 'Thursday'),
                    fbt('Friday', 'Friday'),
                    fbt('Saturday', 'Saturday')
                  ].map((dayName, dayIndex) => (
                    <div className="d-flex" key={dayIndex}>
                      <div style={{ height: '3.0rem' }}>
                        <input
                          type="checkbox"
                          style={{ marginRight: '1rem' }}
                          checked={
                            this.state.workingHours.length > 0 &&
                            this.state.workingHours[dayIndex].indexOf('/') > -1
                          }
                          onChange={() => {
                            const newWorkingHours = [...this.state.workingHours]
                            newWorkingHours[dayIndex] = newWorkingHours[
                              dayIndex
                            ]
                              ? (newWorkingHours[dayIndex] = '')
                              : (newWorkingHours[
                                  dayIndex
                                ] = this.defaultWorkingHoursDay)
                            this.setState({ workingHours: newWorkingHours })
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, marginRight: '1rem' }}>
                        <div>{dayName}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        {this.state.workingHours[dayIndex] && (
                          <select
                            className="form-control form-control-lg"
                            value={
                              this.state.workingHours[dayIndex].split('/')[0]
                            }
                            onChange={e => {
                              const newWorkingHours = [
                                ...this.state.workingHours
                              ]
                              newWorkingHours[dayIndex] =
                                e.target.value +
                                '/' +
                                this.state.workingHours[dayIndex].split('/')[1]
                              this.setState({ workingHours: newWorkingHours })
                            }}
                          >
                            {workingHoursSelect.map(([id, display]) => (
                              <option
                                key={id}
                                value={id}
                                disabled={
                                  // Disable hours after end time
                                  id >=
                                  this.state.workingHours[dayIndex].split(
                                    '/'
                                  )[1]
                                }
                              >
                                {display}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        {this.state.workingHours[dayIndex] && (
                          <select
                            className="form-control form-control-lg"
                            value={
                              this.state.workingHours[dayIndex].split('/')[1]
                            }
                            onChange={e => {
                              const newWorkingHours = [
                                ...this.state.workingHours
                              ]
                              newWorkingHours[dayIndex] =
                                this.state.workingHours[dayIndex].split(
                                  '/'
                                )[0] +
                                '/' +
                                e.target.value
                              this.setState({ workingHours: newWorkingHours })
                            }}
                          >
                            {workingHoursSelect.map(([id, display]) => (
                              <option
                                key={id}
                                value={id}
                                disabled={
                                  // Disable hours before start time
                                  id <=
                                  this.state.workingHours[dayIndex].split(
                                    '/'
                                  )[0]
                                }
                              >
                                {display}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
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

                {/* END Hourly specific code */}

                <div className="form-group">
                  <label>
                    <fbt desc="create.select-photos">Select photos</fbt>
                  </label>
                  <ImagePicker
                    images={this.state.media}
                    onChange={media => this.setState({ media })}
                  >
                    <div className="add-photos">
                      <fbt desc="create Select photos help">Select photos</fbt>
                    </div>
                  </ImagePicker>
                  <ul className="help-text photo-help list-unstyled">
                    <fbt desc="create.listing.photos.help">
                      <li>
                        Hold down &apos;command&apos; (⌘) to select multiple
                        images.
                      </li>
                      <li>Maximum 10 images per listing.</li>
                      <li>
                        First image will be featured - drag and drop images to
                        reorder.
                      </li>
                      <li>Recommended aspect ratio is 4:3</li>
                    </fbt>
                  </ul>
                </div>

                <div className="actions">
                  <Link
                    className="btn btn-outline-primary"
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
          </div>
        </div>
        <div className="col-md-4 d-none d-md-block">
          <Wallet />
          <div className="gray-box">
            <fbt desc="create.Add Listing Details">
              <h5>Add Listing Details</h5>
              Be sure to give your listing an appropriate title and description
              to let others know what you&apos;re offering. Adding some photos
              will increase the chances of selling your listing.
            </fbt>
          </div>
        </div>
      </div>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.title) {
      newState.titleError = fbt(
        'Title is required',
        'create.error.Title is required'
      )
    } else if (this.state.title.length < 3) {
      newState.titleError = fbt(
        'Title is too short',
        'create.error.Title is too short'
      )
    } else if (this.state.title.length > 100) {
      // Limit from origin-validator/src/schemas/listing.json
      newState.titleError = fbt(
        'Title is too long',
        'create.error.Title is too long'
      )
    }

    if (!this.state.description) {
      newState.descriptionError = fbt(
        'Description is required',
        'create.error.Description is required'
      )
    } else if (this.state.description.length < 10) {
      newState.descriptionError = fbt(
        'Description is too short',
        'create.error.Description is too short'
      )
    } else if (this.state.description.length > 1024) {
      // Limit from origin-validator/src/schemas/listing.json
      newState.descriptionError = fbt(
        'Description is too long',
        'create.error.Description is too long'
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

export default Details

require('react-styl')(`
  .create-listing .create-listing-step-2
    max-width: 460px
    .step-description
      font-size: 28px
    label
      font-size: 18px;
      font-weight: normal;
      color: var(--dusk)
      margin-bottom: 0.25rem
    .form-control
      border-color: var(--light)
      font-size: 18px;
      &.is-invalid
        border-color: #dc3545
        background-image: none
      &::-webkit-input-placeholder
        color: var(--bluey-grey)
        font-size: 18px;
    .invalid-feedback
      font-weight: normal
    textarea
      min-height: 120px
    .image-picker label
      margin: 0
    .add-photos
      border: 1px dashed var(--light)
      font-size: 14px;
      font-weight: normal;
      color: var(--bluey-grey);
      height: 100%
      min-height: 9rem
      display: flex
      align-items: center
      justify-content: center
      flex-direction: column

      &::before
        content: ""
        background: url(images/camera-icon-circle.svg) no-repeat
        width: 5rem;
        height: 3rem;
        background-size: 100%;
        background-position: center;
        opacity: 0.4;
      &:hover::before
        opacity: 0.6
    .help-text
      font-size: 14px
      font-weight: normal
      margin-bottom: 0.5rem
      color: var(--dusk)
      &.price
        color: var(--bluey-grey)
        margin-top: 0.5rem
      &.photo-help
        font-weight: 300

  .with-symbol
    position: relative
`)

/*
  .with-symbol
    &.corner::before
      content: '';
      position: absolute;
      left: -8px;
      top: 50%;
      width: 0;
      height: 0;
      border-top: 9px solid transparent;
      border-right: 9px solid var(--light);
      border-bottom: 9px solid transparent;
    &.corner::after
      content: '';
      position: absolute;
      left: -6px;
      top: 50%;
      width: 0;
      height: 0;
      border-top: 7px solid transparent;
      border-right: 7px solid #e9ecef;
      border-bottom: 7px solid transparent;
    > span
      cursor: pointer
      position: absolute;
      right: 10px;
      top: 50%;
      padding: 4px 12px 4px 12px;
      border-radius: 16px;
      background: var(--pale-grey);
      background-repeat: no-repeat;
      background-position: 6px center;
      background-size: 17px;
      font-weight: bold;
      font-size: 14px;
      > i
        position: relative
        display: inline-block
        // height should be double border
        height: 12px
        vertical-align: -4px
        margin: 0 8px 0 2px
        &:before,&:after
          position: absolute
          display: block
          content: ""
          // adjust size
          border: 6px solid transparent;
        &:before
          top: 0
          // color
          border-top-color: var(--steel)
      &.eth
        padding-left: 1.75rem
        color: var(--bluish-purple)
        background-image: url(images/eth-icon.svg)
      &.ogn
        padding-left: 1.75rem
        color: var(--clear-blue)
        background-image: url(images/ogn-icon.svg)
      &.usd
        &::before
          content: "$"
          margin-right: 0.25rem
*/
