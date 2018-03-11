import React from 'react'
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import { Web3Provider } from 'react-web3'

// Components
import ScrollToTop from './scroll-to-top.js'
import Listings from './listings-grid.js'
import ListingDetail from './listing-detail.js'
import ListingCreate from './listing-create.js'
import Login from './login.js'
import Footer from './footer'
import NavBar from './navbar'
import Overlay from './overlay'

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

const AccountUnavailableScreen = (props) => (
  <Layout {...props}>
    <Overlay imageUrl="/images/flat_cross_icon.svg">
      You are not signed in to MetaMask.<br />
    </Overlay>
    <div className="container empty-page" />
  </Layout>
)

const Web3UnavailableScreen = (props) => (
  <Layout {...props}>
    <Overlay imageUrl="/images/flat_cross_icon.svg">
      MetaMask extension not installed.<br />
      <a target="_blank" href="https://metamask.io/">Get MetaMask</a><br />
      <a target="_blank" href="https://medium.com/originprotocol/origin-demo-dapp-is-now-live-on-testnet-835ae201c58">
        Full Instructions for Demo
      </a>
    </Overlay>
    <div className="container empty-page" />
  </Layout>
)

const Layout = ({ children, hideCreateButton, hideLoginButton }) => (
  <div>
    <main>
      <NavBar hideCreateButton={hideCreateButton} hideLoginButton={hideLoginButton} />
      {children}
    </main>
    <Footer />
  </div>
)

// Top level component
const App = () => (
  <Router>
    <ScrollToTop>
      <Web3Provider
        web3UnavailableScreen={() => <Web3UnavailableScreen />}
        accountUnavailableScreen={() => <AccountUnavailableScreen />}
      >
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
