import React from 'react'
import { NavLink } from 'react-router-dom'

import Logo from 'react-svg-loader!../../assets/origin-logo.svg'

const Navigation = props => {
  let shopUrl
  let dataDir
  if (props.shop && props.shop.dataUrl) {
    const parts = props.shop.dataUrl.split('/')
    shopUrl = parts.splice(0, parts.length - 1).join('/')
    dataDir = parts[parts.length - 1]
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
      <div className="brand mt-3 text-center">
        <Logo />
        <br />
        <p className="mt-2 mb-0">dShop Manage</p>
      </div>
      <div
        className={`mt-4 ml-3 mb-auto ${
          props.expandSidebar ? '' : 'd-none d-md-block'
        }`}
      >
        <ul className="navbar-nav mb-5">
          <li className="nav-item mb-3">
            <NavLink to="/manage/orders" className="nav-link text">
              Orders
            </NavLink>
          </li>
          <li className="nav-item mb-3">
            <NavLink to="/manage/discounts" className="nav-link text">
              Discounts
            </NavLink>
          </li>
          {shopUrl && (
            <li className="nav-item mb-3">
              <NavLink
                to={`/process/${encodeURIComponent(shopUrl)}/${dataDir}`}
                className="nav-link text"
              >
                Edit Store
              </NavLink>
            </li>
          )}
          <li className="nav-item mb-3">
            <NavLink to="/signin" className="nav-link text">
              Sign Out
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
