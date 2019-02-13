import React, { Component } from 'react'
import { Query } from 'react-apollo'
import pick from 'lodash/pick'
import find from 'lodash/find'
import remove from 'lodash/remove'
import { fbt } from 'fbt-runtime'

import BottomScrollListener from 'components/BottomScrollListener'
import QueryError from 'components/QueryError'
import PageTitle from 'components/PageTitle'

import store from 'utils/store'
import nextPageFactory from 'utils/nextPageFactory'

import ListingsGallery from './ListingCards'
import Search from './_Search'

import query from 'queries/Listings'

const memStore = store('memory')
const nextPage = nextPageFactory('marketplace.listings')

function ensureOneCategoryFilter(filters, name) {
  const stateCategoryFilter = find(filters, { name: 'category' })

  if (stateCategoryFilter) {
    filters = remove(filters, filter => {
      filter.name === name
    })
  }
  return filters
}

class Listings extends Component {
  constructor(props) {
    super(props)

    this.saveFilters = this.saveFilters.bind(this)
    this.state = {
      first: 15,
      search: memStore.get('listingsPage.search'),
      sort: 'featured',
      hidden: true,
      filters: []
    }
  }

  saveFilters({ name, value, operator = 'EQUALS', valueType = 'STRING' }) {
    if (!value) {
      this.setState({ filters: [] })
    } else {
      this.setState(state => {
        const filters = ensureOneCategoryFilter(state.filters, name)

        return {
          ...state,
          filters: [
            ...filters,
            {
              name,
              value,
              operator,
              valueType
            }
          ]
        }
      })
    }
  }

  render() {
    const vars = pick(
      this.state,
      'first',
      'sort',
      'hidden',
      'search',
      'filters'
    )

    return (
      <>
        <PageTitle>Listings</PageTitle>
        <Search
          value={this.state.search}
          saveFilters={this.saveFilters}
          filters={this.state.filters}
          onSearch={search => {
            this.setState({ search })
            memStore.set('listingsPage.search', search)
          }}
        />
        <div className="container">
          <Query
            query={query}
            variables={vars}
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

              const { nodes, pageInfo, totalCount } = data.marketplace.listings
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
                    <ListingsGallery
                      listings={nodes}
                      hasNextPage={hasNextPage}
                    />
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
        </div>
      </>
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
  @media (max-width: 575.98px)
    .listings-count
      margin: 1rem 0 0 0
      font-size: 32px
`)
