import React, { Component, Fragment } from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'

import { saveServiceWorkerRegistration } from 'actions/Activation'
import { localizeApp, setMobile } from 'actions/App'
import { fetchProfile } from 'actions/Profile'
import {
  getEthBalance,
  getOgnBalance,
  storeAccountAddress
} from 'actions/Wallet'

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
import Onboarding from 'components/onboarding'
import MyListings from 'components/my-listings'
import MyPurchases from 'components/my-purchases'
import MySales from 'components/my-sales'
import NotFound from 'components/not-found'
import Notifications from 'components/notifications'
import PurchaseDetail from 'components/purchase-detail'
import ScrollToTop from 'components/scroll-to-top'
import Customize from 'components/customize'
import SearchResult from 'components/search/search-result'
import Web3Provider from 'components/web3-provider'

import Profile from 'pages/profile/Profile'
import User from 'pages/user/User'
import SearchBar from 'components/search/searchbar'

import { setClickEventHandler } from 'utils/analytics'
import { initServiceWorker } from 'utils/notifications'
import { mobileDevice } from 'utils/mobile'

// CSS
import 'bootstrap/dist/css/bootstrap.css'
import '../css/lato-web.css'
import '../css/poppins.css'
import '../css/app.css'

const httpsRequired = process.env.FORCE_HTTPS

const HomePage = () => (
  <Fragment>
    <SearchBar />
    <div className="container">
      <ListingsGrid renderMode="home-page" />
    </div>
  </Fragment>
)

const ListingDetailPage = props => (
  <ListingDetail listingId={props.match.params.listingId} withReviews={true} />
)

const CreateListingPage = props => (
  <div className="container">
    <ListingCreate listingId={props.match.params.listingId} />
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
  }

  componentWillMount() {
    if (this.state.redirect) {
      window.location.href = window.location.href.replace(/^http(?!s)/, 'https')
    }

    this.props.localizeApp()
    setClickEventHandler()
  }

  async componentDidMount() {
    this.props.storeAccountAddress()
    this.props.fetchProfile()
    this.props.getEthBalance()
    this.props.getOgnBalance()

    this.detectMobile()

    try {
      const reg = await initServiceWorker()

      this.props.saveServiceWorkerRegistration(reg)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Detect if accessing from a mobile browser
   * @return {void}
   */
  detectMobile() {
    this.props.setMobile(mobileDevice())
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
          <Customize>
            <ScrollToTop>
              <Web3Provider>
                <Onboarding>
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
                        <Route path="/update/:listingId" component={CreateListingPage} />
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
                </Onboarding>
              </Web3Provider>
            </ScrollToTop>
          </Customize>
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
  localizeApp: () => dispatch(localizeApp()),
  saveServiceWorkerRegistration: reg => dispatch(saveServiceWorkerRegistration(reg)),
  setMobile: device => dispatch(setMobile(device)),
  storeAccountAddress: () => dispatch(storeAccountAddress())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
