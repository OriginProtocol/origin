import React from 'react'
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'

// Components
import ScrollToTop from './scroll-to-top'
import Layout from './layout'
import Listings from './listings-grid'
import ListingCreate from './listing-create'
import ListingDetail from './listing-detail'
import Profile from './profile.js'
import Web3Provider from './web3-provider'
import 'bootstrap/dist/js/bootstrap'

// CSS
import 'bootstrap/dist/css/bootstrap.css'
import '../css/pure-min.css' // TODO (stan): Is this even used?
import '../css/lato-web.css'
import '../css/poppins.css'
import '../css/app.css'


const HomePage = (props) => (
  <Layout {...props}>
    <div className="container">
      <Listings />
    </div>
  </Layout>
)

const ListingDetailPage = (props) => (
  <Layout {...props}>
    <ListingDetail listingId={props.match.params.listingId} />
  </Layout>
)

const CreateListingPage = (props) => (
  <Layout {...props}>
    <div className="container">
      <ListingCreate />
    </div>
  </Layout>
)

const ProfilePage = (props) => (
  <Layout {...props}>
    <Profile />
  </Layout>
)

// Top level component
const App = () => (
  <Router>
    <ScrollToTop>
      <Web3Provider>
        <div>
          <Route exact path="/" component={HomePage} />
          <Route path="/page/:activePage" component={HomePage} />
          <Route path="/listing/:listingId" component={ListingDetailPage} />
          <Route path="/create" component={CreateListingPage} />
          <Route path="/profile" component={ProfilePage} />
        </div>
      </Web3Provider>
    </ScrollToTop>
  </Router>
)

export default App
