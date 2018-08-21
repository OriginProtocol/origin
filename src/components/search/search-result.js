import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { searchListings } from 'actions/Listing'
import queryString from 'query-string'

import ListingsGrid from 'components/listings-grid'
import SearchBar from 'components/search/searchbar'

class SearchResult extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filterSchema: undefined
    }

    this.parseUrlParamsToState()
  }

  parseUrlParamsToState() {
    const params = queryString.parse(this.props.location.search)
    console.log(params, this.props.location.search)
  }

  componentDidUpdate(prevProps) {
    console.log("COMPONENT DID UPDATE")
    // exit if query parameters have not changed
    if (
      prevProps.listingType == this.props.listingType &&
      prevProps.query == this.props.query
    )
      return

    this.setState({ filterSchema: undefined })

    fetch(`schemas/searchFilters/${this.props.listingType}-search.json`)
      .then((response) => response.json())
      .then((schemaJson) => {
        this.setState({ filterSchema: schemaJson })
        window.scrollTo(0, 0)
      })
  }

  render() {
    if (this.state.filterSchema != undefined){
      this.state.filterSchema
        .items
        .map(filterGroup =>
          console.log(filterGroup.title)
        )
    }

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
          <ListingsGrid renderMode='search' />
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
  searchListings: (query) => dispatch(searchListings(query))
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(SearchResult))
