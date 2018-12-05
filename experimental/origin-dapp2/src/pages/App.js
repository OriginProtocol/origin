import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'

import Nav from './_Nav'
import Footer from './_Footer'

import Listings from './listings/Listings'
import Listing from './listings/Listing'

class App extends Component {
  componentDidUpdate() {
    const { state } = this.props.location
    if (state && state.scrollToTop) {
      window.scrollTo(0, 0)
    }
  }
  render() {
    return (
      <>
        <main>
          <Nav />
          <div className="container">
            <Switch>
              <Route path="/listings/:listingID" component={Listing} />
              <Route component={Listings} />
            </Switch>
          </div>
        </main>
        <Footer />
      </>
    )
  }
}

export default App
