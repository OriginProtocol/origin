import React, { Component } from 'react'
import { Query } from 'react-apollo'
import pick from 'lodash/pick'
import get from 'lodash/get'
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

function ensureOneCategoryFilter(stateFilters, filters) {
  const stateCategoryFilter = find(stateFilters, { name: 'category' })
  const newCategoryFilter = find(filters, { name: 'category' })

  if (stateCategoryFilter && newCategoryFilter) {
    stateFilters = remove(stateFilters, filter => {
      filter.name === newCategoryFilter.name
    })
  }
  return stateFilters
}

function prepareValue(value) {
  if (Array.isArray(value)) {
    return value.join(',')
  } else if (parseFloat(value) !== NaN) {
    return value.toString()
  }
  return value
}

function prepareFilters(filters = []) {
  if (filters.length) {
    return filters.map(({ value, ...filter }) => {
      return { ...filter, value: prepareValue(value) }
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

  saveFilters(filters = []) {
    if (!filters.length) {
      this.setState({ filters: [] })
    } else {
      this.setState(state => {
        const stateFilters = ensureOneCategoryFilter(state.filters, filters)

        return {
          ...state,
          filters: [
            ...stateFilters,
            ...filters
          ]
        }
      })
    }
  }

  render() {
    const unchangedVars = pick(this.state, 'first', 'sort', 'hidden', 'search')
    const filters = prepareFilters(get(this.state, 'filters', []))
    const vars = { ...unchangedVars, filters }

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
