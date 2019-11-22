import React from 'react'
import { fbt } from 'fbt-runtime'
import Link from 'components/Link'

const NoPurchases = () => (
  <div className="no-transactions text-center">
    <div className="image-container">
      <img src="images/empty-icon.svg" />
    </div>
    <h3>
      <fbt desc="Purchases.noPurchaseYet">You haven’t bought anything yet.</fbt>
    </h3>
    <Link to="/" className="btn btn-lg btn-outline-primary btn-rounded">
      <fbt desc="Purchases.browseListings">Browse Listings</fbt>
    </Link>
  </div>
)

export default NoPurchases

require('react-styl')(`
  .no-transactions
    .image-container
      padding-right: 90px
      img
        max-width: 75%
`)
