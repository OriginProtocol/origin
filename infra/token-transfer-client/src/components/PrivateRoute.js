import React, { useEffect, useState } from 'react'
import { Route, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { fetchUser } from '@/actions/user'
import { getUser, getIsLoading } from '@/reducers/user'

import AccountActions from '@/components/AccountActions'
import Navigation from '@/components/Navigation'

const PrivateRoute = ({
  component: Component,
  history,
  isLoading,
  user,
  ...rest
}) => {
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
              {isLoading ? (
                <div className="spinner-grow" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="d-none d-md-block">
                    <AccountActions user={user} />
                  </div>
                  <div className="mt-4">
                    <Component {...props} user={user} />
                  </div>
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
  return {
    user: getUser(user),
    isLoading: getIsLoading(user)
  }
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
