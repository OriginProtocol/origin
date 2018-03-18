import React from 'react'
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'

// Components
import ScrollToTop from './scroll-to-top'
import Layout from './layout'
import Listings from './listings-grid'
import ListingDetail from './listing-detail'
import ListingCreate from './listing-create'
import Login from './login'
import Web3Provider from './web3-provider'

// CSS
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

const LoginPage = (props) => (
    <Layout {...props} hideLoginButton={true}>
        <div className="container">
            <Login />
        </div>
    </Layout>
)

const CreateListingPage = (props) => (
  <Layout {...props} hideCreateButton={true}>
    <div className="container">
      <ListingCreate />
    </div>
  </Layout>
)

// Top level component
const App = () => (
  <Router>
    <ScrollToTop>
      <Web3Provider>
        <div>
          <Route exact path="/" component={HomePage}/>
          <Route path="/page/:activePage" component={HomePage}/>
          <Route path="/listing/:listingId" component={ListingDetailPage}/>
          <Route path="/create" component={CreateListingPage}/>
          <Route path="/login" component={LoginPage}/>
        </div>
      </Web3Provider>
    </ScrollToTop>
  </Router>
)

export default App
