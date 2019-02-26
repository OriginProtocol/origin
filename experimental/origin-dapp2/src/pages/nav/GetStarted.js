import React, { Component } from 'react'

import MobileLinkerCode from 'components/MobileLinkerCode'

class GetStarted extends Component {
  state = { open: false }
  render() {
    return (
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <a className="nav-link" href="#" onClick={() => this.setState({ open: true })}>
            Get Started
          </a>
          {!this.state.open ? null : <MobileLinkerCode />}
        </li>
      </ul>
    )
  }
}

export default GetStarted

require('react-styl')(`
`)
