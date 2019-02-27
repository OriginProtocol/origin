import React, { Component } from 'react'
import { nav } from '@blueprintjs/core'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import { setSessionEmail } from '../actions'

class NavBar extends Component {
  handleLogout = () => {
    fetch('/api/logout', { method: 'POST', cache: 'no-store' })
      .then(() => this.props.setSessionEmail(null) )
  }

  render() {
    const { sessionEmail, history } = this.props
    return (
      <nav className="bp3-navbar bp3-dark">
        <div className="bp3-navbar-group bp3-align-left">
          <div className="bp3-navbar-heading">
            <img src="/origin-logo@2x.png" alt="Origin Logo" width="66" height="16" />
            {' '}
            <span className="bp3-text-large">Token Transfer Tool</span>
          </div>

          <button className="bp3-button bp3-minimal bp3-icon-dollar" onClick={() => history.push('/grants')}>Token Grants</button>
          <button className="bp3-button bp3-minimal bp3-icon-timeline-events" onClick={() => history.push('/events')}>Event log</button>
        </div>
        <div className="bp3-navbar-group bp3-align-right">
          <div className="bp3-navbar-heading">
            {sessionEmail}
            {' '}{/* eslint-disable-next-line */}
            (<a href="#" onClick={this.handleLogout}>logout</a>)
          </div>
        </div>
      </nav>
    )
  }
}

const mapStateToProps = state => {
  return {
    sessionEmail: state.sessionEmail
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setSessionEmail: email => dispatch(setSessionEmail(email))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NavBar))
