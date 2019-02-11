import React, { Component } from 'react'
import { Query } from 'react-apollo'
import pick from 'lodash/pick'
import { fbt } from 'fbt-runtime'

import QueryError from 'components/QueryError'
import BottomScrollListener from 'components/BottomScrollListener'

import store from 'utils/store'
import nextPageFactory from 'utils/nextPageFactory'

import ListingsGallery from 'pages/listings/ListingCards'

import query from 'queries/UserListings'

const memStore = store('memory')
const nextPage = nextPageFactory('marketplace.user.listings')

class UserListings extends Component {
  state = {
    first: 15,
    sort: 'featured',
    hidden: true
  }

  render() {
    const vars = pick(this.state, 'first', 'sort', 'hidden', 'search')

    return (
      <Query
        query={query}
        skip={!this.props.user}
        variables={{ id: this.props.user, ...vars }}
        notifyOnNetworkStatusChange={true}
      >
        {({ error, data, fetchMore, networkStatus, loading }) => {
          if (networkStatus === 1) {
            return <h5 className="listings-count">Loading...</h5>
          } else if (error) {
            return <QueryError error={error} query={query} vars={vars} />
          } else if (!data || !data.marketplace) {
            return <p className="p-3">No marketplace contract?</p>
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
                    {loading ? 'Loading...' : 'Load more'}
                  </button>
                )}
              </>
            </BottomScrollListener>
          )
        }}
      </Query>
    )
  }

  doSearch(search) {
    this.setState({ activeSearch: search, search })
    memStore.set('listingsPage.search', search)
  }
}

export default UserListings
