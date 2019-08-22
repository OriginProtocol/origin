import React, { Component } from 'react'
import { Query } from 'react-apollo'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import { fbt } from 'fbt-runtime'

import withCreatorConfig from 'hoc/withCreatorConfig'
import withGrowthCampaign from 'hoc/withGrowthCampaign'
import withGrowthRewards from 'hoc/withGrowthRewards'
import withWallet from 'hoc/withWallet'
import withTokenBalance from 'hoc/withTokenBalance'
import withIsMobile from 'hoc/withIsMobile'

import BottomScrollListener from 'components/BottomScrollListener'
import QueryError from 'components/QueryError'
import DocumentTitle from 'components/DocumentTitle'
import Link from 'components/Link'

import nextPageFactory from 'utils/nextPageFactory'

import NoResults from './_NoResults'
import Header from './_Header'
import ListingCards from './ListingCards'

import query from 'queries/Listings'

import { getFilters, getStateFromQuery, pushSearchHistory } from './_utils'
import SortMenu from './SortMenu'

import LoadingSpinner from 'components/LoadingSpinner'

const CategoriesEnum = require('Categories$FbtEnum')

const nextPage = nextPageFactory('marketplace.listings')

const CategoryHeader = ({ search: { category, subCategory } }) => {
  let content

  if (category.id) {
    content = CategoriesEnum[category.id]
  } else if (subCategory.id) {
    content =
      subCategory.type === 'clothingAccessories'
        ? CategoriesEnum['schema.apparel']
        : subCategory.type === 'artsCrafts'
        ? CategoriesEnum['schema.art']
        : CategoriesEnum[subCategory.id]
  }

  return content ? <h3 className="category-title">{content}</h3> : null
}

class Listings extends Component {
  constructor(props) {
    super(props)

    this.state = {
      first: 12,
      search: getStateFromQuery(props),
      sortVisible: false
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      this.setState({ search: getStateFromQuery(this.props) })
    }
  }

  handleSortOptionChange = e => {
    const selectedOptions = e.target.value.split(':')
    const search = this.state.search
    search.sort = selectedOptions[0]
    search.order = selectedOptions[1]
    pushSearchHistory(this.props.history, search)
    this.setState({ search, sortVisible: false })
  }

  render() {
    const isCreatedMarketplace = get(
      this.props,
      'creatorConfig.isCreatedMarketplace'
    )
    const creatorFilters = get(this.props, 'creatorConfig.listingFilters', [])
    const filters = [...getFilters(this.state.search), ...creatorFilters]

    const hasStatusFilter = filters.find(filter => filter.name === 'status')

    if (!hasStatusFilter) {
      filters.push({
        name: 'status',
        value: 'active',
        valueType: 'STRING',
        operator: 'EQUALS'
      })
    }

    const vars = {
      ...pick(this.state, 'first'),
      search: this.state.search.searchInput,
      sort: this.state.search.sort,
      order: this.state.search.order,
      filters: filters.map(filter => omit(filter, '__typename'))
    }

    if (this.state.search.ognListings) {
      // when OGN listings are selected clear other search parameters
      vars.search = ''
      vars.filters = []
      delete vars.sort
      delete vars.order
      vars.listingIds = Object.keys(this.props.ognListingRewards)
    }

    const showCategory = get(this.state, 'search.category.type') ? false : true
    const showCount =
      vars.search || vars.filters.length > 1 || this.state.search.ognListings

    const isCategorySearch =
      !isEmpty(get(this.state.search, 'category', {})) ||
      !isEmpty(get(this.state.search, 'subCategory', {}))

    const isSearch =
      get(this.state.search, 'searchInput', '') !== '' ||
      isCategorySearch ||
      this.state.search.ognListings

    const injectCTAs = !isSearch

    const { walletType, isMobile } = this.props

    const shouldShowBackButton =
      isSearch && (walletType === 'Mobile' || walletType === 'Origin Wallet')

    const filterComp = (
      <SortMenu
        {...this.props}
        onChange={this.handleSortOptionChange}
        sort={this.state.search.sort}
        order={this.state.search.order}
      />
    )

    return (
      <>
        <DocumentTitle pageTitle={<fbt desc="listings.title">Listings</fbt>} />
        {isMobile ? null : (
          <div className="listings-menu-bar">{filterComp}</div>
        )}
        <div className="container listings-container">
          {shouldShowBackButton && (
            <Link
              to="/"
              className="btn btn-link btn-back-link"
              children={fbt('Back to home', 'Back to home')}
            />
          )}
          <Query
            query={query}
            variables={{
              ...vars,
              // Fetch two less cards (just for the first request) since we are probably injecting CTAs
              first: injectCTAs ? vars.first - 2 : vars.first
            }}
            notifyOnNetworkStatusChange={true}
            fetchPolicy="cache-and-network"
          >
            {({ error, data, fetchMore, networkStatus, loading }) => {
              if (networkStatus <= 2) {
                return <LoadingSpinner />
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
                  {totalCount == 0 ? (
                    <NoResults {...{ isSearch, isCreatedMarketplace }} />
                  ) : (
                    <>
                      <div className="search-sort-bar">
                        <Header {...{ isSearch, totalCount, showCount }} />
                        {!isMobile ? null : filterComp}
                      </div>
                      {showCount && isCategorySearch ? (
                        <CategoryHeader search={this.state.search} />
                      ) : null}
                      <ListingCards
                        listings={nodes}
                        hasNextPage={hasNextPage}
                        showCategory={showCategory}
                        tokenDecimals={this.props.tokenDecimals}
                        injectCTAs={injectCTAs}
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
                </BottomScrollListener>
              )
            }}
          </Query>
        </div>
      </>
    )
  }
}

export default withIsMobile(
  withGrowthRewards(
    withGrowthCampaign(
      withWallet(withTokenBalance(withCreatorConfig(Listings))),
      {
        fetchPolicy: 'cache-first',
        queryEvenIfNotEnrolled: true,
        suppressErrors: true // still show listings in case growth can not be reached
      }
    )
  )
)

require('react-styl')(`
  .listings-menu-bar
    border-bottom: 1px solid rgba(0, 0, 0, 0.1)
    padding: 0 1rem
    position: relative
    display: flex
    flex-wrap: wrap
    align-items: center
    justify-content: space-between
  .search-sort-bar
    display: flex
    align-items: center
    justify-content: space-between
    margin: 0.5rem 0

  .listings-container
    padding-top: 3rem
  @media (max-width: 767.98px)
    .listings-container
      padding-top: 0
      .search
        margin-bottom: 1.5rem
        &.active
          margin-bottom: 0
`)
