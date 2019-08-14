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
      <div>
        <fbt desc="PromoteListing.howItWorksDescription">
          You can promote your listing by depositing Origin Tokens (OGN). Your
          OGN is like a <b>commission</b> that will be deducted each time a sale
          is made. This gives your listing <b>more exposure</b> across the
          Origin network
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
      display: flex
      flex-direction: column
      flex: 1
      align-items: center
      text-align: center
      justify-content: space-around
      font-weight: 300
      font-size: 18px
      padding: 0 1rem
      &:before
        content: ""
        width: 6rem
        height: 6rem
        background: url(images/rockets-graphic.png) no-repeat
        background-size: contain
      h4
        margin: 0
        font-size: 20px
        font-weight: bold
`)
