import React, { Component } from 'react'
import { Query } from 'react-apollo'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import queryString from 'query-string'
import { fbt } from 'fbt-runtime'

import withCreatorConfig from 'hoc/withCreatorConfig'

import BottomScrollListener from 'components/BottomScrollListener'
import QueryError from 'components/QueryError'
import DocumentTitle from 'components/DocumentTitle'
import Link from 'components/Link'

import store from 'utils/store'
import nextPageFactory from 'utils/nextPageFactory'

import ListingsGallery from './ListingCards'
import Search from './_Search'

import query from 'queries/Listings'

import { getFilters, getStateFromQuery } from './_filters'

const memStore = store('memory')
const nextPage = nextPageFactory('marketplace.listings')

class Listings extends Component {
  constructor(props) {
    super(props)

    this.state = {
      first: 15,
      search: getStateFromQuery(props),
      sort: 'featured',
      hidden: true
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      this.setState({ search: getStateFromQuery(this.props) })
    }
  }

  render() {
    const isCreatedMarketplace = get(
      this.props,
      'creatorConfig.isCreatedMarketplace'
    )
    const creatorFilters = get(this.props, 'creatorConfig.listingFilters', [])
    const filters = [...getFilters(this.state.search), ...creatorFilters]

    const vars = {
      ...pick(this.state, 'first', 'sort', 'hidden'),
      search: this.state.search.searchInput,
      filters: filters.map(filter => omit(filter, '__typename'))
    }

    const showCategory = get(this.state, 'search.category.type') ? false : true

    const isSearch =
      get(this.state.search, 'searchInput', '') !== '' ||
      !isEmpty(get(this.state.search, 'category', {}))

    return (
      <>
        <DocumentTitle pageTitle={<fbt desc="listings.title">Listings</fbt>} />
        <Search
          value={this.state.search}
          onSearch={search => {
            this.setState({ search })
            memStore.set('listingsPage.search', search)
            this.props.history.push({
              to: '/search',
              search: queryString.stringify({
                q: search.searchInput || undefined,
                category: search.category.type || undefined,
                priceMin: search.priceMin || undefined,
                priceMax: search.priceMax || undefined
              })
            })
          }}
        />
        <div className="container">
          <Query
            query={query}
            variables={vars}
            notifyOnNetworkStatusChange={true}
          >
            {({ error, data, fetchMore, networkStatus, loading }) => {
              if (networkStatus <= 2) {
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
                    {totalCount == 0 && (
                      <div className="listings-empty">
                        <div className="row">
                          <div className="col text-center">
                            <img src="images/empty-listings-graphic.svg" />
                            {isSearch && (
                              <h1>
                                <fbt desc="listings.noListingsSearch">
                                  No search results found
                                </fbt>
                              </h1>
                            )}

                            {isCreatedMarketplace && !isSearch && (
                              <>
                                <h1>
                                  <fbt desc="listings.noListingsWhitelabel">
                                    Your marketplace doesn&apos;t have any
                                    listings yet
                                  </fbt>
                                </h1>
                                <p>
                                  <fbt desc="listings.noListingsWhitelabelMessage">
                                    You can create listings yourself or invite
                                    sellers to join your platform!
                                  </fbt>
                                </p>
                                <div className="row">
                                  <div className="col text-center">
                                    <Link
                                      to="/create"
                                      className="btn btn-lg btn-primary"
                                    >
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
                                <fbt desc="listings.noListings">
                                  No listings found
                                </fbt>
                              </h1>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {totalCount > 0 && (
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
                          showCategory={showCategory}
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
                            {loading
                              ? fbt('Loading...', 'Loading...')
                              : fbt('Load more', 'Load more')}
                          </button>
                        )}
                      </>
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

export default withCreatorConfig(Listings)

require('react-styl')(`
  .listings-count
    font-family: var(--heading-font);
    font-size: 40px;
    font-weight: 200;
    color: var(--dark);
    margin-top: 3rem
  .listings-empty
    margin-top: 10rem
  @media (max-width: 767.98px)
    .listings-count
      margin: 2rem 0 0 0
      font-size: 32px
`)
