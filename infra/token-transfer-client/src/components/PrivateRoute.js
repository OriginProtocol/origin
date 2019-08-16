import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import AccountActions from '@/components/AccountActions'
import Navigation from '@/components/Navigation'

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        return rest.email ? (
          <div className="logged-in">
            <div className="sidebar">
              <Navigation />
            </div>
            <div id="main">
              <AccountActions />
              <Component {...props} />
            </div>
          </div>
        ) : (
          <Redirect to="/" />
        )
      }}
    />
  )
}

const mapStateToProps = ({ session }) => {
  return {
    email: session.email
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
    display: flex
    .sidebar
      width: 260px
    #main
      float: right
      width: calc(100% - 260px)
      padding: 70px
`)
