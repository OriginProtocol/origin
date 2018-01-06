import React, { Component } from 'react'
import contractService from '../services/contract-service'
import Pagination from 'react-js-pagination'

import ListingCard from './listing-card'

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

    const hideListPromise = fetch('https://raw.githubusercontent.com/OriginProtocol/demo-dapp/master/public/schemas/announcements.json')
      .then((response) => response.json())
    const allListingsPromise = contractService.getAllListingIds()
    .catch((error) => {
      if (error.message.indexOf("(network/artifact mismatch)") > 0) {
        alert("The Origin Contract was not found on this network.\nYou may need to change networks, or deploy the contract.")
      }
    })

    Promise.all([hideListPromise, allListingsPromise])
    .then((hideList, ids) => {
      console.log("all!")
      console.log(hideList, ids);
      // const showIds = ids.filter((i)=>hideList[4].indexOf(i) < 0)
      // this.setState({ listingIds: showIds })
      // console.log(`Listing Ids:`)
      // console.log(this.state.listingIds)
    })
    .catch((error) => {
      alert(error.message)
    })


    // .then((ids) => {
    //   const showIds = ids.filter((i)=>hideList[4].indexOf(i) < 0)
    //   this.setState({ listingIds: showIds })
    //   console.log(`Listing Ids:`)
    //   console.log(this.state.listingIds)
    //   return ids
    // })


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
