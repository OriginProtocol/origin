import React from 'react'
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import { Web3Provider } from 'react-web3'

// Components
import Listings from './listings-grid.js'
import ListingDetail from './listing-detail.js'
import ListingCreate from './listing-create.js'
import Footer from './footer'
import NavBar from './navbar'
import Overlay from './overlay'

// CSS
import '../css/pure-min.css' // TODO (stan): Is this even used?
import '../css/lato-web.css'
import '../css/poppins.css'
import '../css/app.css'


const HomePage = () => {
  return (
    <main>
      <NavBar />
      <div className="container">
        <Listings />
      </div>
      <Footer />
    </main>
  )
}

const ListingDetailPage = (props) => (
  <div>
    <NavBar />
    <ListingDetail listingId={props.match.params.listingId} />
    <Footer />
  </div>
)

const CreateListingPage = () => (
  <div>
    <NavBar hideCreateButton="true" />
    <div className="container">
      <ListingCreate />
    </div>
    <Footer />
  </div>
)

const AccountUnavailableScreen = () => {
  return (
    <main>
      <NavBar />
      <Overlay imageUrl="/images/flat_cross_icon.svg">
        You are not signed in to MetaMask.<br />
      </Overlay>
      <div className="container empty-page" />
      <Footer />
    </main>
  )
}

const Web3UnavailableScreen = () => {
  return (
    <main>
      <NavBar />
      <Overlay imageUrl="/images/flat_cross_icon.svg">
        MetaMask extension not installed.<br />
        <a target="_blank" href="https://metamask.io/">Get MetaMask</a><br />
        <a target="_blank" href="https://medium.com/originprotocol/origin-demo-dapp-is-now-live-on-testnet-835ae201c58">
          Full Instructions for Demo
        </a>
      </Overlay>
      <div className="container empty-page" />
      <Footer />
    </main>
  )
}

// Top level component
const App = () => (
  <Router>
    <Web3Provider
      web3UnavailableScreen={() => <Web3UnavailableScreen />}
      accountUnavailableScreen={() => <AccountUnavailableScreen />}
    >
      <div>
        <Route exact path="/" component={HomePage}/>
        <Route path="/listing/:listingId" component={ListingDetailPage}/>
        <Route path="/create" component={CreateListingPage}/>
      </div>
    </Web3Provider>
  </Router>
)

export default App
