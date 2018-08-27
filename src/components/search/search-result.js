import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { withRouter } from 'react-router'
import queryString from 'query-string'

import schemaMessages from '../../schemaMessages/index'
import { showAlert } from 'actions/Alert'
import ListingsGrid from 'components/listings-grid'
import SearchBar from 'components/search/searchbar'
import { generalSearch } from 'actions/Search'
import origin from '../../services/origin'

class SearchResult extends Component {
  constructor(props) {
    super(props)

    const getParams = queryString.parse(this.props.location.search)

    this.state = {
      filterSchema: undefined,
      listingSchema: undefined,
      listingIds: []
    }

    // set default prop values for search_query and listing_type
    this.props.generalSearch(getParams.search_query || '', getParams.listing_type || 'all')
  }

  componentDidUpdate(previousProps) {
    // exit if query parameters have not changed
    // TODO: also filter states need to be checked here
    if (
      previousProps.listingType === this.props.listingType &&
      previousProps.query === this.props.query
    )
      return

    this.setState({
      filterSchema: undefined
    })

    this.searchRequest(this.props.query, this.props.listingType)

    if (this.props.listingType !== previousProps.listingType || this.state.filterSchema == undefined) {
      fetch(`schemas/searchFilters/${this.props.listingType}-search.json`)
        .then((response) => response.json())
        .then((schemaJson) => {
          this.setState({ filterSchema: schemaJson })
        })
      fetch(`schemas/${this.props.listingType}.json`)
        .then((response) => response.json())
        .then((schemaJson) => {
          this.setState({ listingSchema: schemaJson })
        })
    }
  }

  async searchRequest(query, listingType) {
    try {
      const searchResponse = await origin.marketplace.search(query)
      if (searchResponse.status !== 200)
        throw 'Unexpected result received from search engine'

      const json = await searchResponse.json()
      this.setState({
        listingIds: json.data.Listings.listings.map(listing => listing.id)
      })

    } catch (e) {
      this.props.showAlert(
        this.props.intl.formatMessage({
          id: 'searchResult.canNotReachIndexingServer',
          defaultMessage: 'Can not reach search engine server'
        })
      )
    }

  }

  resolveFromListingSchema(path) {
    var properties = Array.isArray(path) ? path : path.split('.')
    return properties.reduce((prev, curr) => prev && prev[curr], this.state.listingSchema)
  }

  renderMultipleSelectionFilter(multipleSelectionValues) {
    return multipleSelectionValues.map(multipleSelectionValue =>
      <div className="form-check">
        <input type="checkbox" className="form-check-input" id="dropdownCheck2"/>
        <label className="form-check-label" htmlFor="dropdownCheck2">
          {
            this.props.intl.formatMessage(schemaMessages[_.camelCase(this.props.listingType)][multipleSelectionValue])
          }
        </label>
      </div>
    )    
  }

  renderPriceFilter() {
    return (
      <div className="form-check">
        <input type="checkbox" className="form-check-input" id="dropdownCheck2"/>
        <label className="form-check-label" htmlFor="dropdownCheck2">
          Remember me
        </label>
      </div>
    )
  }

  renderFilter(filter) {
    if (filter.type == 'multipleSelectionFilter') {
      return this.renderMultipleSelectionFilter(this.resolveFromListingSchema(filter.listingPropertyName))
    } else if (filter.type == 'price') {
      return this.renderPriceFilter()
    } else {
      throw `Unrecognised filter type "${filter.type}".`
    }
  }

  renderFilterGroup(filterGroup) {
    return (
      <li className="nav-item" key={this.props.intl.formatMessage(filterGroup.title)}>
        <a className="nav-link" data-toggle="dropdown" data-parent="#searchbar">
          {this.props.intl.formatMessage(filterGroup.title)}
        </a>
        <form className="dropdown-menu">
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
        <nav id="searchbar" className="navbar search-filters navbar-expand-sm">
          <div className="container d-flex flex-row">
            { this.state.filterSchema && this.state.listingSchema ?
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
