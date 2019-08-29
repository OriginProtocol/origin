import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import omit from 'lodash/omit'

import Redirect from 'components/Redirect'
import Link from 'components/Link'

import { formInput, formFeedback } from 'utils/formHelpers'

class Details extends Component {
  constructor(props) {
    super(props)
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

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <>
        <h1>
          <Link to={this.props.prev} className="back d-md-none" />
          <fbt desc="createListing.listingDetails">Listing Details</fbt>
        </h1>
        <div className="row">
          <div className="col-md-8">
            <form
              className="listing-step"
              autoComplete="off"
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
                <input
                  {...input('title')}
                  ref={r => (this.titleInput = r)}
                  placeholder={fbt(
                    'This is the title of your listing',
                    'createListing.titlePlaceholder'
                  )}
                />
                {Feedback('title')}
              </div>
              <div className="form-group">
                <label>
                  <fbt desc="create.details.description">Description</fbt>
                </label>
                <textarea {...input('description')} />
                {Feedback('description')}
                <div className="help-text mt-3">
                  <fbt desc="create.details.description.help">
                    Include the available size(s) and instructions for your
                    buyers if there are any options for them to choose from
                  </fbt>
                </div>
              </div>

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
  .create-listing
    .listing-step
      align-items: center
      display: flex
      flex-direction: column
      padding: 2rem 0.5rem
      .alert-danger
        border: unset
        background: unset
      .form-group
        display: flex
        flex-direction: column
        margin-bottom: 4rem
        text-align: center
        width: 100%
      label
        font-size: 20px
        font-weight: bold
        color: #000
      input.form-control
        border-radius: 0
        border-width: 0 0 1px 0
        text-align: center
        border-color: var(--light)
        &:focus
          box-shadow: unset
        &::-webkit-input-placeholder
          color: var(--bluey-grey)
      .help-text
        color: var(--bluey-grey)
        font-size: 14px
        line-height: 1.3
      .actions
        .btn
          border-radius: 2rem
          padding: 0.625rem 2rem
          min-width: 10rem
          font-size: 18px
          &:not(:last-child)
            margin-right: 0.75rem

  @media (min-width: 767.98px)
    .create-listing
      .listing-step
        margin-top: 1.5rem
        border: 1px solid var(--light)
        &:not(.no-pad)
          padding: 4rem 1.5rem
        align-items: center
        display: flex
        flex-direction: column
        border-radius: 5px
        max-width: 600px
        .form-group
          max-width: 21rem

  @media (max-width: 767.98px)
    .create-listing
      .listing-step
        .actions
          width: 100%
          .btn
            width: 100%
        .form-group
          margin-bottom: 3rem
`)
