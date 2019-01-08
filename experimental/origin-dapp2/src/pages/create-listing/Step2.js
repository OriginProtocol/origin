import React, { Component } from 'react'
import pick from 'lodash/pick'

import Steps from 'components/Steps'
import Redirect from 'components/Redirect'
import Link from 'components/Link'
import Wallet from 'components/Wallet'

import { formInput, formFeedback } from 'utils/formHelpers'

class Step2 extends Component {
  constructor(props) {
    super(props)
    this.state = { ...props.listing, fields: Object.keys(props.listing) }
  }

  componentDidMount() {
    if (this.title) {
      this.title.focus()
    }
  }

  render() {
    const prefix =
      this.props.mode === 'edit'
        ? `/listings/${this.props.listingId}/edit`
        : '/create'

    if (this.state.valid) {
      return <Redirect to={`${prefix}/step-3`} push />
    } else if (!this.state.subCategory) {
      return <Redirect to={`${prefix}/step-1`} />
    }

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    return (
      <div className="row">
        <div className="col-md-8">
          <div className="create-listing-step-2">
            <div className="wrap">
              <div className="step">Step 2</div>
              <div className="step-description">Provide listing details</div>
              <Steps steps={3} step={2} />

              <form
                onSubmit={e => {
                  e.preventDefault()
                  this.validate()
                }}
              >
                {this.state.valid !== false ? null : (
                  <div className="alert alert-danger">
                    Please fix the errors below...
                  </div>
                )}
                <div className="form-group">
                  <label>Title</label>
                  <input
                    {...input('title')}
                    placeholder="This is the title of your listing"
                    ref={r => (this.title = r)}
                  />
                  {Feedback('title')}
                </div>
                <div className="form-group">
                  <label className="mb-0">Description</label>
                  <div className="help-text">
                    Make sure to include any product variant details here. Learn
                    more
                  </div>
                  <textarea
                    {...input('description')}
                    placeholder="Tell us a bit about this listing"
                  />
                  {Feedback('description')}
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    className="form-control form-control-lg"
                    placeholder="Where is this listing being offered"
                  />
                </div>
                <div className="form-group">
                  <label>Add Photos</label>
                  <div className="add-photos">Add photo</div>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    {...input('quantity')}
                    placeholder="How many are you selling?"
                  />
                  {Feedback('quantity')}
                </div>
                <div className="form-group">
                  <label>Listing Price (per unit)</label>
                  <input {...input('price')} />
                  {Feedback('price')}
                  <div className="help-text price">
                    The cost to buy this listing. Price is always in ETH, USD is
                    an estimate.
                  </div>
                </div>

                <div className="actions">
                  <Link className="btn btn-outline-primary" to={prefix}>
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
          <Wallet />
        </div>
      </div>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.title) {
      newState.titleError = 'Title is required'
    } else if (this.state.title.length < 3) {
      newState.titleError = 'Title is too short'
    }

    if (!this.state.description) {
      newState.descriptionError = 'Description is required'
    } else if (this.state.description.length < 10) {
      newState.descriptionError = 'Description is too short'
    }

    if (!this.state.quantity) {
      newState.quantityError = 'Quantity is required'
    } else if (!this.state.quantity.match(/^-?[0-9]+$/)) {
      newState.quantityError = 'Quantity must be a number'
    } else if (Number(this.state.quantity) <= 0) {
      newState.quantityError = 'Quantity must be greater than zero'
    }

    if (!this.state.price) {
      newState.priceError = 'Price is required'
    } else if (!this.state.price.match(/^-?[0-9.]+$/)) {
      newState.priceError = 'Price must be a number'
    } else if (Number(this.state.price) <= 0) {
      newState.priceError = 'Price must be greater than zero'
    }

    if (!this.state.category) {
      newState.categoryError = 'Category is required'
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
        // padding-right: 2.25rem;
        // background-repeat: no-repeat;
        // background-position: center right calc(2.25rem / 4);
        // background-size: calc(2.25rem / 2) calc(2.25rem / 2);
        // background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%23dc3545' viewBox='-2 -2 7 7'%3e%3cpath stroke='%23d9534f' d='M0 0l3 3m0-3L0 3'/%3e%3ccircle r='.5'/%3e%3ccircle cx='3' r='.5'/%3e%3ccircle cy='3' r='.5'/%3e%3ccircle cx='3' cy='3' r='.5'/%3e%3c/svg%3E")
      &::-webkit-input-placeholder
        color: var(--bluey-grey)
        font-size: 18px;
    .invalid-feedback
      font-weight: normal
    textarea
      min-height: 120px
    .add-photos
      border: 1px dashed var(--light)
      // border-image-source: url(http://i.stack.imgur.com/wLdVc.png)
      // border-image-slice: 2
      // border-image-repeat: round;

      font-size: 14px;
      font-weight: normal;
      color: var(--bluey-grey);
      width: 15rem;
      height: 9rem;
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
    .help-text
      font-size: 14px
      font-weight: normal
      margin-bottom: 0.5rem
      color: var(--dusk)
      &.price
        color: var(--bluey-grey)
        margin-top: 1rem
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
