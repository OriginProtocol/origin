import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import get from 'lodash/get'
import queryString from 'query-string'

import BetaBanner from './_BetaBanner'
import BetaModal from './_BetaModal'
import Nav from './_Nav'
import Footer from './_Footer'

import Listings from './listings/Listings'
import Listing from './listing/Listing'
import Transaction from './transaction/Transaction'
import MyPurchases from './transactions/Purchases'
import MySales from './transactions/Sales'
import MyListings from './transactions/Listings'
import User from './user/User'
import Profile from './user/Profile'
import CreateListing from './create-listing/CreateListing'
import Messages from './messaging/Messages'
import Notifications from './notifications/Notifications'
import DappInfo from './about/DappInfo'
import AboutToken from './about/AboutTokens'
import baseConfig from 'constants/config'
import {
  applyConfiguration,
  isWhiteLabelHostname
} from 'utils/marketplaceCreator'

class App extends Component {
  state = {
    hasError: false,
    loading: true,
    config: baseConfig
  }

  async componentDidMount() {
    if (window.ethereum) {
      window.ethereum.enable()
    }

    let configUrl

    const parsed = queryString.parse(this.props.location.search)
    if (parsed.config) {
      // Config URL was passed in the query string
      configUrl = parsed.config
    } else if (isWhiteLabelHostname()) {
      // Hostname is something custom, assume config is at config.<hostname>
      configUrl = `config.${window.location.hostname}`
    }

    if (configUrl) {
      // Retrieve the config
      await fetch(configUrl)
        .then(response => response.json())
        .then(responseJson => this.setState({ config: responseJson.config }))
        .catch(error => {
          console.log('Could not set custom configuration: ' + error)
        })
    }

    applyConfiguration(this.state.config)
  }

  componentDidUpdate() {
    if (get(this.props, 'location.state.scrollToTop')) {
      window.scrollTo(0, 0)
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error">
          <h5>Error!</h5>
          <div>Please refresh the page</div>
        </div>
      )
    }
    return (
      <>
        <BetaBanner />
        <BetaModal />
        <Nav
          logoUrl={this.state.config.logoUrl}
          title={this.state.config.title}
        />
        <main>
          <Switch>
            <Route path="/listings/:listingID" component={Listing} />
            <Route path="/purchases/:offerId" component={Transaction} />
            <Route path="/my-purchases/:filter?" component={MyPurchases} />
            <Route path="/my-sales/:filter?" component={MySales} />
            <Route path="/my-listings/:filter?" component={MyListings} />
            <Route path="/create" component={CreateListing} />
            <Route path="/user/:id" component={User} />
            <Route path="/profile" component={Profile} />
            <Route path="/messages/:room?" component={Messages} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/about/dapp-info" component={DappInfo} />
            <Route path="/about/tokens" component={AboutToken} />
            <Route component={Listings} />
          </Switch>
        </main>
        <Footer locale={this.props.locale} onLocale={this.props.onLocale} />
      </>
    )
  }
}

export default withRouter(App)

require('react-styl')(`
  .app-error
    position: fixed
    top: 50%
    left: 50%
    text-align: center
    transform: translate(-50%, -50%)
`)
