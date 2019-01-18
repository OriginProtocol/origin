import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl'
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

    let listingType = listingSchemaMetadata.listingTypeAll
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
      },
      searchInCategory: {
        id: 'searchbar.searchInCategory',
        defaultMessage: 'Search in {category}'
      },
    })

    this.handleChange = this.handleChange.bind(this)
    this.handleOnSearch = this.handleOnSearch.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.onBackFromSearchResults = this.onBackFromSearchResults.bind(this)
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

  componentDidUpdate(previousProps) {
    // category change on mobile device happened
    if (
      this.props.mobileDevice &&
      previousProps.listingType !== this.props.listingType
    ) {
      this.setState({
        searchQuery: '',
        selectedListingType: this.props.listingType || this.allListingType
      })
    }
  }

  onBackFromSearchResults() {
    document.location.href = `#/`
  }

  render() {
    const {
      intl,
      mobileDevice,
      listingType,
      searchedQuery
    } = this.props

    let searchPlaceholder = intl.formatMessage(this.intlMessages.searchPlaceholder)
    if (mobileDevice && listingType !== null) {
      if (listingType.type !== 'all') {
        const translatedCategory = intl
          .formatMessage(listingType.translationName)
          .toLowerCase()
        searchPlaceholder = intl
          .formatMessage(
            this.intlMessages.searchInCategory,
            { category: translatedCategory }
          )
      }
    }

    return (
      <Fragment>
        <nav className="navbar searchbar navbar-expand-sm">
          <div className="container d-flex flex-row">
            <div className="input-group mr-auto" id="search">
              { !mobileDevice && <div className="input-group-prepend">
                <button
                  className="btn btn-outline-secondary dropdown-toggle search-bar-prepend"
                  type="button"
                  onClick={() => this.setState({ dropdown: true })}
                  aria-haspopup="true"
                  aria-expanded="false"
                  ga-category="search"
                  ga-label="category_dropdown"
                >
                  {this.state.selectedListingType.name}
                </button>
                <div
                  className={`dropdown-menu${this.state.dropdown ? ' show' : ''}`}
                >
                  {this.listingTypes.map(listingType => (
                    <a
                      className="dropdown-item"
                      key={listingType.type}
                      onClick={() =>
                        this.setState({
                          selectedListingType: listingType,
                          dropdown: false
                        })
                      }
                      ga-category="top_nav"
                      ga-label={`dropdown_item_${listingType}`}
                    >
                      {listingType.name}
                    </a>
                  ))}
                </div>
              </div>}
              <input
                type="text"
                className="form-control search-input"
                placeholder={searchPlaceholder}
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
        {mobileDevice && searchedQuery !== undefined && <div className="container d-flex justify-content-start navigate-back">
          <a
            className="d-flex"
            onClick={this.onBackFromSearchResults}
          >
            <img className="caret" src="images/caret-grey.svg"/>
            <div className="pl-2">
              {listingType.type !== 'all' && <FormattedMessage
                id={ 'searchbar.allCategories' }
                defaultMessage={ 'All Categories' }
              />}
              {listingType.type === 'all' && <FormattedMessage
                id={ 'searchbar.back' }
                defaultMessage={ 'Back' }
              />}
            </div>
          </a>
        </div>}
      </Fragment>
    )
  }
}

const mapStateToProps = ({ app, search }) => {
  return {
    mobileDevice: app.mobileDevice,
    listingType: search.listingType,
    searchedQuery: search.query
  }
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
