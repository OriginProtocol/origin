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
import ListingCreate from './listing-create.js'
import Overlay from './overlay'

// CSS
import '../css/pure-min.css' // TODO (stan): Is this even used?
import '../css/lato-web.css'
import '../css/poppins.css'
import '../css/app.css'

function NetworkCheck(props, context) {
  const web3Context = context.web3;
  /**
   * web3Context = {
   *   accounts: {Array<string>} - All accounts
   *   selectedAccount: {string} - Default ETH account address (coinbase)
   *   network: {string} - One of 'MAINNET', 'ROPSTEN', or 'UNKNOWN'
   *   networkId: {string} - The network ID (e.g. '1' for main net)
   * }
   */
  if ((window.location.hostname === "demo.originprotocol.com") &&
    (parseInt(web3Context.networkId, 10) !== 4)) {
    return (
      <Overlay imageUrl="/images/flat_cross_icon.svg">
        MetaMask should be on <strong>Rinkeby</strong> Network.<br />
        Currently on network {web3Context.networkId}.
      </Overlay>
    );
  }
  else return null
}

NetworkCheck.contextTypes = {
  web3: PropTypes.object
};

const NavBar = (props) => {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/">
          <div className="logo-container">
            <img src="/images/origin-logo.png"
              srcSet="/images/origin-logo@2x.png 2x,
                /images/origin-logo@3x.png 3x"
              className="origin-logo" alt="Origin Protocol"/>
          </div>
        </Link>
        <NetworkCheck />
        {!props.hideCreateButton &&
          <div className="navbar-create">
            <Link to="/create">
              Create Listing
            </Link>
          </div>
        }
      </div>
    </nav>
  )
}

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
    <ListingDetail
      listingId={props.match.params.listingId} />
    <Footer />
  </div>
)

const CreateListingPage = () => (
  <div>
    <NavBar hideCreateButton="true"/>
    <div className="container">
      <ListingCreate />
    </div>
    <Footer />
  </div>
)

const Footer = (props) => {
  return (
    <footer className="dark-footer">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="logo-container">
              <img src="/images/origin-logo.png"
                srcSet="/images/origin-logo@2x.png 2x,
                  /images/origin-logo@3x.png 3x"
                className="origin-logo" alt="Origin Protocol"/>
            </div>
            <p className="company-mission">
              Origin is building the sharing economy of tomorrow. Buyers and sellers will be able to transact without rent-seeking middlemen. We believe in lowering transaction fees, reducing censorship and regulation, and giving early participants in the community a stake in the network.
            </p>
            <p>
              &copy; 2018 Origin, Inc.
            </p>
          </div>
          <div className="col-12 col-md-6">
            <div className="row">
              <div className="col-6 col-md-4">
                <div className="footer-header">
                  Documentation
                </div>
                <ul className="footer-links">
                  <li>
                    <a href="https://www.originprotocol.com/product-brief">Product Brief</a>
                  </li>
                  <li>
                    <a href="https://www.originprotocol.com/whitepaper">Whitepaper</a>
                  </li>
                  <li>
                    <a href="https://github.com/OriginProtocol">Github</a>
                  </li>
                  <li>
                    <a href="http://docs.originprotocol.com/">Docs</a>
                  </li>
                </ul>
              </div>
              <div className="col-6 col-md-4">
                <div className="footer-header">
                  Community
                </div>
                <ul className="footer-links">
                  <li>
                    <a href="http://slack.originprotocol.com">Slack</a>
                  </li>
                  <li>
                    <a href="https://t.me/originprotocol">Telegram</a>
                  </li>
                  <li>
                    <a href="https://medium.com/originprotocol">Medium</a>
                  </li>
                  <li>
                    <a href="https://twitter.com/originprotocol">Twitter</a>
                  </li>
                  <li>
                    <a href="https://www.facebook.com/originprotocol">Facebook</a>
                  </li>
                </ul>
              </div>
              <div className="col-6 col-md-4">
                <div className="footer-header">
                  Organization
                </div>
                <ul className="footer-links">
                  <li>
                    <a href="http://www.originprotocol.com/presale">Presale</a>
                  </li>
                  <li>
                    <a href="http://www.originprotocol.com/team">Team</a>
                  </li>
                  <li>
                    <a href="https://angel.co/originprotocol/jobs">Jobs (We're hiring!)</a>
                  </li>
                  <li>
                    <a href="https://www.google.com/maps/place/845+Market+St+%23450a,+San+Francisco,+CA+94103">845 Market St, #450A, San Francisco, CA 94103</a>
                  </li>
                  <li>
                    <a href="mailto:info@originprotocol.com">info@originprotocol.com</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

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
