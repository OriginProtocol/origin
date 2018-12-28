import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import TxHistory from './_History'
import TxProgress from './_Progress'
import OfferDetails from './_OfferDetails'
import ListingDetail from './_ListingDetail'

class Transaction extends Component {
  render() {
    return (
      <div className="transaction-detail">
        <Link to="/purchases">&lsaquo; My Purchases</Link>
        <h2>SUPER COOL T-shirts</h2>

        <div className="row">
          <div className="col-md-8">
            <h3>Transaction Progress</h3>
            <TxProgress />

            <h3>Transaction History</h3>
            <TxHistory />

            <h3>Listing Details</h3>
            <ListingDetail />
          </div>
          <div className="col-md-4">
            <h4 className="side-bar">Offer Details</h4>
            <OfferDetails />

            <h4 className="side-bar">About the Seller</h4>
            <div className="seller-details" />
          </div>
        </div>
      </div>
    )
  }
}

export default Transaction

require('react-styl')(`
  .transaction-detail
    padding-top: 2.5rem
    > a
      color: var(--dusk)
      text-transform: uppercase
      font-size: 14px
      font-weight: normal
    > h2
      font-family: Poppins
      font-size: 40px
      font-weight: 200
      color: var(--dark)
      line-height: 3rem
    h3
      font-family: Poppins
      font-weight: 300
      font-size: 24px
    h4.side-bar
      font-family: Poppins
      font-weight: 300
      font-size: 18px

`)
