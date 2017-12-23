import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import { Web3Provider } from 'react-web3';
import PropTypes from 'prop-types';

// Components
import Listings from './listings-grid.js'
import ListingDetail from './listing-detail.js'

// CSS
import '../css/pure-min.css'
import '../css/lato-web.css'
import '../css/poppins.css'
import '../css/app.css'


const NavBar = (props, context) => {
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

// Home

const HomePage = (props, context) => {
  const web3Context = context.web3;
  return (
    <div>
      <NavBar />
      <Listings />
    </div>
  )
}

HomePage.contextTypes = {
  web3: PropTypes.object
};


const ListingDetailPage = () => (
  <div>
    <NavBar />
    <ListingDetail />
  </div>
)


const Create = () => (
  <div>
    <NavBar />
    <h2>Create</h2>
  </div>
)


// Handle changing of Metamask account
const onChangeAccount = (nextAddress) => (console.log(nextAddress))

// TODO: (Stan) Handle missing Metamask
// const web3UnavailableScreen = () => (<div>You need web3!</div>)}

// TODO: (Stan) Handle locked Metamask
// const accountUnavailableScreen = () => (<div>Please unlock your wallet!</div>)

// Top level component
const App = () => (
  <Web3Provider onChangeAccount={onChangeAccount}>
    <Router>
      <div>
        <Route exact path="/" component={HomePage}/>
        <Route path="/listing" component={ListingDetailPage}/>
        <Route path="/create" component={Create}/>
      </div>
    </Router>
  </Web3Provider>
)
export default App


// ReactDOM.render(
//   <DemoApp />,
//   document.getElementById('root')
// );
