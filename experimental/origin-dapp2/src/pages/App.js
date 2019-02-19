import React, { Component } from 'react'
import { Query } from 'react-apollo'
import { Switch, Route, withRouter } from 'react-router-dom'
import get from 'lodash/get'
import queryString from 'query-string'

import BetaBanner from './_BetaBanner'
import BetaModal from './_BetaModal'
import TranslationModal from './_TranslationModal'
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
import {
  applyConfiguration,
  isWhiteLabelHostname
} from 'utils/marketplaceCreator'
import CreatorConfigQuery from 'queries/CreatorConfig'

class App extends Component {
  state = { hasError: false }

  async componentDidMount() {
    if (window.ethereum) {
      window.ethereum.enable()
    }
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
    let creatorConfigUrl
    const parsed = queryString.parse(this.props.location.search)
    if (parsed.config) {
      // Config URL was passed in the query string
      creatorConfigUrl = parsed.config
    } else if (isWhiteLabelHostname()) {
      // Hostname is something custom, assume config is at config.<hostname>
      creatorConfigUrl = `config.${window.location.hostname}`
    }

    if (this.state.hasError) {
      return (
        <div className="app-error">
          <h5>Error!</h5>
          <div>Please refresh the page</div>
        </div>
      )
    }
    return (
      <Query
        query={CreatorConfigQuery}
        variables={{ creatorConfigUrl: creatorConfigUrl }}
      >
        {({ data, networkStatus }) => {
          if (networkStatus === 1) {
            return (
              <div className="app-loading">
                <h5>Loading</h5>
                <div>Please wait</div>
              </div>
            )
          }
          const creatorConfig = get(data, 'creatorConfig', {})
          applyConfiguration(creatorConfig)
          return (
            <>
              <BetaBanner />
              <BetaModal />
              <Nav creatorConfig={creatorConfig} />
              <main>
                <Switch>
                  <Route path="/listings/:listingID" component={Listing} />
                  <Route path="/purchases/:offerId" component={Transaction} />
                  <Route
                    path="/my-purchases/:filter?"
                    component={MyPurchases}
                  />
                  <Route path="/my-sales/:filter?" component={MySales} />
                  <Route path="/my-listings/:filter?" component={MyListings} />
                  <Route
                    path="/create"
                    render={props => (
                      <CreateListing
                        {...props}
                        marketplacePublisher={
                          creatorConfig.marketplacePublisher
                        }
                      />
                    )}
                  />
                  <Route path="/user/:id" component={User} />
                  <Route path="/profile" component={Profile} />
                  <Route path="/messages/:room?" component={Messages} />
                  <Route path="/notifications" component={Notifications} />
                  <Route path="/about/dapp-info" component={DappInfo} />
                  <Route path="/about/tokens" component={AboutToken} />
                  <Route
                    render={props => (
                      <Listings
                        {...props}
                        isCreatedMarketplace={
                          creatorConfig.isCreatedMarketplace
                        }
                        filters={creatorConfig.listingFilters}
                      />
                    )}
                  />
                </Switch>
              </main>
              <TranslationModal locale={this.props.locale} />
              <Footer
                locale={this.props.locale}
                onLocale={this.props.onLocale}
                creatorConfig={creatorConfig}
              />
            </>
          )
        }}
      </Query>
    )
  }
}

export default withRouter(App)

require('react-styl')(`
  .app-error, .app-loading
    position: fixed
    top: 50%
    left: 50%
    text-align: center
    transform: translate(-50%, -50%)
`)
