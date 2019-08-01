import React from 'react'

import NavLink from './NavLink'
import Logo from '../assets/origin-logo.svg'
import Dashboard from '-!react-svg-loader!../assets/dashboard-icon.svg'
import History from '-!react-svg-loader!../assets/history-icon.svg'
import News from '-!react-svg-loader!../assets/news-icon.svg'
import Security from '-!react-svg-loader!../assets/security-icon.svg'

const Navigation = () => (
  <nav className="navbar navbar-expand-xs">
    <img src={Logo} className="brand" />
    <div className="container">
      <ul className="navbar-nav">
        <li className="nav-item">
          <NavLink to="/dashboard" exact className="nav-link text">
            <Dashboard className="icon" />
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/news" className="nav-link text">
            <News className="icon" />
            News
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/history" className="nav-link text">
            <History className="icon" />
            Withdrawal History
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/security" className="nav-link text">
            <Security className="icon" />
            Security
          </NavLink>
        </li>
      </ul>
    </div>
  </nav>
)

export default Navigation

require('react-styl')(`
  .navbar
    height: 100%
    align-items: start
    flex-direction: column
    justify-content: start
    background-color: #007cff
    font-family: lato
    .brand
      margin: 30px auto 50px auto
      width: 100px
    .nav-item
      font-size: 16px
      margin-bottom: 20px
      a.nav-link
        color: rgba(255, 255, 255, 0.5)
        .icon
          width: 28px
          margin-right: 15px
          fill-opacity: 0.5
      a.nav-link.active
        color: rgba(255, 255, 255, 1)
        .icon
          fill-opacity: 1
`)
