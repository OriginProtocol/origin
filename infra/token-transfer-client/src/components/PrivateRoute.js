import React, { cloneElement, Children } from 'react'
import { Route, Redirect } from 'react-router-dom'

const PrivateRoute = ({ children, authed, ...rest }) => (
  <Route
    {...rest}
    render={() =>
      authed ? (
        <div>
          {Children.map(children, child =>
            cloneElement(child, { ...child.props })
          )}
        </div>
      ) : (
        <Redirect to={{ pathname: '/' }} />
      )
    }
  />
)

export default PrivateRoute
