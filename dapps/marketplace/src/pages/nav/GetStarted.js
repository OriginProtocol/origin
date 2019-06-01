import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import UserActivationLink from '../../components/UserActivationLink'

class GetStarted extends Component {
  state = { open: false }
  render() {
    return (
      <ul className="navbar-nav">
        <li className="nav-item">
          <UserActivationLink {...this.props} className="nav-link px-3" />
        </li>
        <li className="nav-item d-none d-md-block">
          <Link
            to="/onboard"
            className="nav-link px-3"
            onClick={() =>
              sessionStore.set('getStartedRedirect', { pathname: '/create' })
            }
          >
            <fbt desc="navigation.getStarted.sellOnOrigin">Sell on Origin</fbt>
          </Link>
        </li>
      </ul>
    )
  }
}

export default withRouter(GetStarted)

require('react-styl')(`
`)
