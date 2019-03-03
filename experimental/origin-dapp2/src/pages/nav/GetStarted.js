import React, { Component } from 'react'

import Link from 'components/Link'

class GetStarted extends Component {
  state = { open: false }
  render() {
    return (
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/onboard" className="nav-link">Get Started</Link>
        </li>
      </ul>
    )
  }
}

export default GetStarted

require('react-styl')(`
`)
