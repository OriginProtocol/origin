import React, { Component } from 'react'
import contractService from '../services/contract-service'
import Pagination from 'react-js-pagination'

import ListingCard from './listing-card'

import hideList from './hide-list'

class ListingsGrid extends Component {

  constructor(props) {
    super(props)
    this.state = {
      listingIds: [],
      listingsPerPage: 10,
      activePage: 1
    }

    this.handlePageChange = this.handlePageChange.bind(this)
  }

  componentWillMount() {
    contractService.getAllListingIds()
    .then((ids) => {
      const showIds = ids.filter((i)=>hideList.indexOf(i) < 0)
      this.setState({ listingIds: showIds })
      console.log(`Listing Ids:`)
      console.log(this.state.listingIds)
    })
    .catch((error) => {
      console.error(`Error fetching listing ids`)
    })

  }

  handlePageChange(pageNumber) {
    console.log(`active page is ${pageNumber}`)
    this.setState({activePage: pageNumber})
  }

  render() {
    // Calc listings to show for given page
    const showListingsIds = this.state.listingIds.reverse().slice(
      this.state.listingsPerPage * (this.state.activePage-1),
      this.state.listingsPerPage * (this.state.activePage))
    return (
      <div className="listings-grid">
        <h1>{this.state.listingIds.length} Listings</h1>
        <div className="row">
          {showListingsIds.map(listingId => (
            <ListingCard listingId={listingId} key={listingId}/>
          ))}
        </div>
        <Pagination
          activePage={this.state.activePage}
          itemsCountPerPage={this.state.listingsPerPage}
          totalItemsCount={this.state.listingIds.length}
          pageRangeDisplayed={5}
          onChange={this.handlePageChange}
          itemClass="page-item"
          linkClass="page-link"
          hideDisabled="true"
        />
      </div>
    )
  }
}

export default ListingsGrid
