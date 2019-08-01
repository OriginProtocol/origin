import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import AccountActions from './AccountActions'
import Navigation from './Navigation'

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        return rest.sessionEmail ? (
          <div className="logged-in">
            <div className="container-fluid">
              <div className="row">
                <div className="sidebar">
                  <Navigation />
                </div>
                <div id="main" className="col">
                  <AccountActions />
                  <Component {...props} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Redirect to="/" />
        )
      }}
    />
  )
}

const mapStateToProps = state => {
  return {
    sessionEmail: state.sessionEmail
  }
}

export default connect(
  mapStateToProps,
  null
)(PrivateRoute)

require('react-styl')(`
  .logged-in
    background-color: #f7fbfd
    min-height: 100vh
    .container-fluid
      min-height: 100vh
      > .row
        min-height: 100vh
        .sidebar
          width: 260px
    #main
      padding: 70px
`)
