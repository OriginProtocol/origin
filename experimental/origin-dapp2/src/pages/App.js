import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import get from 'lodash/get'

import Nav from './_Nav'
import Footer from './_Footer'

import Listings from './listings/Listings'
import Listing from './listings/Listing'
import Transaction from './transactions/Transaction'

class App extends Component {
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
            <Route path="/transaction" component={Transaction} />
            <Route component={Listings} />
          </Switch>
        </main>
        <Footer />
      </>
    )
  }
}

export default App
