import React from 'react'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import QueryError from 'components/QueryError'
import BottomScrollListener from 'components/BottomScrollListener'

import nextPageFactory from 'utils/nextPageFactory'

import ListingsGallery from 'pages/listings/ListingCards'

import query from 'queries/UserListings'

const nextPage = nextPageFactory('marketplace.user.listings')

const UserListings = ({ user }) => {
  const vars = {
    first: 15,
    filter: 'active',
    sort: 'featured',
    hidden: true
  }

  return (
    <Query
      query={query}
      skip={!user}
      variables={{ id: user, ...vars }}
      notifyOnNetworkStatusChange={true}
    >
      {({ error, data, fetchMore, networkStatus, loading }) => {
        if (networkStatus === 1) {
          return (
            <h5 className="listings-count">
              <fbt desc="UserListing.loading">Loading...</fbt>
            </h5>
          )
        } else if (error) {
          return <QueryError error={error} query={query} vars={vars} />
        } else if (!data || !data.marketplace) {
          return (
            <p className="p-3">
              <fbt desc="UserListing.noContract">No marketplace contract?</fbt>
            </p>
          )
        }

        const { nodes, pageInfo, totalCount } = data.marketplace.user.listings
        const { hasNextPage, endCursor: after } = pageInfo

        return (
          <BottomScrollListener
            offset={200}
            ready={networkStatus === 7}
            hasMore={hasNextPage}
            onBottom={() => {
              if (!loading) {
                nextPage(fetchMore, { ...vars, after })
              }
            }}
          >
            <>
              <h5 className="listings-count">
                <fbt desc="Num Listings">
                  <fbt:plural count={totalCount} showCount="yes">
                    Listing
                  </fbt:plural>
                </fbt>
              </h5>
              <ListingsGallery listings={nodes} hasNextPage={hasNextPage} />
              {!hasNextPage ? null : (
                <button
                  className="btn btn-outline-primary btn-rounded mt-3"
                  onClick={() => {
                    if (!loading) {
                      nextPage(fetchMore, { ...vars, after })
                    }
                  }}
                >
                  {loading
                    ? fbt('Loading...', 'UserListing.loading')
                    : fbt('Load more', 'userListing.loadMore')}
                </button>
              )}
            </>
          </BottomScrollListener>
        )
      }}
    </Query>
  )
}

export default UserListings
