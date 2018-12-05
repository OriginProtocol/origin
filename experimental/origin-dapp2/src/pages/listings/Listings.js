import React, { Component } from 'react'
import { Query } from 'react-apollo'
import pick from 'lodash/pick'

import BottomScrollListener from 'components/BottomScrollListener'
import LoadingSpinner from 'components/LoadingSpinner'

import store from 'utils/store'
import nextPageFactory from 'utils/nextPageFactory'

import ListingsGallery from './ListingCards'

import query from 'queries/Listings'

const memStore = store('memory')
const nextPage = nextPageFactory('marketplace.listings')

class Listings extends Component {
  state = {
    first: 15,
    searchInput: memStore.get('listingsPage.search', ''),
    search: memStore.get('listingsPage.search'),
    sort: 'featured',
    hidden: true
  }

  render() {
    const vars = pick(this.state, 'first', 'sort', 'hidden', 'search')

    return (
      <Query query={query} variables={vars} notifyOnNetworkStatusChange={true}>
        {({ error, data, fetchMore, networkStatus }) => {
          if (networkStatus === 1) {
            return <LoadingSpinner />
          } else if (error) {
            return <p className="p-3">Error :(</p>
          } else if (!data || !data.marketplace) {
            return <p className="p-3">No marketplace contract?</p>
          }

          const { nodes, pageInfo, totalCount } = data.marketplace.listings
          const { hasNextPage, endCursor: after } = pageInfo

          return (
            <BottomScrollListener
              offset={200}
              ready={networkStatus === 7}
              hasMore={hasNextPage}
              onBottom={() => nextPage(fetchMore, { ...vars, after })}
            >
              <>
                <h5 className="listings-count">{`${totalCount} Listings`}</h5>

                <ListingsGallery listings={nodes} hasNextPage={hasNextPage} />

                {!hasNextPage ? null : (
                  <button
                    className="mt-3"
                    onClick={() => nextPage(fetchMore, { ...vars, after })}
                  >
                    Load more...
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

export default Listings

require('react-styl')(`
  .listings-count
    font-family: Poppins;
    font-size: 40px;
    font-weight: 200;
    color: var(--dark);
    margin-top: 3rem
`)
