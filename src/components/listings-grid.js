import React, { Component } from 'react'

import { contractService } from '@originprotocol/origin'

import Pagination from 'react-js-pagination'
import { withRouter } from 'react-router'

import ListingCard from './listing-card'

const alertify = require('../../node_modules/alertify/src/alertify.js')

class ListingsGrid extends Component {

  constructor(props) {
    super(props)

    this.state = {
      contractFound: null,
      listingIds: [],
      listingsPerPage: 12,
    }
  }

  componentWillMount() {
    this.handlePageChange = this.handlePageChange.bind(this)

    // Get listings to hide
    const hideListPromise = new Promise((resolve, reject) => {
      window.web3.version.getNetwork((err, netId) => { resolve(netId) })
    })
    .then((networkId) => {
      return fetch(`https://raw.githubusercontent.com/OriginProtocol/demo-dapp/hide_list/hidelist_${networkId}.json`)
    })
    .then((response) => {
      if (response.status === 404) {
        return [] // Default: Don't hide anything
      } else {
        return response.json()
      }
    })

    // Get all listings from contract
    const allListingsPromise = contractService.getAllListingIds()
    .then(() => {
      this.setState({ contractFound: true })
    })
    .catch((error) => {
      if (error.message.indexOf("(network/artifact mismatch)") > 0) {
        this.setState({ contractFound: false })
      }
    })
    // Wait for both to finish
    Promise.all([hideListPromise, allListingsPromise])
    .then(([hideList, ids]) => {
      // Filter hidden listings
      const showIds = ids ? ids.filter((i)=>hideList.indexOf(i) < 0) : []

      this.setState({ listingIds: showIds.reverse() })
    })
    .catch((error) => {
      console.log(error)
      alertify.alert(error.message)
    })
  }

  handlePageChange(pageNumber) {
    this.props.history.push(`/page/${pageNumber}`)
  }

  render() {
    const { contractFound, listingIds, listingsPerPage } = this.state
    const activePage = this.props.match.params.activePage || 1
    // Calc listings to show for given page
    const showListingsIds = listingIds.slice(
      listingsPerPage * (activePage-1),
      listingsPerPage * (activePage))

    return (
      <div className="listings-wrapper">
        {contractFound === false &&
          <div className="listings-grid">
            <div className="alert alert-warning" role="alert">
              The Origin Contract was not found on this network.<br />
              You may need to change networks, or deploy the contract.
            </div>
          </div>
        }
        {contractFound &&
          <div className="listings-grid">
            {(listingIds.length > 0) &&
              <h1>{listingIds.length} Listings</h1>
            }
            <div className="row">
              {showListingsIds.map(listingId => (
                <ListingCard listingId={listingId} key={listingId}/>
              ))}
            </div>
            <Pagination
              activePage={activePage}
              itemsCountPerPage={listingsPerPage}
              totalItemsCount={listingIds.length}
              pageRangeDisplayed={5}
              onChange={this.handlePageChange}
              itemClass="page-item"
              linkClass="page-link"
              hideDisabled="true"
            />
          </div>
        }
      </div>
    )
  }
}

export default withRouter(ListingsGrid)
