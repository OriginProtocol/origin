import React from 'react'

import NavLink from '@/components/NavLink'
import Logo from '@/assets/origin-logo.svg'
import Dashboard from '-!react-svg-loader!@/assets/dashboard-icon.svg'
import History from '-!react-svg-loader!@/assets/history-icon.svg'
import News from '-!react-svg-loader!@/assets/news-icon.svg'
import Security from '-!react-svg-loader!@/assets/security-icon.svg'

const Navigation = props => {
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
      <img src={Logo} className="brand my-2" />
      <div
        className={`container mt-5 ${
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
      </div>
    </nav>
  )
}

export default Navigation

require('react-styl')(`
  .navbar
    flex-direction: column
    justify-content: start
    background-color: #007cff
    font-family: lato
    .nav-icon
      background: white
      border-radius: 50%
      margin: 0.75em
      height: 30px
      width: 30px
      position: absolute
      top: 0
      left: 0
      padding: 6px 5px
    .nav-icon:after,
    .nav-icon:before,
    .nav-icon div
      background-color: #007cff
      border-radius: 3px
      content: ''
      display: block
      height: 2px
      margin: 3px 0
      transition: all .2s ease-in-out
    .nav-icon-open:before
      transform: translateY(5px) rotate(135deg)
    .nav-icon-open:after
      transform: translateY(-5px) rotate(-135deg)
    .nav-icon-open div
      transform: scale(0)
    .nav-item
      font-size: 16px
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
