import React, { Component } from 'react'
import { Query } from 'react-apollo'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import { fbt } from 'fbt-runtime'

import withCreatorConfig from 'hoc/withCreatorConfig'
import withGrowthCampaign from 'hoc/withGrowthCampaign'
import withWallet from 'hoc/withWallet'
import withTokenBalance from 'hoc/withTokenBalance'
import withIsMobile from 'hoc/withIsMobile'

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

const CategoriesEnum = require('Categories$FbtEnum')

const memStore = store('memory')
const nextPage = nextPageFactory('marketplace.listings')

class Listings extends Component {
  constructor(props) {
    super(props)

    this.state = {
      first: 12,
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

  getHeader(totalCount, isSearch) {
    let className = 'listings-count'
    let content = (
      <fbt desc="Num Listings">
        <fbt:plural count={totalCount} showCount="yes">
          Listing
        </fbt:plural>
      </fbt>
    )

    if (isSearch) {
      className += ' search-results'
      if (this.state.search.category.id) {
        content = (
          <fbt desc="NumCategoryResults">
            <fbt:param name="count">{totalCount}</fbt:param>{' '}
            <fbt:param name="category">
              {CategoriesEnum[this.state.search.category.id]}
            </fbt:param>{' '}
            <fbt:plural count={totalCount} showCount="no">
              result
            </fbt:plural>
          </fbt>
        )
      } else if (this.state.search.subCategory.id) {
        content = (
          <fbt desc="NumCategoryResults">
            <fbt:param name="count">{totalCount}</fbt:param>{' '}
            <fbt:param name="category">
              {this.state.search.subCategory.type === 'clothingAccessories'
                ? CategoriesEnum['schema.apparel']
                : this.state.search.subCategory.type === 'artsCrafts'
                ? CategoriesEnum['schema.art']
                : CategoriesEnum[this.state.search.subCategory.id]}
            </fbt:param>{' '}
            <fbt:plural count={totalCount} showCount="no">
              result
            </fbt:plural>
          </fbt>
        )
      } else {
        content = (
          <fbt desc="NumResults">
            <fbt:plural count={totalCount} showCount="yes">
              result
            </fbt:plural>
          </fbt>
        )
      }
    }
    return <h5 className={className}>{content}</h5>
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
    const showCount = vars.search || vars.filters.length

    const isSearch =
      get(this.state.search, 'searchInput', '') !== '' ||
      !isEmpty(get(this.state.search, 'category', {})) ||
      !isEmpty(get(this.state.search, 'subCategory', {}))

    return (
      <>
        <DocumentTitle pageTitle={<fbt desc="listings.title">Listings</fbt>} />
        <div className="container listings-container">
          {this.props.isMobile ? (
            <Search className="search" placeholder />
          ) : null}
          <Query
            query={query}
            variables={vars}
            notifyOnNetworkStatusChange={true}
            fetchPolicy="cache-and-network"
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
                  offset={400}
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
                        {showCount
                          ? this.getHeader(totalCount, isSearch)
                          : null}
                        <ListingsGallery
                          listings={nodes}
                          hasNextPage={hasNextPage}
                          showCategory={showCategory}
                          growthCampaigns={this.props.growthCampaigns}
                          tokenDecimals={this.props.tokenDecimals}
                          injectCTAs={true}
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

export default withGrowthCampaign(
  withWallet(withTokenBalance(withCreatorConfig(withIsMobile(Listings)))),
  {
    fetchPolicy: 'cache-first',
    queryEvenIfNotEnrolled: true,
    suppressErrors: true // still show listings in case growth can not be reached
  }
)

require('react-styl')(`
  .listings-container
    padding-top: 3rem
  .listings-count
    font-family: var(--heading-font);
    font-size: 40px;
    font-weight: 200;
    color: var(--dark);
  .listings-empty
    margin-top: 10rem
  @media (max-width: 767.98px)
    .listings-container
      padding-top: 0
      .search
        margin-bottom: 1.5rem
        &.active
          margin-bottom: 0
    .listings-count
      margin: 0
      font-size: 32px
      &.search-results
        font-size: 14px
        margin-bottom: 1rem
        font-weight: normal
`)
