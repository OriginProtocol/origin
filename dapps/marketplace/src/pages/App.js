import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import get from 'lodash/get'
import Store from 'utils/store'
import { fbt } from 'fbt-runtime'

import withCreatorConfig from 'hoc/withCreatorConfig'

import RewardsBanner from './_RewardsBanner'
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
import AboutPayments from './about/AboutPayments'
import AboutCrypto from './about/AboutCrypto'
import { applyConfiguration } from 'utils/marketplaceCreator'
import CurrencyContext from 'constants/CurrencyContext'

const store = Store('localStorage')

class App extends Component {
  state = { hasError: false, currency: store.get('currency', 'fiat-USD') }

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

  static getDerivedStateFromError(err) {
    return { hasError: true, err }
  }

  render() {
    
    if (this.state.hasError) {
      return (
        <div className="app-spinner">
          <h5 onClick={() => alert(this.state.err)}>Error!</h5>
          <div>
            <fbt desc="App.refreshPage">Please refresh the page</fbt>
          </div>
        </div>
      )
    } else if (this.props.creatorConfigLoading) {
      return (
        <div className="app-spinner">
          <fbt desc="App.loadingPleaseWait">
            <h5>Loading</h5>
            <div>Please wait</div>
          </fbt>
        </div>
      )
    }

    const { creatorConfig } = this.props
    applyConfiguration(creatorConfig)

    // hide the rewards bar if you're on any of the rewards pages
    const hideRewardsBar =
      this.props.location.pathname.match(/^\/welcome$/g) ||
      this.props.location.pathname.match(/^\/campaigns$/g)

    // hide navigation bar on growth welcome screen and show it
    // in onboarding variation of that screen
    const hideNavbar =
      !this.props.location.pathname.match(/^\/welcome\/onboard.*$/g) &&
      this.props.location.pathname.match(/^\/welcome.*$/g)

    return (
      <CurrencyContext.Provider value={this.state.currency}>
        {!hideRewardsBar && <RewardsBanner />}
        {!hideNavbar && <Nav />}
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
                  currency={this.state.currency}
                  onCurrency={currency => this.setCurrency(currency)}
                />
              )}
            />
            <Route path="/about/dapp-info" component={DappInfo} />
            <Route path="/about/crypto" component={AboutCrypto} />
            <Route path="/about/payments" component={AboutPayments} />
            <Route path="/about/tokens" component={AboutToken} />
            <Route exact path="/campaigns" component={GrowthCampaigns} />
            <Route path="/welcome/:inviteCode?" component={GrowthWelcome} />
            <Route component={Listings} />
          </Switch>
        </main>
        <TranslationModal locale={this.props.locale} />
        <Footer
          locale={this.props.locale}
          onLocale={this.props.onLocale}
          creatorConfig={creatorConfig}
          currency={this.state.currency}
          onCurrency={this.props.onCurrency}
        />
      </CurrencyContext.Provider>
    )
  }

  setCurrency(currency) {
    this.setState({ currency }, () => store.set('currency', currency))
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
