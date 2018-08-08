import React, { Component, Fragment } from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'

import { setMobile, localizeApp, setMessagingEnabled } from 'actions/App'
import { addMessage } from 'actions/Message'
import { fetchNotifications } from 'actions/Notification'
import { fetchProfile } from 'actions/Profile'
import { init as initWallet } from 'actions/Wallet'

// Components
import Alert from 'components/alert'
import Layout from 'components/layout'
import ListingCreate from 'components/listing-create'
import ListingDetail from 'components/listing-detail'
import Listings from 'components/listings-grid'
import Messages from 'components/messages'
import MyListings from 'components/my-listings'
import MyPurchases from 'components/my-purchases'
import MySales from 'components/my-sales'
import NotFound from 'components/not-found'
import Notifications from 'components/notifications'
import PurchaseDetail from 'components/purchase-detail'
import ScrollToTop from 'components/scroll-to-top'
import Web3Provider from 'components/web3-provider'

import Profile from 'pages/profile/Profile'
import User from 'pages/user/User'

import 'bootstrap/dist/js/bootstrap'

// CSS
import 'bootstrap/dist/css/bootstrap.css'
import '../css/lato-web.css'
import '../css/poppins.css'
import '../css/app.css'

import origin from '../services/origin'

const ONE_SECOND = 1000

const HomePage = () => (
  <div className="container">
    <Listings />
  </div>
)

const ListingDetailPage = props => (
  <ListingDetail listingAddress={props.match.params.listingAddress} withReviews={true} />
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

  componentWillMount() {
    this.props.localizeApp()

    // detect existing messaging account
    origin.messaging.events.on('ready', accountKey => {
      this.props.setMessagingEnabled(!!accountKey)
    })

    // detect net decrypted messages
    origin.messaging.events.on('msg', obj => {
      this.props.addMessage(obj)
    })

    // To Do: handle incoming messages when no Origin Messaging Private Key is available
    origin.messaging.events.on('emsg', obj => {
      console.error('A message has arrived that could not be decrypted:', obj)
    })

    // poll for notifications
    setInterval(() => {
      this.props.fetchNotifications()
    }, 10 * ONE_SECOND)
  }

  componentDidMount() {
    this.props.fetchProfile()
    this.props.initWallet()

    this.detectMobile()
  }

  /**
   * Detect if accessing from a mobile browser
   * @return {void}
   */
  detectMobile() {
    let userAgent = navigator.userAgent || navigator.vendor || window.opera

    if (/android/i.test(userAgent)) {
      this.props.setMobile('Android')
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      this.props.setMobile('iOS')
    } else {
      this.props.setMobile(null)
    }
  }

  render() {
    return this.props.selectedLanguageCode ? (
      <IntlProvider 
        locale={this.props.selectedLanguageCode}
        defaultLocale="en-US"
        messages={this.props.messages}
        textComponent={Fragment}>
        <Router>
          <ScrollToTop>
            <Web3Provider>
              <Layout>
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
                  <Route path="/messages/:conversationId?" component={Messages} />
                  <Route path="/notifications" component={Notifications} />
                  <Route path="/profile" component={Profile} />
                  <Route path="/users/:userAddress" component={UserPage} />
                  <Route component={NotFound} />
                </Switch>
              </Layout>
              <Alert />
            </Web3Provider>
          </ScrollToTop>
        </Router>
      </IntlProvider>
    ) : null // potentially a loading indicator
  }
}

const mapStateToProps = state => ({
  messages: state.app.translations.messages,
  selectedLanguageCode: state.app.translations.selectedLanguageCode
})

const mapDispatchToProps = dispatch => ({
  addMessage: (obj) => dispatch(addMessage(obj)),
  fetchNotifications: () => dispatch(fetchNotifications()),
  fetchProfile: () => dispatch(fetchProfile()),
  initWallet: () => dispatch(initWallet()),
  setMessagingEnabled: (bool) => dispatch(setMessagingEnabled(bool)),
  setMobile: device => dispatch(setMobile(device)),
  localizeApp: () => dispatch(localizeApp())
})

export default connect(mapStateToProps, mapDispatchToProps)(App)
