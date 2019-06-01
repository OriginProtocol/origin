import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { fbt } from 'fbt-runtime'

import UserActivationLink from 'components/UserActivationLink'

class GetStarted extends Component {
  state = { open: false }
  render() {
    return (
      <ul className="navbar-nav">
        <li className="nav-item">
          <UserActivationLink {...this.props} className="nav-link px-3" />
        </li>
        <li className="nav-item d-none d-md-block">
          <UserActivationLink
            {...this.props}
            className="nav-link px-3"
            location={{ pathname: '/create' }}
          >
            <fbt desc="navigation.getStarted.sellOnOrigin">Sell on Origin</fbt>
          </UserActivationLink>
        </li>
      </ul>
    )
  }
}

export default withRouter(GetStarted)

require('react-styl')(`
`)
