import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const NoListings = ({ isSearch, isCreatedMarketplace }) => (
  <div className="listings-empty">
    <div className="row">
      <div className="col text-center">
        <img src="images/empty-listings-graphic.svg" />
        {isSearch && (
          <h1>
            <fbt desc="listings.noListingsSearch">No search results found</fbt>
          </h1>
        )}

        {isCreatedMarketplace && !isSearch && (
          <>
            <h1>
              <fbt desc="listings.noListingsWhitelabel">
                Your marketplace doesn&apos;t have any listings yet
              </fbt>
            </h1>
            <p>
              <fbt desc="listings.noListingsWhitelabelMessage">
                You can create listings yourself or invite sellers to join your
                platform!
              </fbt>
            </p>
            <div className="row">
              <div className="col text-center">
                <Link to="/create" className="btn btn-lg btn-primary">
                  <fbt desc="listings.createListingButton">
                    Create a Listing
                  </fbt>
                </Link>
              </div>
            </div>
          </>
        )}

        {!isCreatedMarketplace && !isSearch && (
          <h1>
            <fbt desc="listings.noListings">No listings found</fbt>
          </h1>
        )}
      </div>
    </div>
  </div>
)

export default NoListings

require('react-styl')(`
  .listings-empty
    margin-top: 10rem
`)
