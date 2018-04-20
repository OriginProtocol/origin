import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'

// Components
import ScrollToTop from './scroll-to-top'
import Layout from './layout'
import Listings from './listings-grid'
import ListingCreate from './listing-create'
import ListingDetail from './listing-detail'
import MyListings from './my-listings'
import MyPurchases from './my-purchases'
import Notifications from './notifications'
import Profile from './profile'
import TransactionDetail from './transaction-detail'
import Web3Provider from './web3-provider'
import 'bootstrap/dist/js/bootstrap'

// CSS
import 'bootstrap/dist/css/bootstrap.css'
import '../css/pure-min.css' // TODO (stan): Is this even used?
import '../css/lato-web.css'
import '../css/poppins.css'
import '../css/app.css'


const HomePage = (props) => (
  <div className="container">
    <Listings />
  </div>
)

const ListingDetailPage = (props) => (
  <ListingDetail listingId={props.match.params.listingId} />
)

const CreateListingPage = (props) => (
  <div className="container">
    <ListingCreate />
  </div>
)

const MyListingsPage = (props) => (
  <MyListings />
)

const MyListingsTransactionPage = (props) => (
  <TransactionDetail listingId={props.match.params.listingId} perspective="seller" />
)

const MyPurchasesPage = (props) => (
  <MyPurchases />
)

const MyPurchasesTransactionPage = (props) => (
  <TransactionDetail listingId={props.match.params.listingId} perspective="buyer" />
)

const NotificationsPage = (props) => (
  <Notifications />
)

const ProfilePage = (props) => (
  <Profile />
)

// Top level component
const App = () => (
  <Router>
    <ScrollToTop>
      <Layout>
        <Web3Provider>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/page/:activePage" component={HomePage} />
            <Route path="/listing/:listingId" component={ListingDetailPage} />
            <Route path="/create" component={CreateListingPage} />
            <Route path="/my-listings/:listingId" component={MyListingsTransactionPage} />
            <Route path="/my-listings" component={MyListingsPage} />
            <Route path="/my-purchases/:listingId" component={MyPurchasesTransactionPage} />
            <Route path="/my-purchases" component={MyPurchasesPage} />
            <Route path="/notifications" component={NotificationsPage} />
            <Route path="/profile" component={ProfilePage} />
          </Switch>
        </Web3Provider>
      </Layout>
    </ScrollToTop>
  </Router>
)

export default App
