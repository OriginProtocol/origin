import React, { useEffect, useState } from 'react'
import { Route, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom'

import { fetchUser } from '@/actions/user'
import { getUser, getIsLoading } from '@/reducers/user'
import { getSessionExpired } from '@/reducers/session'
import { setSessionExpired } from '@/actions/session'

import AccountActions from '@/components/AccountActions'
import Navigation from '@/components/Navigation'
import Modal from '@/components/Modal'

const PrivateRoute = ({
  component: Component,
  history,
  isLoading,
  user,
  ...rest
}) => {
  const [expandSidebar, setExpandSidebar] = useState(false)

  setSessionExpired(false)

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
    <>
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
                      {user && <AccountActions user={user} />}
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
      {rest.sessionExpired && !isLoading && (
        <Modal>
          <h1 className="mb-2">Session Expired</h1>
          <p>
            Your session has expired. You will need to sign in again to
            continue.
          </p>
          <Link to="/">
            <button className="btn btn-primary btn-lg">Sign In</button>
          </Link>
        </Modal>
      )}
    </>
  )
}

const mapStateToProps = ({ session, user }) => {
  return {
    isLoading: getIsLoading(user),
    sessionExpired: getSessionExpired(session),
    user: getUser(user)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchUser: fetchUser,
      setSessionExpired: setSessionExpired
    },
    dispatch
  )

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PrivateRoute)
)
