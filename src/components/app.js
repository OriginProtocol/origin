import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import { Web3Provider } from 'react-web3';

// Components
import Listings from './listings-grid.js'
import ListingDetail from './listing-detail.js'
import ListingCreate from './listing-create.js'

// CSS
import '../css/pure-min.css' // TODO (stan): Is this even used?
import '../css/lato-web.css'
import '../css/poppins.css'
import '../css/app.css'


const NavBar = (props) => {
  return (
    <div className="navbar">
      <Link to="/">
        <img src="/images/origin-logo.png" alt="Origin Logo"/>
      </Link>
      <div className="navbar-create">
        <Link to="/create">Create a Listing</Link>
      </div>
    </div>
  )
}


const HomePage = () => {
  return (
    <div>
      <NavBar />
      <Listings />
    </div>
  )
}


const ListingDetailPage = (props) => (
  <div>
    <NavBar />
    <ListingDetail
      listingId={props.match.params.listingId} />
  </div>
)


const CreateListingPage = () => (
  <div>
    <NavBar />
    <ListingCreate />
  </div>
)

// Handle changing of Metamask account
// const onChangeAccount = (nextAddress) => (console.log(nextAddress))

// TODO: (Stan) Handle missing Metamask
// const web3UnavailableScreen = () => (<div>You need web3!</div>)}

// TODO: (Stan) Handle locked Metamask
// const accountUnavailableScreen = () => (<div>Please unlock your wallet!</div>)

// Top level component
const App = () => (
  <Web3Provider>
    <Router>
      <div>
        <Route exact path="/" component={HomePage}/>
        <Route path="/listing/:listingId" component={ListingDetailPage}/>
        <Route path="/create" component={CreateListingPage}/>
      </div>
    </Router>
  </Web3Provider>
)
export default App
