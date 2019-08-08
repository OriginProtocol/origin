import React from 'react'
import { Route } from 'react-router-dom'

import Logo from '@/assets/origin-logo.svg'

const PublicRoute = ({ component: Component, ...rest }) => {
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

export default PublicRoute

require('react-styl')(`
  .not-logged-in
    background-color: #007cff
    min-height: 100vh;
    padding-bottom: 50px
    .logo-wrapper
      text-align: center
    .logo
      margin: 80px auto
      width: 160px
`)
