import React from 'react'
import { Route } from 'react-router-dom'

import Logo from '@/assets/origin-logo.svg'

const PublicRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => (
        <div className="not-logged-in">
          <div className="text-center" style={{ backgroundColor: '#007cff' }}>
            <img src={Logo} className="my-5" style={{ width: '160px' }} />
          </div>
          <Component {...props} />
        </div>
      )}
    />
  )
}

export default PublicRoute
