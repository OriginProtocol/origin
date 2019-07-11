import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withWeb3 from 'hoc/withWeb3'
import withCreatorConfig from 'hoc/withCreatorConfig'
import withIsMobile from 'hoc/withIsMobile'

import Nav from './nav/Nav'
import TranslationModal from './_TranslationModal'
import MobileModal from './_MobileModal'
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
import GrowthBanned from 'pages/growth/Banned'
import GrowthWelcome from './growth/Welcome'
import AboutToken from './about/AboutTokens'
import AboutPayments from './about/AboutPayments'
import AboutCrypto from './about/AboutCrypto'
import { applyConfiguration } from 'utils/marketplaceCreator'
import CurrencyContext from 'constants/CurrencyContext'

class App extends Component {
  state = {
    hasError: false,
    displayMobileModal: false,
    mobileModalDismissed: false,
    footer: false
  }

  componentDidMount() {
    if (window.ethereum) {
      setTimeout(() => window.ethereum.enable(), 100)
    }
  }

  componentDidUpdate() {
    if (get(this.props, 'location.state.scrollToTop')) {
      window.scrollTo(0, 0)
    }
    if (
      !this.props.web3Loading &&
      !this.props.web3.walletType &&
      this.state.displayMobileModal === false &&
      !this.state.mobileModalDismissed
    ) {
      this.setState({ displayMobileModal: true })
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

    const isMobile = this.props.isMobile

    const isOnWelcomeAndNotOboard = this.props.location.pathname.match(
      /^\/welcome\/?(?!(onboard\/)).*/gi
    )

    // TODO: Too many regex here, probably it's better to optimize this sooner or later
    const hideNavbar =
      (isOnWelcomeAndNotOboard && !isMobile) ||
      (isMobile &&
        (this.props.location.pathname.match(/^\/purchases\/.*$/gi) ||
          this.props.location.pathname.match(/^\/campaigns\/purchases$/gi) ||
          this.props.location.pathname.match(/^\/campaigns\/invitations$/gi) ||
          this.props.location.pathname.match(/\/onboard\/finished/gi) ||
          this.props.location.pathname.match(
            /^\/(create\/.+|listing\/[-0-9]+\/edit\/.+)/gi
          )))

    return (
      <CurrencyContext.Provider value={this.props.currency}>
        {!hideNavbar && (
          <Nav
            onGetStarted={() => this.setState({ mobileModalDismissed: false })}
            onShowFooter={() => this.setState({ footer: true })}
            navbarDarkMode={isOnWelcomeAndNotOboard}
          />
        )}
        <main>
          <Switch>
            <Route path="/onboard" component={Onboard} />
            <Route path="/listing/:listingID" component={Listing} />
            <Route path="/purchases/:offerId" component={Transaction} />
            <Route path="/my-purchases/:filter?" component={MyPurchases} />
            <Route path="/my-sales/:filter?" component={MySales} />
            <Route path="/my-listings/:filter?" component={MyListings} />
            <Route path="/create" component={CreateListing} />
            <Route path="/user/:id/:content?" component={User} />
            <Route path="/profile/:attestation?" component={Profile} />
            <Route path="/messages/:room?" component={Messages} />
            <Route path="/notifications" component={Notifications} />
            <Route
              path="/settings"
              render={props => (
                <Settings
                  {...props}
                  locale={this.props.locale}
                  onLocale={this.props.onLocale}
                  currency={this.props.currency}
                  onCurrency={this.props.onCurrency}
                />
              )}
            />
            <Route path="/about/dapp-info" component={DappInfo} />
            <Route path="/about/crypto" component={AboutCrypto} />
            <Route path="/about/payments" component={AboutPayments} />
            <Route path="/about/tokens" component={AboutToken} />
            <Route exact path="/campaigns" component={GrowthCampaigns} />
            <Route
              exact
              path="/campaigns/:navigation"
              component={GrowthCampaigns}
            />
            <Route exact path="/rewards/banned" component={GrowthBanned} />
            <Route path="/welcome/:inviteCode?" component={GrowthWelcome} />
            <Route path="/search" component={Listings} />
            <Route component={Listings} />
          </Switch>
        </main>
        <TranslationModal locale={this.props.locale} />
        {this.state.displayMobileModal && (
          <MobileModal
            onClose={() =>
              this.setState({
                displayMobileModal: false,
                mobileModalDismissed: true
              })
            }
          />
        )}
        <Footer
          open={this.state.footer}
          onClose={() => this.setState({ footer: false })}
          locale={this.props.locale}
          onLocale={this.props.onLocale}
          creatorConfig={creatorConfig}
          currency={this.props.currency}
          onCurrency={this.props.onCurrency}
        />
      </CurrencyContext.Provider>
    )
  }
}

export default withIsMobile(withWeb3(withCreatorConfig(withRouter(App))))

require('react-styl')(`
  .app-spinner
    position: fixed
    top: 50%
    left: 50%
    text-align: center
    transform: translate(-50%, -50%)
`)
