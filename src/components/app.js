import React, { Component, Fragment } from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'

import { localizeApp, setMobile } from 'actions/App'
import { fetchProfile } from 'actions/Profile'
import {
  getEthBalance,
  getOgnBalance,
  init as initWallet
} from 'actions/Wallet'
import { fetchFeaturedHiddenListings } from 'actions/Listing'

// Components
import AboutTokens from 'components/about-tokens'
import Alert from 'components/alert'
import Analytics from 'components/analytics'
import Arbitration from 'components/arbitration'
import DappInfo from 'components/dapp-info'
import Layout from 'components/layout'
import ListingCreate from 'components/listing-create'
import ListingDetail from 'components/listing-detail'
import ListingsGrid from 'components/listings-grid'
import Messages from 'components/messages'
import MessagingProvider from 'components/messaging-provider'
import BetaModal from 'components/modals/beta-modal'
import MyListings from 'components/my-listings'
import MyPurchases from 'components/my-purchases'
import MySales from 'components/my-sales'
import NotFound from 'components/not-found'
import Notifications from 'components/notifications'
import OnboardingModal from 'components/onboarding-modal'
import PurchaseDetail from 'components/purchase-detail'
import ScrollToTop from 'components/scroll-to-top'
import SearchResult from 'components/search/search-result'
import Web3Provider from 'components/web3-provider'

import Profile from 'pages/profile/Profile'
import User from 'pages/user/User'
import SearchBar from 'components/search/searchbar'

import 'bootstrap/dist/js/bootstrap'

import { setClickEventHandler } from 'utils/analytics'

// CSS
import 'bootstrap/dist/css/bootstrap.css'
import '../css/lato-web.css'
import '../css/poppins.css'
import '../css/app.css'

const httpsRequired = process.env.FORCE_HTTPS

const HomePage = () => (
  <div>
    <SearchBar />
    <div className="container">
      <ListingsGrid renderMode="home-page" />
    </div>
  </div>
)

const ListingDetailPage = props => (
  <ListingDetail listingId={props.match.params.listingId} withReviews={true} />
)

const CreateListingPage = () => (
  <div className="container">
    <ListingCreate />
  </div>
)

const PurchaseDetailPage = props => (
  <PurchaseDetail offerId={props.match.params.offerId} />
)

const ArbitrationPage = props => (
  <Arbitration offerId={props.match.params.offerId} />
)

const UserPage = props => <User userAddress={props.match.params.userAddress} />

// Top level component
class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      redirect: httpsRequired && !window.location.protocol.match('https')
    }

    this.featuredhiddenListingsFetched = false
  }

  componentWillMount() {
    if (this.state.redirect) {
      window.location.href = window.location.href.replace(/^http(?!s)/, 'https')
    }

    this.props.localizeApp()
    setClickEventHandler()
  }

  componentDidMount() {
    this.props.fetchProfile()
    this.props.initWallet()
    this.props.getEthBalance()
    this.props.getOgnBalance()

    this.detectMobile()
  }

  componentDidUpdate() {
    if (this.props.networkId !== null && !this.featuredhiddenListingsFetched) {
      this.featuredhiddenListingsFetched = true
      this.props.fetchFeaturedHiddenListings(this.props.networkId)
    }
  }

  /**
   * Detect if accessing from a mobile browser
   * @return {void}
   */
  detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera

    if (/android/i.test(userAgent)) {
      this.props.setMobile('Android')
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      this.props.setMobile('iOS')
    } else {
      this.props.setMobile(null)
    }
  }

  render() {
    // prevent flickering
    if (this.state.redirect) {
      return null
    }

    return this.props.selectedLanguageCode ? (
      <IntlProvider
        locale={this.props.selectedLanguageCode}
        defaultLocale="en-US"
        messages={this.props.messages}
        textComponent={Fragment}
      >
        <Router>
          <ScrollToTop>
            <Web3Provider>
              <MessagingProvider>
                <Analytics>
                  <Layout>
                    <Switch>
                      <Route exact path="/" component={HomePage} />
                      <Route path="/page/:activePage" component={HomePage} />
                      <Route
                        path="/listing/:listingId"
                        component={ListingDetailPage}
                      />
                      <Route path="/create" component={CreateListingPage} />
                      <Route path="/my-listings" component={MyListings} />
                      <Route
                        path="/purchases/:offerId"
                        component={PurchaseDetailPage}
                      />
                      <Route
                        path="/arbitration/:offerId"
                        component={ArbitrationPage}
                      />
                      <Route path="/my-purchases" component={MyPurchases} />
                      <Route path="/my-sales" component={MySales} />
                      <Route
                        path="/messages/:conversationId?"
                        component={Messages}
                      />
                      <Route path="/notifications" component={Notifications} />
                      <Route path="/profile" component={Profile} />
                      <Route path="/users/:userAddress" component={UserPage} />
                      <Route path="/search" component={SearchResult} />
                      <Route path="/about-tokens" component={AboutTokens} />
                      <Route path="/dapp-info" component={DappInfo} />
                      <Route component={NotFound} />
                    </Switch>
                  </Layout>
                </Analytics>
                <Alert />
                <BetaModal />
                <OnboardingModal />
              </MessagingProvider>
            </Web3Provider>
          </ScrollToTop>
        </Router>
      </IntlProvider>
    ) : null // potentially a loading indicator
  }
}

const mapStateToProps = state => ({
  messages: state.app.translations.messages,
  selectedLanguageCode: state.app.translations.selectedLanguageCode,
  networkId: state.app.web3.networkId
})

const mapDispatchToProps = dispatch => ({
  fetchProfile: () => dispatch(fetchProfile()),
  getEthBalance: () => dispatch(getEthBalance()),
  getOgnBalance: () => dispatch(getOgnBalance()),
  initWallet: () => dispatch(initWallet()),
  setMobile: device => dispatch(setMobile(device)),
  localizeApp: () => dispatch(localizeApp()),
  fetchFeaturedHiddenListings: (networkId) => dispatch(fetchFeaturedHiddenListings(networkId))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
