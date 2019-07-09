import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const HowWorks = ({ match }) => (
  <>
    <h1>
      <Link to={'/'} className="back d-md-none" />
      <fbt desc="PromoteListing.title">Promote Listing</fbt>
    </h1>
    <div className="how-works">
      <h4>How does it work?</h4>
      <div>
        You can promote your listing by depositing Origin Tokens (OGN). Your OGN
        is like a <b>commission</b> that will be deducted each time a sale is
        made. This gives your listing <b>more exposure</b> across the Origin
        network
      </div>
      <div className="actions">
        <Link
          to={`/promote/${match.params.listingId}/amount`}
          className="btn btn-primary btn-rounded btn-lg"
        >
          Continue
        </Link>
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
      align-items: center
      text-align: center
      min-height: calc(100vh - 8rem)
      justify-content: space-around
      font-weight: 300
      font-size: 18px
      padding: 0 1rem
      &:before
        content: ""
        width: 6rem
        height: 6rem
        border-radius: 50%
        background: var(--dark)
      h4
        margin: 0
        font-size: 20px
        font-weight: bold
`)
