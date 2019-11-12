import React, { useEffect } from 'react'
import { Redirect, Route, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { fetchUser } from '@/actions/user'
import { getUser, getIsLoading } from '@/reducers/user'
import { getSessionExpired } from '@/reducers/session'
import { setSessionExpired } from '@/actions/session'
import Logo from '@/assets/origin-logo.svg'

const OnboardingRoute = ({
  component: Component,
  isLoading,
  user,
  ...rest
}) => {
  setSessionExpired(false)

  useEffect(rest.fetchUser, [])

  if (rest.sessionExpired && !isLoading) {
    return <Redirect to="/login?error=expired" />
  }

  return (
    <Route
      {...rest}
      render={props => (
        <div className="not-logged-in">
          <div className="text-center" style={{ backgroundColor: '#007cff' }}>
            <img src={Logo} className="my-5" style={{ width: '160px' }} />
          </div>
          {isLoading ? (
            <div className="action-card">
              <div className="spinner-grow" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <Component {...props} user={user} />
          )}
        </div>
      )}
    />
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
  connect(mapStateToProps, mapDispatchToProps)(OnboardingRoute)
)
