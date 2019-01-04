import React, { Component } from 'react'

import Redirect from 'components/Redirect'
import Link from 'components/Link'

import CreateListing from './mutations/CreateListing'
import UpdateListing from './mutations/UpdateListing'

class Review extends Component {
  state = {}
  render() {
    const isEdit = this.props.mode === 'edit'
    const prefix = isEdit ? `/listings/${this.props.listingId}/edit` : '/create'

    const { listing } = this.props
    if (!listing.subCategory) {
      return <Redirect to={`${prefix}/step-1`} />
    } else if (!listing.title) {
      return <Redirect to={`${prefix}/step-2`} />
    }

    return (
      <div className="row create-listing-review">
        <div className="col-md-8">
          <h2>Review your listing</h2>

          <div className="detail">
            <div className="row">
              <div className="col-3 label">Title</div>
              <div className="col-9">{listing.title}</div>
            </div>
            <div className="row">
              <div className="col-3 label">Cagegory</div>
              <div className="col-9">{listing.subCategory}</div>
            </div>
            <div className="row">
              <div className="col-3 label">Description</div>
              <div className="col-9">{listing.description}</div>
            </div>
            <div className="row">
              <div className="col-3 label">Location</div>
              <div className="col-9">{listing.location}</div>
            </div>
            <div className="row">
              <div className="col-3 label">Photos</div>
              <div className="col-9" />
            </div>
            <div className="row">
              <div className="col-3 label">Listing Price</div>
              <div className="col-9">{`${listing.price} ETH`}</div>
            </div>
            <div className="row">
              <div className="col-3 label">Boost Level</div>
              <div className="col-9">{`${listing.boost} OGN`}</div>
            </div>
          </div>

          <div className="actions">
            <Link className="btn btn-outline-primary" to={`${prefix}/step-3`}>
              Back
            </Link>
            {isEdit ? (
              <UpdateListing
                listing={this.props.listing}
                listingId={this.props.listingId}
                className="btn btn-primary"
                children="Done"
              />
            ) : (
              <CreateListing
                listing={this.props.listing}
                className="btn btn-primary"
                children="Done"
              />
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default Review

require('react-styl')(`
  .create-listing .create-listing-review
    h2
      font-size: 28px

    .detail
      border: 1px solid var(--light)
      border-radius: 5px
      padding: 1rem 2rem
      font-size: 18px
      font-weight: normal
      .row
        margin-bottom: 1rem
        .label
          color: var(--dusk)

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
