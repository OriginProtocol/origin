import React, { useEffect, useState } from 'react'
import { Route, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { fetchUser } from '@/actions/user'
import AccountActions from '@/components/AccountActions'
import Navigation from '@/components/Navigation'

const PrivateRoute = ({ component: Component, history, user, ...rest }) => {
  const [expandSidebar, setExpandSidebar] = useState(false)
  useEffect(rest.fetchUser, [])
  useEffect(
    () =>
      history.listen(() => {
        setExpandSidebar(false)
      }),
    []
  )

  const toggleSidebar = () => {
    setExpandSidebar(!expandSidebar)
  }

  return (
    <Route
      {...rest}
      render={props => {
        return (
          <div className="logged-in">
            <Navigation
              onExpandSidebar={toggleSidebar}
              expandSidebar={expandSidebar}
            />
            <div id="main" className={expandSidebar ? 'd-none' : ''}>
              {user.isLoading ? (
                <div className="spinner-grow" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="d-none d-md-block">
                    <AccountActions user={user.user} />
                  </div>
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

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(PrivateRoute)
)

require('react-styl')(`
  .logged-in
    background-color: #f7fbfd
    min-height: 100vh
    display: flex
`)
