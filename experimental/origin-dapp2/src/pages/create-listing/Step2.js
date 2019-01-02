import React, { Component } from 'react'

import Steps from 'components/Steps'
import Link from 'components/Link'

class Step2 extends Component {
  state = {}
  render() {
    return (
      <div className="create-listing-step-2">
        <div className="wrap">
          <div className="step">Step 2</div>
          <div className="step-description">Provide listing details</div>
          <Steps steps={3} step={2} />

          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label>Title</label>
              <input
                className="form-control form-control-lg"
                placeholder="This is the title of your listing"
                required
              />
              {/* <div className="invalid-feedback">Invalid</div> */}
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control form-control-lg">
                <option>Select one</option>
              </select>
            </div>
            <div className="form-group">
              <label className="mb-0">Description</label>
              <div className="help-text">
                Make sure to include any product variant details here. Learn
                more
              </div>
              <textarea
                placeholder="Tell us a bit about this listing"
                className="form-control form-control-lg"
              />
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
                className="form-control form-control-lg"
                placeholder="How many are you selling?"
              />
            </div>
            <div className="form-group">
              <label>Listing Price (per unit)</label>
              <input className="form-control form-control-lg" />
              <div className="help-text price">
                The cost to buy this listing. Price is always in ETH, USD is an
                estimate.
              </div>
            </div>

            <div className="actions">
              <Link className="btn btn-outline-primary" to="/create">
                Back
              </Link>
              <button type="submit" className="btn btn-primary">
                Continue
              </button>
              {/* <Link className="btn btn-primary" to="/create/step-3">
                Continue
              </Link> */}
            </div>
          </form>
        </div>
      </div>
    )
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
