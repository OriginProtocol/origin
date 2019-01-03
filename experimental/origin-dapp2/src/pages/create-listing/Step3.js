import React, { Component } from 'react'

import Steps from 'components/Steps'
import Link from 'components/Link'

class Step2 extends Component {
  state = {}
  render() {
    return (
      <div className="create-listing-step-3">
        <div className="wrap">
          <div className="step">Step 3</div>
          <div className="step-description">Boost your listing</div>
          <Steps steps={3} step={3} />

          <form>
            <div className="form-group">
              <label>Boost Level (per unit)</label>
              <input
                className="form-control form-control-lg"
                placeholder="This is the title of your listing"
              />
            </div>
          </form>

          <div className="actions">
            <Link className="btn btn-outline-primary" to="/create/step-2">
              Back
            </Link>
            <Link className="btn btn-primary" to="/create/review">
              Review
            </Link>
          </div>
        </div>
      </div>
    )
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
