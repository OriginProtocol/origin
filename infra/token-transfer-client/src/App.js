import React from 'react'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'

import Logo from './assets/origin-logo.svg'

import PrivateRoute from './components/PrivateRoute'
// Public routes
import Login from './components/pages/Login'
// Private routes
import AccountActions from './components/AccountActions'
import Navigation from './components/Navigation'
import Dashboard from './components/pages/Dashboard'
import News from './components/pages/News'
import History from './components/pages/History'
import Security from './components/pages/Security'

const App = props => (
  <>
    <PrivateRoute authed={props.sessionEmail}>
      <div className="logged-in">
        <div className="container-fluid">
          <div className="row">
            <div className="sidebar">
              <Navigation />
            </div>
            <div className="col body">
              <AccountActions />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/news" component={News} />
              <Route path="/history" component={History} />
              <Route path="/security" component={Security} />
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
    <div className="not-logged-in">
      <div className="logo-wrapper">
        <img src={Logo} className="logo" />
      </div>
      <Route exact path="/" component={Login} />
      {/* <Route exact path="/" component={Register} /> */}
    </div>
  </>
)

const mapStateToProps = state => {
  return {
    sessionEmail: state.sessionEmail
  }
}

const mapDispatchToProps = () => {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

require('react-styl')(`
  .body
    padding: 70px
  .not-logged-in
    background-color: #007cff
    height: 100%;
    .logo-wrapper
      text-align: center
    .logo
      margin: 80px auto
      width: 160px
  .logged-in
    .container-fluid
      height: 100%
      > .row
        height: 100%
        .sidebar
          width: 260px
`)
