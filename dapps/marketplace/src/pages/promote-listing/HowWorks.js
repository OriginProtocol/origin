import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const HowWorks = ({ match }) => (
  <>
    <h1>
      <Link
        to={`/listing/${match.params.listingId}`}
        className="back d-md-none"
      />
      <fbt desc="PromoteListing.title">Promote Listing</fbt>
    </h1>
    <div className="how-works">
      <h4>
        <fbt desc="PromoteListing.howItWorksTitle">How does it work?</fbt>
      </h4>
      <div className="mt-3">
        <fbt desc="PromoteListing.howItWorksDescription">
          You can promote your listing with Origin Tokens (OGN) to get higher placement and more exposure on the Origin app and broader network.
        </fbt>
      </div>
      <div className="mt-3">
        <fbt desc="PromoteListing.exposure">
          Your OGN deposit acts as a commission that will be deducted every time a sale is made. Think of this as advertising to attract more buyers to your listing.
        </fbt>
      </div>
      <div className="actions">
        <Link
          to={`/listing/${match.params.listingId}`}
          className="btn btn-outline-primary btn-rounded btn-lg mr-3 d-none d-sm-inline-block"
          children={fbt('Back', 'Back')}
        />
        <Link
          to={`/promote/${match.params.listingId}/amount`}
          className="btn btn-primary btn-rounded btn-lg"
          children={fbt('Continue', 'Continue')}
        />
      </div>
    </div>
  </>
)

export default HowWorks

require('react-styl')(`
  .promote-listing
    .how-works
      &:before
        content: ""
        width: 6rem
        height: 6rem
        background: url(images/rockets-graphic.png) no-repeat
        background-size: contain
        margin-bottom: 1rem
`)
