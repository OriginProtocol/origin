import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import omit from 'lodash/omit'
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

const Listings = ({ isMobile, creatorConfig, walletType, ...props }) => {
  const [search, setSearch] = useState(getStateFromQuery(props))

  useEffect(() => {
    setSearch(getStateFromQuery(props))
  }, [props.location.search])

  const isCreatedMarketplace = get(creatorConfig, 'isCreatedMarketplace')
  const creatorFilters = get(creatorConfig, 'listingFilters', [])
  const filters = [...getFilters(search), ...creatorFilters]

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
    first: 12,
    search: search.searchInput,
    sort: search.sort,
    order: search.order,
    filters: filters.map(filter => omit(filter, '__typename'))
  }

  if (search.ognListings) {
    // when OGN listings are selected clear other search parameters
    vars.search = ''
    vars.filters = []
    delete vars.sort
    delete vars.order
    vars.listingIds = Object.keys(props.ognListingRewards)
  }

  const showCategory = get(search, 'category.type') ? false : true
  const showCount = vars.search || vars.filters.length > 1 || search.ognListings

  const isCategorySearch =
    !isEmpty(search.category) || !isEmpty(search.subCategory)

  const isSearch =
    get(search, 'searchInput', '') !== '' ||
    isCategorySearch ||
    search.ognListings

  const injectCTAs = !isSearch
  const shouldShowBackButton =
    isSearch && (walletType === 'Mobile' || walletType === 'Origin Wallet')

  const filterComp = (
    <SortMenu
      {...props}
      onChange={e => {
        const selectedOptions = e.target.value.split(':')
        const newSearch = {
          ...search,
          sort: selectedOptions[0],
          order: selectedOptions[1]
        }
        pushSearchHistory(props.history, newSearch)
        setSearch(newSearch)
      }}
      sort={search.sort}
      order={search.order}
    />
  )

  const { error, data, fetchMore, networkStatus, loading } = useQuery(query, {
    variables: {
      ...vars,
      // Fetch two less cards (just for the first request) since we are probably injecting CTAs
      first: injectCTAs ? vars.first - 2 : vars.first
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network'
  })

  if (networkStatus <= 2) {
    return <LoadingSpinner />
  } else if (error) {
    return <QueryError error={error} query={query} vars={vars} />
  } else if (!data || !data.marketplace) {
    return <div className="container">No marketplace contract?</div>
  }

  const { nodes, pageInfo, totalCount } = data.marketplace.listings
  const { hasNextPage, endCursor: after } = pageInfo

  return (
    <>
      <DocumentTitle pageTitle={<fbt desc="listings.title">Listings</fbt>} />
      {!isMobile && (
        <div className="listings-menu-bar">
          <div className="container d-flex align-items-center justify-content-between">
            {filterComp}
            <Header {...{ isSearch, totalCount, showCount, search }} />
          </div>
        </div>
      )}
      <div className="container listings-container">
        {shouldShowBackButton && (
          <div className="listings-back-link">
            <Link
              to="/"
              className="btn btn-link btn-back-link"
              children={fbt('Back', 'Back')}
            />
          </div>
        )}

        {isMobile && (
          <div className={`search-sort-bar${isSearch ? '' : ' inactive'}`}>
            <Header {...{ isSearch, totalCount, showCount, search }} />
            {filterComp}
          </div>
        )}

        {showCount && isCategorySearch ? (
          <CategoryHeader search={search} />
        ) : null}

        {totalCount == 0 ? (
          <NoResults {...{ isSearch, isCreatedMarketplace }} />
        ) : (
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
            <ListingCards
              listings={nodes}
              hasNextPage={hasNextPage}
              showCategory={showCategory}
              tokenDecimals={props.tokenDecimals}
              injectCTAs={injectCTAs}
            />
          </BottomScrollListener>
        )}
        {hasNextPage && (
          <button
            className="btn btn-outline-primary btn-rounded mt-3 more"
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
      </div>
    </>
  )
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
    font-size: 14px
  .search-sort-bar
    display: flex
    align-items: center
    justify-content: space-between
    margin: 1rem 0
    font-size: 14px
    &.inactive
      justify-content: flex-end
  .listings-container
    padding-top: 3rem
  @media (max-width: 767.98px)
    .listings-back-link
      margin-bottom: -1rem
    .listings-container
      padding-top: 0
      .search
        margin-bottom: 1.5rem
        &.active
          margin-bottom: 0
      > .more
        display: block
        margin: 1rem auto 2rem auto
`)
