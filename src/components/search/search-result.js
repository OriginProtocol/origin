import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'
import { withRouter } from 'react-router'
import queryString from 'query-string'
import $ from 'jquery'
import 'rc-slider/assets/index.css'

import schemaMessages from '../../schemaMessages/index'
import { showAlert } from 'actions/Alert'
import ListingsGrid from 'components/listings-grid'
import SearchBar from 'components/search/searchbar'
import { generalSearch } from 'actions/Search'
import origin from '../../services/origin'
import MultipleSelectionFilter from 'components/search/multiple-selection-filter'
import PriceFilter from 'components/search/price-filter'
import CounterFilter from 'components/search/counter-filter'
import DateFilterGroup from 'components/search/date-filter'

class SearchResult extends Component {
  constructor(props) {
    super(props)

    this.state = {
      filterSchema: undefined,
      listingSchema: undefined,
      listingType: undefined,
      listingIds: [],
      searchError: undefined,
      filterMap: {}
    }

    this.dateFilters = []

    // set default prop values for search_query and listing_type
    const getParams = queryString.parse(this.props.location.search)
    this.props.generalSearch(getParams.search_query || '', getParams.listing_type || 'all')
  }

  shouldFetchListingSchema() {
    return this.props.listingType !== 'all'
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

  componentDidUpdate(previousProps) {
    // exit if query parameters have not changed
    // TODO: also filter states need to be checked here
    if (
      previousProps.listingType === this.props.listingType &&
      previousProps.query === this.props.query
    )
      return

    this.handleComponentUpdate(previousProps)
  }

  handleComponentUpdate(previousProps) {
    this.searchRequest(this.props.query, this.props.listingType)

    if (previousProps == undefined || this.props.listingType !== previousProps.listingType) {
      this.setState({
        listingType: this.props.listingType,
        filterSchema: undefined,
        listingSchema: undefined
      })

      const filterSchemaPath = `schemas/searchFilters/${this.props.listingType}-search.json`

      fetch(filterSchemaPath)
        .then((response) => response.json())
        .then((schemaJson) => {
          this.validateFilterSchema(schemaJson)
          // if schemas are fetched twice very close together, set schema only
          // when it matches the currently set listingType
          if (this.state.listingType === schemaJson.listingType)
            this.setState({ filterSchema: schemaJson })
        })
        .catch(function(e) {
          console.error(`Error reading schema ${filterSchemaPath}: ${e}`)
          throw e
        })

      if (this.shouldFetchListingSchema()) {
        fetch(`schemas/${this.props.listingType}.json`)
          .then((response) => response.json())
          .then((schemaJson) => {
            this.setState({ listingSchema: schemaJson })
          })
      }
    }
  }

  // Basic schema validation
  validateFilterSchema(filterSchemaJson) {
    filterSchemaJson
      .items
      .map(filterGroup => {
        if (filterGroup.type !== 'filterGroup')
          throw `Only filterGroup objects are allowed inside items array. Malformed object: ${JSON.stringify(filterGroup)}`
        else if (!filterGroup.hasOwnProperty("title") || !filterGroup.title.hasOwnProperty("id") || !filterGroup.title.hasOwnProperty("defaultMessage"))
          throw `Each filterGroup object should have a title object which should consist of "id" and "defaultMessage" properties. Malformed object: ${JSON.stringify(filterGroup)}`
        else if (!filterGroup.hasOwnProperty("items"))
          throw `Each filterGroup object should have an "items" member whose value is an array. Malformed object: ${JSON.stringify(filterGroup)}`

        filterGroup
          .items
          .map(filter => {
            if (!filter.hasOwnProperty("type"))
              throw `Each filter should have a "type" property. Malformed object: ${JSON.stringify(filter)}`
            else if (!filter.hasOwnProperty("searchParameterName"))
              throw `Each filter should have a "searchParameterName" property. Malformed object: ${JSON.stringify(filter)}`
            else if (!/^[a-zA-Z]+$/g.test(filter.searchParameterName))
              throw `"searchParameterName" property should only consist of english letters. Received: ${filter.searchParameterName}`
          })

      })
  }

  formatFiltersToUrl() {

    //document.location.href = `#/search?search_query=${this.state.searchQuery}&listing_type=${this.state.selectedListingType.type}`
  }

  async searchRequest(query, listingType) {
    try {
      this.setState({ searchError: undefined })
      this.formatFiltersToUrl()
      const searchResponse = await origin.marketplace.search(query)

      if (searchResponse.status !== 200)
        throw 'Unexpected result received from search engine'

      const json = await searchResponse.json()
      this.setState({
        listingIds: json.data.Listings.listings.map(listing => listing.id)
      })

    } catch (e) {
      const errorMessage = this.props.intl.formatMessage({
        id: 'searchResult.canNotReachIndexingServer',
        defaultMessage: 'We are experiencing some problems. Please try again later'
      })

      console.error(e)
      this.props.showAlert(errorMessage)
      this.setState({ searchError: errorMessage })
    }

  }

  resolveFromListingSchema(path) {
    var properties = Array.isArray(path) ? path : path.split('.')
    return properties.reduce((prev, curr) => prev && prev[curr], this.state.listingSchema)
  }

  renderFilter(filter, title) {
    if (filter.type == 'multipleSelectionFilter') {
      return(
        <MultipleSelectionFilter
          filter={filter}
          multipleSelectionValues={this.resolveFromListingSchema(filter.listingPropertyName)}
          listingType={this.state.listingType}
          title={title}
        />
      )
    } else if (filter.type == 'price') {
      return (
        <PriceFilter
          filter={filter}
        />
      )
    } else if (filter.type == 'counter') {
      return(
        <CounterFilter
          filter={filter}
        />
      )
    } else if (filter.type == 'date') {
      return(
        <DateFilterGroup
          filter={filter}
          onChildMounted={child => {
            this.dateFilters.push(child)
          }}
          onChildUnMounted={child => {
            const index = this.dateFilters.indexOf(child)
            if (index !== -1)
              this.dateFilters.splice(index, 1)
          }}
        />
      )
    } else {
      throw `Unrecognised filter type "${filter.type}".`
    }
  }

  renderFilterGroup(filterGroup, index) {
    const title = this.props.intl.formatMessage(filterGroup.title)
    const formId = `filter-group-${title}`
    const containsDateFilter = filterGroup.items.some(filter => filter.type == 'date')

    return (
      <li className="nav-item" key={index}>
        <a onClick={() => {
            if (!containsDateFilter)
              return

            this.dateFilters.forEach(dateFilter => dateFilter.onOpen())
          }}
          className="nav-link"
          data-toggle="dropdown"
          data-parent="#search-filters-bar"
        >
          {this.props.intl.formatMessage(filterGroup.title)}
        </a>
        <form className="dropdown-menu" id={formId}>
          <div className="d-flex flex-column">
            <div className="dropdown-form">
            {filterGroup.items.map(filter => this.renderFilter(filter, title))}
            </div>
            <div className="d-flex flex-row button-container">
              <a className="dropdown-button dropdown-button-left align-middle">
                <FormattedMessage
                  id={'SearchResults.searchFiltersClear'}
                  defaultMessage={'Clear'}
                />
              </a>
              <a className="dropdown-button dropdown-button-right align-middle align-self-center">
                <FormattedMessage
                  id={'SearchResults.searchFiltersApply'}
                  defaultMessage={'Apply'}
                />
              </a>
            </div>
          </div>
        </form>
      </li>
    )
  }

  render() {
    return (
      <div>
        <SearchBar />
        <nav id="search-filters-bar" className="navbar search-filters navbar-expand-sm">
          <div className="container d-flex flex-row">
            {
              this.state.filterSchema && this.state.listingType &&
              (this.state.listingSchema || !this.shouldFetchListingSchema()) ?
              <ul className="navbar-nav collapse navbar-collapse">
                {
                  this.state.filterSchema
                    .items
                    .map((filterGroup, index) => {
                      return this.renderFilterGroup(filterGroup, index)
                    })
                }
              </ul>
              : ''}
          </div>
        </nav>
        <div className="container">
          <ListingsGrid
            renderMode="search"
            searchListingIds={this.state.listingIds}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  listingType: state.search.listingType,
  query: state.search.query
})

const mapDispatchToProps = dispatch => ({
  generalSearch: (query, selectedListingType) => dispatch(generalSearch(query, selectedListingType)),
  showAlert: (error) => dispatch(showAlert(error))
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(withRouter(SearchResult)))
