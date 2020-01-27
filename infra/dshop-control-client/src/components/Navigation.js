import React from 'react'
import { NavLink } from 'react-router-dom'

import Logo from 'react-svg-loader!../assets/origin-logo.svg'

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
      <div className="brand mt-3 text-center">
        <Logo />
        <br />
        <p className="mt-2 mb-0">dShop</p>
      </div>
      <div
        className={`mt-4 ml-3 mb-auto ${
          props.expandSidebar ? '' : 'd-none d-md-block'
        }`}
      >
        <ul className="navbar-nav">
          <li className="nav-item mb-3">
            <NavLink to="/dashboard/products" className="nav-link text">
              Products
            </NavLink>
          </li>
          <li className="nav-item mb-3">
            <NavLink to="/dashboard/collections" className="nav-link text">
              Collections
            </NavLink>
          </li>
          <li className="nav-item mb-3">
            <NavLink to="/dashboard/settings" className="nav-link text">
              Settings
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
