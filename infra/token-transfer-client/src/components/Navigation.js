import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import { apiUrl } from '@/constants'
import agent from '@/utils/agent'
import NavLink from '@/components/NavLink'
import Logo from '@/assets/origin-logo.svg'
import Dashboard from '-!react-svg-loader!@/assets/dashboard-icon.svg'
import History from '-!react-svg-loader!@/assets/history-icon.svg'
import News from '-!react-svg-loader!@/assets/news-icon.svg'
import Security from '-!react-svg-loader!@/assets/security-icon.svg'

const Navigation = props => {
  const [redirectTo, setRedirectTo] = useState(null)

  const handleLogout = async () => {
    await agent.post(`${apiUrl}/api/logout`)
    setRedirectTo('/')
  }

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  return (
    <nav
      id="sidebar"
      className="navbar"
      style={{ height: props.expandSidebar ? '100vh' : '' }}
    >
      <div
        className={`nav-icon d-md-none ${
          props.expandSidebar ? 'nav-icon-open' : ''
        }`}
        onClick={props.onExpandSidebar}
      >
        <div></div>
      </div>
      <img src={Logo} className="brand my-3" />
      <div
        className={`mt-4 ml-3 ${
          props.expandSidebar ? '' : 'd-none d-md-block'
        }`}
      >
        <ul className="navbar-nav">
          <li className="nav-item mb-3">
            <NavLink to="/dashboard" exact className="nav-link text">
              <Dashboard className="icon" />
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item mb-3">
            <NavLink to="/news" className="nav-link text">
              <News className="icon" />
              News
            </NavLink>
          </li>
          <li className="nav-item mb-3">
            <NavLink to="/withdrawal" className="nav-link text">
              <History className="icon" />
              Withdrawal History
            </NavLink>
          </li>
          <li className="nav-item mb-3">
            <NavLink to="/security" className="nav-link text">
              <Security className="icon" />
              Security
            </NavLink>
          </li>
        </ul>
        <ul className="navbar-nav small-links mt-4 d-md-none">
          <li className="mt-4 mb-3">
            <a href="mailto:support@originprotocol.com">Contact Support</a>
          </li>
          <li>
            <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
              Logout
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
