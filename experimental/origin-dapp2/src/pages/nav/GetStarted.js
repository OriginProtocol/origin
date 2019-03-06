import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
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
            className="nav-link"
            onClick={() => {
              const { pathname, search } = this.props.location
              sessionStore.set('getStartedRedirect', { pathname, search })
            }}
          >
            Get Started
          </Link>
        </li>
      </ul>
    )
  }
}

export default withRouter(GetStarted)

require('react-styl')(`
`)
