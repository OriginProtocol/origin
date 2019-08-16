import React, { useEffect } from 'react'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { fetchUser } from '@/actions/user'
import AccountActions from '@/components/AccountActions'
import Navigation from '@/components/Navigation'

const PrivateRoute = ({ component: Component, user, ...rest }) => {
  useEffect(rest.fetchUser, [])

  return (
    <Route
      {...rest}
      render={props => {
        return (
          <div className="logged-in">
            <Navigation />
            <div id="main">
              {user.isFetching ? (
                <div className="spinner-grow" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <>
                  <AccountActions user={user.user} />
                  <Component {...props} user={user.user} />
                </>
              )}
            </div>
          </div>
        )
      }}
    />
  )
}

const mapStateToProps = ({ user }) => {
  return { user }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchUser: fetchUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PrivateRoute)

require('react-styl')(`
  .logged-in
    background-color: #f7fbfd
    min-height: 100vh
    display: flex
`)
