import React from 'react'

import Avatar from 'components/Avatar'
import UserActivationLink from 'components/UserActivationLink'
import { withRouter } from 'react-router-dom'

const GetStarted = withRouter(({ onClick, location }) => (
  <ul className="navbar-nav">
    <li className="nav-item">
      <UserActivationLink
        className="nav-link"
        to={`/onboard`}
        onClick={() => {
          if (onClick) onClick()
        }}
        location={location}
      >
        <Avatar />
      </UserActivationLink>
    </li>
  </ul>
))

export default GetStarted

require('react-styl')(`
`)
