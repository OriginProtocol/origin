import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

import withWeb3 from 'hoc/withWeb3'

import get from 'lodash/get'

const HowWorks = ({ match, web3, web3Loading }) => {
  const isMainnet = get(web3, 'networkId') === 1

  return (
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
            You can promote your listing with Origin Tokens (OGN) to get higher
            placement and more exposure on the Origin app and broader network.
          </fbt>
        </div>
        {!web3Loading && isMainnet && (
          <div className="mt-3">
            <fbt desc="PromoteListing.exposure">
              Your OGN deposit acts as a commission that will be deducted every
              time a sale is made. Think of this as advertising to attract more
              buyers to your listing.
            </fbt>
          </div>
        )}
        <div className="promotions-disabled mt-3">
          <fbt desc="PromoteListing.disabledOnMainnet">
            <div>We’re currently updating our smart contracts.</div>
            <div>Please check back soon.</div>
          </fbt>
        </div>
        <div className="actions">
          <Link
            to={`/listing/${match.params.listingId}`}
            className="btn btn-outline-primary btn-rounded btn-lg mr-3 d-none d-sm-inline-block"
            children={fbt('Back', 'Back')}
          />
          {web3Loading && (
            <button className="btn btn-primary btn-rounded btn-lg" disabled>
              <fbt desc="Loading...">Loading...</fbt>
            </button>
          )}
          {isMainnet && !web3Loading && (
            <button className="btn btn-primary btn-rounded btn-lg" disabled>
              <fbt desc="Continue">Continue</fbt>
            </button>
          )}
          {!isMainnet && !web3Loading && (
            <Link
              to={`/promote/${match.params.listingId}/amount`}
              className="btn btn-primary btn-rounded btn-lg"
              children={fbt('Continue', 'Continue')}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default withWeb3(HowWorks)

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
      .promotions-disabled
        border: 1px solid #fec100
        background-color: rgba(254, 193, 0, 0.1)
        border-radius: 5px
        text-align: center
        color: #000
        font-size: 0.875rem
        padding: 0.8rem
        font-weight: bold
  @media (max-width: 767.98px)
    .promotions-disabled
      width: 100%
`)
