import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router'
import queryString from 'query-string'
import Slider, { Range } from 'rc-slider'
import $ from 'jquery'
import 'rc-slider/assets/index.css'

import schemaMessages from '../../schemaMessages/index'
import { showAlert } from 'actions/Alert'
import ListingsGrid from 'components/listings-grid'
import SearchBar from 'components/search/searchbar'
import { generalSearch } from 'actions/Search'
import origin from '../../services/origin'

class SearchResult extends Component {
  constructor(props) {
    super(props)

    this.state = {
      filterSchema: undefined,
      listingSchema: undefined,
      listingType: undefined,
      listingIds: [],
      searchError: undefined
    }

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

    $(document).on('click', '#search-filters-bar .dropdown-menu', e => {
      // Keep dropdown opened when user clicks on any element in the dropdownw
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

    if (previousProps == undefined || this.props.listingType !== previousProps.listingType) {
      this.searchRequest(this.props.query, this.props.listingType)

      this.setState({
        listingType: this.props.listingType,
        filterSchema: undefined,
        listingSchema: undefined
      })

      fetch(`schemas/searchFilters/${this.props.listingType}-search.json`)
        .then((response) => response.json())
        .then((schemaJson) => {
          this.setState({ filterSchema: schemaJson })
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

  async searchRequest(query, listingType) {
    try {
      this.setState({ searchError: undefined })
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

      this.props.showAlert(errorMessage)
      this.setState({ searchError: errorMessage })
    }

  }

  resolveFromListingSchema(path) {
    var properties = Array.isArray(path) ? path : path.split('.')
    return properties.reduce((prev, curr) => prev && prev[curr], this.state.listingSchema)
  }

  renderMultipleSelectionFilter(multipleSelectionValues) {
    return multipleSelectionValues.map(multipleSelectionValue =>
      <div className="form-check" key={multipleSelectionValue}>
        <input type="checkbox" className="form-check-input" id={multipleSelectionValue}/>
        <label className="form-check-label" htmlFor={multipleSelectionValue}>
          {
            this.props.intl.formatMessage(schemaMessages[_.camelCase(this.state.listingType)][multipleSelectionValue])
          }
        </label>
      </div>
    )    
  }

  renderPriceFilter(filter) {
    const min = 0
    const max = 500
    return (
      <div className="form-check" key={filter.listingPropertyName}>
        <Range 
          min={min}
          max={max}
          defaultValue={[min, max]}
          count={2}
          pushable={(max-min)/20}
          tipFormatter={value => `${value}$`}
        />
      </div>
    )
  }

  renderFilter(filter) {
    if (filter.type == 'multipleSelectionFilter') {
      return this.renderMultipleSelectionFilter(this.resolveFromListingSchema(filter.listingPropertyName))
    } else if (filter.type == 'price') {
      return this.renderPriceFilter(filter)
    } else {
      throw `Unrecognised filter type "${filter.type}".`
    }
  }

  renderFilterGroup(filterGroup) {
    const title = this.props.intl.formatMessage(filterGroup.title)
    const formId = `filter-group-${title}`
    return (
      <li className="nav-item" key={title}>
        <a className="nav-link" data-toggle="dropdown" data-parent="#search-filters-bar">
          {this.props.intl.formatMessage(filterGroup.title)}
        </a>
        <form className="dropdown-menu" id={formId}>
          <div className="d-flex flex-column">
            <div className="dropdown-form">
            {filterGroup.items.map(filter => this.renderFilter(filter))}
            </div>
            <div className="d-flex flex-row button-container">
              <a className="dropdown-button dropdown-button-left align-middle align-self-center">Submit</a>
              <a className="dropdown-button dropdown-button-right align-middle">Clear</a>
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
                    .map(filterGroup => {

                      return this.renderFilterGroup(filterGroup)  
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
