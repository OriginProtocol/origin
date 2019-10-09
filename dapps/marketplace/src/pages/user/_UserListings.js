import React from 'react'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import QueryError from 'components/QueryError'
import nextPageFactory from 'utils/nextPageFactory'
import ListingsGallery from 'pages/listings/ListingCards'
import query from 'queries/UserListings'
import LoadingSpinner from 'components/LoadingSpinner'

const nextPage = nextPageFactory('marketplace.user.listings')

const UserListings = ({
  user,
  hideHeader,
  hideLoadMore,
  horizontal,
  compact,
  title,
  hideIfEmpty,
  excludeListing
}) => {
  const vars = {
    filter: 'active',
    sort: 'featured'
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
          return <LoadingSpinner />
        } else if (error) {
          return <QueryError error={error} query={query} vars={vars} />
        } else if (!data || !data.marketplace) {
          return (
            <p className="p-3">
              <fbt desc="UserListing.noContract">No marketplace contract?</fbt>
            </p>
          )
        }

        const { nodes, pageInfo } = data.marketplace.user.listings

        const { hasNextPage, endCursor: after } = pageInfo

        if (hideIfEmpty && (!nodes || !nodes.length)) {
          return null
        }

        return (
          <div className="user-listings">
            {hideHeader ? null : (
              <h5 className="listings-header">
                {title || fbt('Listings', 'UserListing.listings')}
              </h5>
            )}
            <ListingsGallery
              listings={
                nodes ? nodes.filter(l => l.id !== excludeListing) : null
              }
              hasNextPage={hasNextPage}
              hideCategory
              horizontal={horizontal}
              compact={compact}
            />
            {hideLoadMore || !hasNextPage ? null : (
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
          </div>
        )
      }}
    </Query>
  )
}

export default UserListings

require('react-styl')(`
  .user-listings
    .listings-header
      font-family: Poppins
      font-size: 1.5rem
      font-weight: 500
      font-style: normal
      font-stretch: normal
      line-height: 1.42
      letter-spacing: normal
      color: var(--dark)

    .row
      flex-wrap: nowrap
      overflow: auto
      .listing-card
        .main-pic
          height: 170px
          width: 170px
        h5
          margin-top: 10px
          font-family: Lato
          font-size: 1.1rem
          font-weight: normal
          font-style: normal
          font-stretch: normal
          line-height: 1.22
          letter-spacing: normal
          color: #293f55
        .price > div
          font-family: Lato
          font-size: 0.9rem
          font-weight: bold
          font-style: normal
          font-stretch: normal
          line-height: normal
          letter-spacing: normal
          color: #293f55
`)
