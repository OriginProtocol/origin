import React, { Component } from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'

import { fetchProfile } from 'actions/Profile'

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
import User from './user'
import PurchaseDetail from './purchase-detail'
import Web3Provider from './web3-provider'
import 'bootstrap/dist/js/bootstrap'

// CSS
import 'bootstrap/dist/css/bootstrap.css'
import '../css/pure-min.css' // TODO (stan): Is this even used?
import '../css/lato-web.css'
import '../css/poppins.css'
import '../css/app.css'

const HomePage = () => (
  <div className="container">
    <Listings />
  </div>
)

const ListingDetailPage = props => (
  <ListingDetail listingAddress={props.match.params.listingAddress} />
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
  }

  render() {
    return (
      <Router>
        <ScrollToTop>
          <Layout>
            <Web3Provider>
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
              </Switch>
            </Web3Provider>
          </Layout>
          <Alert />
        </ScrollToTop>
      </Router>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  fetchProfile: () => dispatch(fetchProfile()),
})

export default connect(undefined, mapDispatchToProps)(App)
