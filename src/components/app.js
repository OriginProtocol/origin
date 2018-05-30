import React, { Component } from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'

import { setMobile } from 'actions/App'
import { fetchProfile } from 'actions/Profile'
import { init as initWallet } from 'actions/Wallet'

// Components
import Alert from './alert'
import ScrollToTop from './scroll-to-top'
import Layout from './layout'
import Listings from './listings-grid'
import ListingCreate from './listing-create'
import ListingDetail from './listing-detail'
import MyListings from './my-listings'
import MyPurchases from './my-purchases'
import MySales from './my-sales'
import Notifications from './notifications'
import Profile from '../pages/profile/Profile'
import User from '../pages/user/User'
import PurchaseDetail from './purchase-detail'
import Web3Provider from './web3-provider'
import NotFound from './not-found'
import 'bootstrap/dist/js/bootstrap'

// CSS
import 'bootstrap/dist/css/bootstrap.css'
import '../css/lato-web.css'
import '../css/poppins.css'
import '../css/app.css'

const HomePage = () => (
  <div className="container">
    <Listings />
  </div>
)

const ListingDetailPage = props => (
  <ListingDetail listingAddress={props.match.params.listingAddress} withReviews={true} />
)

const CreateListingPage = () => (
  <div className="container">
    <ListingCreate />
  </div>
)

const PurchaseDetailPage = props => (
  <PurchaseDetail purchaseAddress={props.match.params.purchaseAddress} />
)

const UserPage = props => <User userAddress={props.match.params.userAddress} />

// Top level component
class App extends Component {
  componentDidMount() {
    this.props.fetchProfile()
    this.props.initWallet()

    this.detectMobile()
  }

  /**
   * Detect if accessing from a mobile browser
   * @return {void}
   */
  detectMobile() {
    let userAgent = navigator.userAgent || navigator.vendor || window.opera

    if (/android/i.test(userAgent)) {
      this.props.setMobile('Android')
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      this.props.setMobile('iOS')
    } else {
      this.props.setMobile(null)
    }
  }

  render() {
    return (
      <Router>
        <ScrollToTop>
          <Web3Provider>
            <Layout>
              <Switch>
                <Route exact path="/" component={HomePage} />
                <Route path="/page/:activePage" component={HomePage} />
                <Route
                  path="/listing/:listingAddress"
                  component={ListingDetailPage}
                />
                <Route path="/create" component={CreateListingPage} />
                <Route path="/my-listings" component={MyListings} />
                <Route
                  path="/purchases/:purchaseAddress"
                  component={PurchaseDetailPage}
                />
                <Route path="/my-purchases" component={MyPurchases} />
                <Route path="/my-sales" component={MySales} />
                <Route path="/notifications" component={Notifications} />
                <Route path="/profile" component={Profile} />
                <Route path="/users/:userAddress" component={UserPage} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
            <Alert />
          </Web3Provider>
        </ScrollToTop>
      </Router>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  fetchProfile: () => dispatch(fetchProfile()),
  initWallet: () => dispatch(initWallet()),
  setMobile: device => dispatch(setMobile(device)),
})

export default connect(undefined, mapDispatchToProps)(App)
