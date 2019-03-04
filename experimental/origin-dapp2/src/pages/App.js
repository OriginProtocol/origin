import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import get from 'lodash/get'

import withCreatorConfig from 'hoc/withCreatorConfig'

import BetaBanner from './_BetaBanner'
import TranslationModal from './_TranslationModal'
import Nav from './_Nav'
import Footer from './_Footer'

import Onboard from './onboard/Onboard'
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
import Settings from './settings/Settings'
import DappInfo from './about/DappInfo'
import GrowthCampaigns from './growth/Campaigns'
import GrowthWelcome from './growth/Welcome'
import AboutToken from './about/AboutTokens'
import { applyConfiguration } from 'utils/marketplaceCreator'

class App extends Component {
  state = { hasError: false }

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

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-spinner">
          <h5>Error!</h5>
          <div>Please refresh the page</div>
        </div>
      )
    } else if (this.props.creatorConfigLoading) {
      return (
        <div className="app-spinner">
          <h5>Loading</h5>
          <div>Please wait</div>
        </div>
      )
    }

    const { creatorConfig } = this.props
    applyConfiguration(creatorConfig)
    const shouldRenderNavbar = this.props.location.pathname !== '/welcome'
    const enableGrowth = process.env.ENABLE_GROWTH === 'true'
    return (
      <>
        <BetaBanner />
        {shouldRenderNavbar && <Nav />}
        <main>
          <Switch>
            <Route path="/onboard" component={Onboard} />
            <Route path="/listing/:listingID" component={Listing} />
            <Route path="/purchases/:offerId" component={Transaction} />
            <Route path="/my-purchases/:filter?" component={MyPurchases} />
            <Route path="/my-sales/:filter?" component={MySales} />
            <Route path="/my-listings/:filter?" component={MyListings} />
            <Route path="/create" component={CreateListing} />
            <Route path="/user/:id" component={User} />
            <Route path="/profile" component={Profile} />
            <Route path="/messages/:room?" component={Messages} />
            <Route path="/notifications" component={Notifications} />
            <Route
              path="/settings"
              render={props => (
                <Settings
                  {...props}
                  locale={this.props.locale}
                  onLocale={this.props.onLocale}
                />
              )}
            />
            <Route path="/about/dapp-info" component={DappInfo} />
            <Route path="/about/tokens" component={AboutToken} />
            {enableGrowth && (
              <Route path="/campaigns" component={GrowthCampaigns} />
            )}
            {enableGrowth && (
              <Route path="/welcome" component={GrowthWelcome} />
            )}
            <Route component={Listings} />
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
  }
}

export default withCreatorConfig(withRouter(App))

require('react-styl')(`
  .app-spinner
    position: fixed
    top: 50%
    left: 50%
    text-align: center
    transform: translate(-50%, -50%)
`)
