import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { withRouter } from 'react-router'
import { searchListings } from 'actions/Listing'
import queryString from 'query-string'

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
      listingIds:[]
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
          window.scrollTo(0, 0)
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

  render() {
    return (
      <div>
        <SearchBar />
        <nav className="navbar search-filters navbar-expand-sm">
         <div className="container d-flex flex-row">
            { this.state.filterSchema ?
              <ul className="navbar-nav collapse navbar-collapse">
                {
                  this.state.filterSchema
                    .items
                    .map(filterGroup =>
                      <li className="nav-item" key={this.props.intl.formatMessage(filterGroup.title)}>
                        <a className="nav-link" href="#">
                          {this.props.intl.formatMessage(filterGroup.title)}
                        </a>
                      </li>
                    )
                }
              </ul>
            : ''}
          </div>
        </nav>
        <div className="container">
          <ListingsGrid
            renderMode='search'
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
