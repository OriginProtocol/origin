import React, { Fragment } from 'react'
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

const ProfilePage = (props) => (
  <Profile />
)

// Top level component
const App = () => (
  <Router>
    <ScrollToTop>
      <Layout>
        <Web3Provider>
          <Fragment>
            <Route exact path="/" component={HomePage} />
            <Route path="/page/:activePage" component={HomePage} />
            <Route path="/listing/:listingId" component={ListingDetailPage} />
            <Route path="/create" component={CreateListingPage} />
            <Route path="/profile" component={ProfilePage} />
          </Fragment>
        </Web3Provider>
      </Layout>
    </ScrollToTop>
  </Router>
)

export default App
