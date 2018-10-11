import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router'
import queryString from 'query-string'
import deepEqual from 'deep-equal'
import $ from 'jquery'
import 'rc-slider/assets/index.css'

import { showAlert } from 'actions/Alert'
import ListingsGrid from 'components/listings-grid'
import SearchBar from 'components/search/searchbar'
import { generalSearch } from 'actions/Search'
import origin from '../../services/origin'
import FilterGroup from 'components/search/filter-group'
import { getFiatPrice } from 'utils/priceUtils'
import {
  VALUE_TYPE_STRING,
  FILTER_OPERATOR_EQUALS
} from 'components/search/constants'
import { LISTINGS_PER_PAGE } from 'components/constants'
import listingSchemaMetadata from 'utils/listingSchemaMetadata.js'

class SearchResult extends Component {
  constructor(props) {
    super(props)

    this.state = {
      filterSchema: undefined,
      listingSchema: undefined,
      listingType: undefined,
      listingIds: [],
      totalNumberOfListings: 0,
      searchError: undefined,
      filters: {},
      maxPrice: 10000,
      minPrice: 0,
      page: 1
    }

    // set default prop values for search_query and listing_type
    const getParams = queryString.parse(this.props.location.search)

    this.props.generalSearch(
      getParams.search_query || '',
      this.getListingTypeObject(getParams.listing_type),
      false,
      false
    )

    this.handleChangePage = this.handleChangePage.bind(this)
  }

  getListingTypeObject(typeString) {
    return (
      [
        ...listingSchemaMetadata.listingTypes,
        listingSchemaMetadata.listingTypeAll
      ].filter(listingType => listingType.type === typeString)[0] ||
      listingSchemaMetadata.listingTypeAll
    )
  }

  handleChangePage(page) {
    this.setState({ page: page })
  }

  shouldFetchListingSchema() {
    return this.props.listingType.type !== 'all'
  }

  componentDidMount() {
    /* this force update is required after component initializes. In cases where user returns to the 
     * search-result page. Then no props change from previous to current and for that reason search and
     * schema loading do not get triggered.
     */
    this.handleComponentUpdate(undefined)

    // Keep dropdown opened when user clicks on any element in the dropdownw
    $(document).on('click', '#search-filters-bar .dropdown-menu', e => {
      e.stopPropagation()
    })
  }

  componentDidUpdate(previousProps, prevState) {
    // exit if query parameters have not changed
    // TODO: also filter states need to be checked here
    if (
      previousProps.listingType.type === this.props.listingType.type &&
      previousProps.query === this.props.query &&
      deepEqual(previousProps.filters, this.props.filters) &&
      /* when user clicks on search, the generalSearchId increments by 1
       * this way a new search request is triggered to the backend even
       * if query parameters do not change
       */
      previousProps.generalSearchId === this.props.generalSearchId &&
      prevState.page === this.state.page
    )
      return

    this.handleComponentUpdate(
      previousProps,
      prevState.page !== this.state.page
    )
  }

  handleComponentUpdate(previousProps, onlyPageChanged = false) {
    this.searchRequest(onlyPageChanged)

    if (
      previousProps === undefined ||
      this.props.listingType.type !== previousProps.listingType.type
    ) {
      this.setState({
        listingType: this.props.listingType,
        filterSchema: undefined,
        listingSchema: undefined
      })

      const filterSchemaPath = `schemas/searchFilters/${
        this.props.listingType.type
      }-search.json`

      fetch(filterSchemaPath)
        .then(response => response.json())
        .then(schemaJson => {
          this.validateFilterSchema(schemaJson)
          // if schemas are fetched twice very close together, set schema only
          // when it matches the currently set listingType
          if (this.state.listingType.type === schemaJson.listingType)
            this.setState({ filterSchema: schemaJson })
        })
        .catch(function(e) {
          console.error(`Error reading schema ${filterSchemaPath}: ${e}`)
          throw e
        })

      if (this.shouldFetchListingSchema()) {
        fetch(`schemas/${this.props.listingType.type}.json`)
          .then(response => response.json())
          .then(schemaJson => {
            this.setState({ listingSchema: schemaJson })
          })
      }
    }
  }

