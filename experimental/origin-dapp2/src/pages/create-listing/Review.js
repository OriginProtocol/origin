import React, { Component } from 'react'

import Link from 'components/Link'

class Review extends Component {
  state = {}
  render() {
    return (
      <div className="create-listing-review">
        <h2>Review your listing</h2>

        <div className="actions">
          <Link className="btn btn-outline-primary" to="/create/step-3">
            Back
          </Link>
          <Link className="btn btn-primary" to="/create/review">
            Done
          </Link>
        </div>
      </div>
    )
  }
}

export default Review

require('react-styl')(`
  .create-listing .create-listing-review
    max-width: 460px
    h2
      font-size: 28px

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
