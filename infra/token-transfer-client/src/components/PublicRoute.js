import React from 'react'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'

import Logo from '../assets/origin-logo.svg'

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => (
        <div className="not-logged-in">
          <div className="logo-wrapper">
            <img src={Logo} className="logo" />
          </div>
          <Component {...props} />
        </div>
      )}
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
