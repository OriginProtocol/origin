import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'
import { withRouter } from 'react-router-dom'
import get from 'lodash/get'

import Redirect from 'components/Redirect'
import Link from 'components/Link'

import PromoteCTA from 'pages/listing/_PromoteCTA'

import Store from 'utils/store'
const store = Store('sessionStorage')

const ListingCreated = ({ match }) => {
  const [redirectTo, setRedirectTo] = useState(null)

  const listingId = get(match, 'params.listingId')

  if (!redirectTo && !listingId) {
    store.set('create-listing', undefined)
    setRedirectTo('/')
  } else if (redirectTo) {
    return <Redirect to={redirectTo} push />
  }

  return (
    <div className="listing-created">
      <h2 className="mt-3">
        <fbt desc="Congratulations">Congratulations</fbt>
      </h2>
      <div>
        <fbt desc="CreateListing.Published">
          You&apos;ve successfully published your listing.
        </fbt>
      </div>
      <div className="actions">
        <PromoteCTA listingId={listingId} />
        <Link
          className="btn btn-link"
          to={`/listing/${listingId}`}
          onClick={() => store.set('create-listing', undefined)}
        >
          <fbt desc="CreateListing.ViewListing">View My Listing</fbt>
        </Link>
        <Link
          className="btn btn-link"
          to={`/create`}
          onClick={() => store.set('create-listing', undefined)}
        >
          <fbt desc="CreateListing.CreateAnotherListing">
            Create Another Listing
          </fbt>
        </Link>
      </div>
    </div>
  )
}

export default withRouter(ListingCreated)

require('react-styl')(`
  .listing-created
    max-width: 550px
    text-align: center
    display: flex
    flex-direction: column
    flex: 1
    padding-top: 2.5rem
    margin: 0 auto
    h2
      margin-bottom: 1rem
      &:before
        content: ""
        height: 6rem
        background: url(images/checkmark-icon-large.svg) no-repeat
        background-size: contain
        background-position: center
        margin-bottom: 1rem
        display: block
    .actions
      display: flex
      margin-top: 2rem
      flex-direction: column
      .btn
        width: 100%
        text-align: center
  @media (max-width: 767.98px)
    .listing-created
      width: 100%
      .actions
        margin-top: auto
`)
