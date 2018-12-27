import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import get from 'lodash/get'

import Nav from './_Nav'
import Footer from './_Footer'

import Listings from './listings/Listings'
import Listing from './listings/Listing'
import Purchase from './transactions/Purchase'
import MyPurchases from './transactions/Purchases'
import MySales from './transactions/Sales'
import MyListings from './transactions/Listings'

class App extends Component {
  componentDidMount() {
    if (window.ethereum) {
      window.ethereum.enable()
    }
  }

  componentDidUpdate() {
    if (get(this.props, 'location.state.scrollToTop')) {
      window.scrollTo(0, 0)
    }
  }

  render() {
    return (
      <>
        <main>
          <Nav />
          <Switch>
            <Route path="/listings/:listingID" component={Listing} />
            <Route path="/purchases/:offerId" component={Purchase} />
            <Route path="/my-purchases" component={MyPurchases} />
            <Route path="/my-sales" component={MySales} />
            <Route path="/my-listings" component={MyListings} />
            <Route component={Listings} />
          </Switch>
        </main>
        <Footer />
      </>
    )
  }
}

export default App
