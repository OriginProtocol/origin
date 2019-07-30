import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import AccountActions from './AccountActions'
import Navigation from './Navigation'

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props =>
        props.sessionEmail ? (
          <div className="logged-in">
            <div className="container-fluid">
              <div className="row">
                <div className="sidebar">
                  <Navigation />
                </div>
                <div className="col body">
                  <AccountActions />
                  <Component {...props} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Redirect to="/" />
        )
      }
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
