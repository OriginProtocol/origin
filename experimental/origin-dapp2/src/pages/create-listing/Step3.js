import React, { Component } from 'react'
import pick from 'lodash/pick'

import Steps from 'components/Steps'
import Redirect from 'components/Redirect'
import Link from 'components/Link'

import { formInput, formFeedback } from './_formHelpers'

class Step2 extends Component {
  constructor(props) {
    super(props)
    this.state = { ...props.listing, fields: Object.keys(props.listing) }
  }

  render() {
    const isEdit = this.props.mode === 'edit'
    const prefix = isEdit ? `/listings/${this.props.listingId}/edit` : '/create'

    if (this.state.valid) {
      return <Redirect to={`${prefix}/review`} push />
    }

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <div className="create-listing-step-3">
        <div className="wrap">
          <div className="step">Step 3</div>
          <div className="step-description">Boost your listing</div>
          <Steps steps={3} step={3} />

          <form
            onSubmit={e => {
              e.preventDefault()
              this.validate()
            }}
          >
            <div className="form-group">
              <label>
                {isEdit ? 'Additional Boost' : 'Boost Level (per unit)'}
              </label>
              <input
                {...input('boost')}
                placeholder="OGN to Boost your listing"
              />
              {Feedback('boost')}
            </div>

            <div className="actions">
              <Link className="btn btn-outline-primary" to={`${prefix}/step-2`}>
                Back
              </Link>
              <button type="submit" className="btn btn-primary">
                Review
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.boost) {
      newState.boostError = 'Boost is required'
    } else if (!this.state.boost.match(/^-?[0-9.]+$/)) {
      newState.boostError = 'Boost must be a number'
    } else if (Number(this.state.boost) < 0) {
      newState.boostError = 'Boost must be zero or greater'
    }

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    if (!newState.valid) {
      window.scrollTo(0, 0)
    } else if (this.props.onChange) {
      this.props.onChange(pick(this.state, this.state.fields))
    }
    this.setState(newState)
    return newState.valid
  }
}

export default Step2

require('react-styl')(`
  .create-listing .create-listing-step-3
    max-width: 460px
    .actions
      margin-top: 2.5rem
      display: flex
      justify-content: space-between
      .btn
        min-width: 10rem
        border-radius: 2rem
        padding: 0.625rem
        font-size: 18px
`)
