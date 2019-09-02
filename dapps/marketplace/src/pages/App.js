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
import BrowseModal from './_BrowseModal'
import Footer from './_Footer'

import LoadingSpinner from 'components/LoadingSpinner'

import Onboard from './onboard/Onboard'
import Listings from './listings/Listings'
import Listing from './listing/Listing'
import PromoteListing from './promote-listing/PromoteListing'
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
import OpenApp from './OpenApp'

class App extends Component {
  state = {
    hasError: false,
    displayMobileModal: false,
    mobileModalDismissed: true,
    displayBrowseModal: false,
    isBrave: false,
    broseModalDismissed: false,
    footer: false,
    skipOnboardRewards: false
  }

  componentDidMount() {
    this._asyncRequest = this.checkBrave().then(externalData => {
      this._asyncRequest = null
      this.setState({ isBrave: externalData })
    })
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
    if (
      this.state.isBrave &&
      this.state.displayBrowseModal === false &&
      !this.state.browseModalDismissed
    ) {
      this.setState({ displayBrowseModal: true })
    }
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, err }
  }

  async checkBrave() {
    const isBrave = (await (await fetch(
      'https://api.duckduckgo.com/?q=useragent&format=json'
    )).json()).Answer.includes('Brave')
    this.state.isBrave = isBrave
    if (!isBrave) {
      this.state.mobileModalDismissed = false
    }
    return isBrave
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
      return <LoadingSpinner />
    }

    const { creatorConfig } = this.props
    applyConfiguration(creatorConfig)

    const isMobile = this.props.isMobile

    const isOnWelcomeAndNotOboard = this.props.location.pathname.match(
      /^\/welcome\/?(?!(onboard\/)).*/gi
    )

    const isShowingProtocolLink = this.props.location.pathname.startsWith(
      '/openapp'
    )

    // TODO: Too many regex here, probably it's better to optimize this sooner or later
    const hideNavbar =
      isShowingProtocolLink ||
      (isOnWelcomeAndNotOboard && !isMobile) ||
      (isMobile &&
        (this.props.location.pathname.match(/^\/purchases\/.*$/gi) ||
          this.props.location.pathname.match(
            /^\/campaigns\/(verifications|purchases|invitations|follows|promotions)(\/|$)/gi
          ) ||
          this.props.location.pathname.match(/\/onboard\/finished/gi) ||
          this.props.location.pathname.match(
            /^\/(promote\/.+|create\/.+|listing\/[-0-9]+\/edit\/.+)/gi
          )))

    return (
      <CurrencyContext.Provider value={this.props.currency}>
        {!hideNavbar && (
          <Nav
            onGetStarted={() =>
              this.setState({
                mobileModalDismissed: false,
                browseModalDismissed: false
              })
            }
            onShowFooter={() => this.setState({ footer: true })}
            navbarDarkMode={isOnWelcomeAndNotOboard}
          />
        )}
        <main>
          <Switch>
            <Route
              path="/onboard"
              component={() => (
                <Onboard
                  skipRewards={this.state.skipOnboardRewards}
                  onSkipRewards={() => {
                    this.setState({
                      skipOnboardRewards: true
                    })
                  }}
                />
              )}
            />
            <Route path="/listing/:listingID" component={Listing} />
            <Route path="/promote/:listingID" component={PromoteListing} />
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
            <Route
              exact
              path="/campaigns/:navigation?/:contentId?"
              component={props => (
                <GrowthCampaigns {...props} locale={this.props.locale} />
              )}
            />
            <Route exact path="/rewards/banned" component={GrowthBanned} />
            <Route path="/welcome/:inviteCode?" component={GrowthWelcome} />
            <Route path="/search" component={Listings} />
            <Route path="/openapp" component={OpenApp} />
            <Route component={Listings} />
          </Switch>
        </main>
        {!this.props.isMobileApp && (
          <TranslationModal locale={this.props.locale} />
        )}
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
        {this.state.displayBrowseModal && (
          <BrowseModal
            onClose={() =>
              this.setState({
                displayBrowseModal: false,
                browseModalDismissed: true,
                mobileModalDismissed: false
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
  main
    display: flex
    flex-direction: column
  #app
    height: 100%
    display: flex
    flex-direction: column
`)
