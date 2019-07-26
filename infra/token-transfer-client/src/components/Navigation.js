import React from 'react'

import NavLink from './NavLink'
import Logo from '../assets/0-rigin-logo@3x.png'
import Dashboard from '../assets/dashboard-icon@3x.png'
import History from '../assets/history-icon@3x.png'
import News from '../assets/news-icon@3x.png'
import Security from '../assets/security-icon@3x.png'

const Navigation = () => (
  <nav className="navbar navbar-expand-xs">
    <img src={Logo} className="brand" />
    <div className="container">
      <ul className="navbar-nav ml-3">
        <li className="nav-item">
          <NavLink to="/" className="nav-link text">
            <img src={Dashboard} className="icon" />
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/news" className="nav-link text">
            <img src={News} className="icon" />
            News
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/history" className="nav-link text">
            <img src={History} className="icon" />
            History
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/security" className="nav-link text">
            <img src={Security} className="icon" />
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
      margin: 30px auto
      width: 100px
    .nav-item
      font-size: 16px
      margin-bottom: 20px
      a
        color: white
        .icon
          width: 28px
          margin-right: 15px
`)