  // Basic schema validation
  validateFilterSchema(filterSchemaJson) {
    filterSchemaJson.items.map(filterGroup => {
      if (filterGroup.type !== 'filterGroup')
        throw `Only filterGroup objects are allowed inside items array. Malformed object: ${JSON.stringify(
          filterGroup
        )}`
      else if (
        !filterGroup.hasOwnProperty('title') ||
        !filterGroup.title.hasOwnProperty('id') ||
        !filterGroup.title.hasOwnProperty('defaultMessage')
      )
        throw `Each filterGroup object should have a title object which should consist of 'id' and 'defaultMessage' properties. Malformed object: ${JSON.stringify(
          filterGroup
        )}`
      else if (!filterGroup.hasOwnProperty('items'))
        throw `Each filterGroup object should have an 'items' member whose value is an array. Malformed object: ${JSON.stringify(
          filterGroup
        )}`

      filterGroup.items.map(filter => {
        if (!filter.hasOwnProperty('type'))
          throw `Each filter should have a 'type' property. Malformed object: ${JSON.stringify(
            filter
          )}`
        else if (!filter.hasOwnProperty('searchParameterName'))
          throw `Each filter should have a 'searchParameterName' property. Malformed object: ${JSON.stringify(
            filter
          )}`
        else if (!/^[a-zA-Z.]+$/g.test(filter.searchParameterName))
          throw `'searchParameterName' property should only consist of english letters. Received: ${
            filter.searchParameterName
          }`
      })
    })
  }

  formatFiltersToUrl() {
    //TODO: implement this
    //document.location.href = `#/search?search_query=${this.state.searchQuery}&listing_type=${this.state.selectedListingType.type}`
  }

  async searchRequest(onlyPageChanged) {
    try {
      this.setState({ searchError: undefined })
      this.formatFiltersToUrl()

      const filters = this.props.filters

      // when querying all listings no filter should be added
      if (this.props.listingType.type !== 'all') {
        filters.category = {
          name: 'category',
          value: this.props.listingType.translationName.id,
          valueType: VALUE_TYPE_STRING,
          operator: FILTER_OPERATOR_EQUALS
        }
      }

      const searchResp = await origin.discovery.search(
        this.props.query || '',
        LISTINGS_PER_PAGE,
        (this.state.page - 1) * LISTINGS_PER_PAGE,
        Object.values(filters).flatMap(arrayOfFilters => arrayOfFilters)
      )

      this.setState({
        listingIds: searchResp.data.listings.nodes.map(listing => listing.id),
        totalNumberOfListings: searchResp.data.listings.totalNumberOfItems,
        // reset the page whenever a user doesn't click on pagination link
        page: onlyPageChanged ? this.state.page : 1
      })

      const maxPrice = getFiatPrice(
        searchResp.data.listings.stats.maxPrice,
        'USD',
        'ETH',
        false
      )
      
      const minPrice = getFiatPrice(searchResp.data.listings.stats.minPrice,
        'USD',
        'ETH',
        false
      )

      /* increase the max/min price range by 5% to prevent a case where conversion rates of a market would be such
       * that the item that would cost the most would be left out of the price filter range
       */
      this.setState({
        maxPrice: maxPrice * 1.05,
        minPrice: minPrice * 0.95
      })
    } catch (e) {
      const errorMessage = this.props.intl.formatMessage({
        id: 'searchResult.canNotReachIndexingServer',
        defaultMessage:
          'We are experiencing some problems. Please try again later'
      })

      console.error(e)
      this.props.showAlert(errorMessage)
      this.setState({ searchError: errorMessage })
    }
  }

  render() {
    return (
      <Fragment>
        <SearchBar />
        <nav
          id="search-filters-bar"
          className="navbar search-filters navbar-expand-sm"
        >
          <div className="container d-flex flex-row">
            {this.state.filterSchema &&
            this.state.listingType &&
            this.state.filterSchema.items.length > 0 &&
            (this.state.listingSchema || !this.shouldFetchListingSchema()) ? (
                <ul className="navbar-nav collapse navbar-collapse">
                  {this.state.filterSchema.items.map((filterGroup, index) => {
                    return (
                      <FilterGroup
                        filterGroup={filterGroup}
                        key={index}
                        listingSchema={this.state.listingSchema}
                        listingType={this.state.listingType}
                        maxPrice={this.state.maxPrice}
                        minPrice={this.state.minPrice}
                      />
                    )
                  })}
                </ul>
              ) : (
                ''
              )}
          </div>
        </nav>
        <div className="container">
          <ListingsGrid
            renderMode="search"
            search={{
              listingIds: this.state.listingIds,
              listingsLength: this.state.totalNumberOfListings
            }}
            handleChangePage={this.handleChangePage}
            searchPage={this.state.page}
          />
        </div>
      </Fragment>
    )
  }
}

const mapStateToProps = state => ({
  listingType: state.search.listingType,
  query: state.search.query,
  filters: state.search.filters,
  generalSearchId: state.search.generalSearchId
})

const mapDispatchToProps = dispatch => ({
  generalSearch: (
    query,
    selectedListingType,
    resetSearchFilters,
    forceIssueOfGeneralSearch
  ) =>
    dispatch(
      generalSearch(
        query,
        selectedListingType,
        resetSearchFilters,
        forceIssueOfGeneralSearch
      )
    ),
  showAlert: error => dispatch(showAlert(error))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(withRouter(SearchResult)))
