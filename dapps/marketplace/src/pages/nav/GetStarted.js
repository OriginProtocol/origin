import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { fbt } from 'fbt-runtime'
import store from 'utils/store'
const sessionStore = store('sessionStorage')

import Link from 'components/Link'

class GetStarted extends Component {
  state = { open: false }
  render() {
    return (
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link
            to="/onboard"
            className="nav-link px-3"
            onClick={() => {
              const { pathname, search } = this.props.location
              sessionStore.set('getStartedRedirect', { pathname, search })
            }}
          >
            <fbt desc="navigation.getStarted.getStarted">Get Started</fbt>
          </Link>
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
