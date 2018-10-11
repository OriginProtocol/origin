import React, { Component } from 'react'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'
import { withRouter } from 'react-router'
import queryString from 'query-string'

import listingSchemaMetadata from 'utils/listingSchemaMetadata.js'
import { generalSearch } from 'actions/Search'

class SearchBar extends Component {
  constructor(props) {
    super(props)

    this.listingTypes = [
      listingSchemaMetadata.listingTypeAll,
      ...listingSchemaMetadata.listingTypes
    ].map(listingType => {
      listingType.name = props.intl.formatMessage(listingType.translationName)
      return listingType
    })

    const getParams = queryString.parse(this.props.location.search)

    let listingType = this.listingTypes[0]
    if (getParams.listing_type !== undefined) {
      listingType =
        this.listingTypes.find(
          listingTypeItem => listingTypeItem.type === getParams.listing_type
        ) || listingType
    }

    this.state = {
      selectedListingType: listingType,
      searchQuery: getParams.search_query || ''
    }

    this.intlMessages = defineMessages({
      searchPlaceholder: {
        id: 'searchbar.search',
        defaultMessage: 'Search'
      }
    })

    this.handleChange = this.handleChange.bind(this)
    this.handleOnSearch = this.handleOnSearch.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleOnSearch(e)
    }
  }

  handleChange(e) {
    this.setState({ searchQuery: e.target.value })
  }

  handleOnSearch() {
    document.location.href = `#/search?search_query=${
      this.state.searchQuery
    }&listing_type=${this.state.selectedListingType.type}`
    this.props.generalSearch(
      this.state.searchQuery,
      this.state.selectedListingType,
      true,
      true
    )
  }

  render() {
    return (
      <nav className="navbar searchbar navbar-expand-sm">
        <div className="container d-flex flex-row">
          <div className="input-group mr-auto" id="search">
            <div className="input-group-prepend">
              <button
                className="btn btn-outline-secondary dropdown-toggle search-bar-prepend"
                type="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                ga-category="search"
                ga-label="category_dropdown"
              >
                {this.state.selectedListingType.name}
              </button>
              <div className="dropdown-menu">
                {this.listingTypes.map(listingType => (
                  <a
                    className="dropdown-item"
                    key={listingType.type}
                    onClick={() =>
                      this.setState({ selectedListingType: listingType })
                    }
                    ga-category="top_nav"
                    ga-label={ `dropdown_item_${listingType}` }
                  >
                    {listingType.name}
                  </a>
                ))}
              </div>
            </div>
            <input
              type="text"
              className="form-control search-input"
              placeholder={this.props.intl.formatMessage(
                this.intlMessages.searchPlaceholder
              )}
              aria-label="Search"
              onChange={this.handleChange}
              onKeyPress={this.handleKeyPress}
              value={this.state.searchQuery}
            />
            <div className="input-group-append">
              <button
                className="search-bar-append"
                type="button"
                onClick={this.handleOnSearch}
                ga-category="top_nav"
                ga-label="search_submit"
              >
                <img
                  src="images/searchbar/magnifying-glass.svg"
                  alt="Search Listings"
                />
              </button>
            </div>
          </div>

          {/*
          <ul className="navbar-nav collapse navbar-collapse">
            <li className="nav-item active">
              <a className="nav-link" href="#">
                <FormattedMessage
                  id={ 'searchbar.forsale' }
                  defaultMessage={ 'For Sale' }
                />
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <FormattedMessage
                  id={ 'searchbar.newListings' }
                  defaultMessage={ 'New Listings' }
                />
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <FormattedMessage
                  id={ 'searchbar.dealsNearMe' }
                  defaultMessage={ 'Deals Near Me' }
                />
              </a>
            </li>
          </ul>*/}
        </div>
      </nav>
    )
  }
}

const mapStateToProps = () => {
  return {}
}

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
    )
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(withRouter(SearchBar)))
