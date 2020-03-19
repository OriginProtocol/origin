import React from 'react'
import { NavLink } from 'react-router-dom'

import Logo from 'react-svg-loader!../assets/origin-logo.svg'

const Navigation = props => {
  const { dataURL, authenticated } = props

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
          {dataURL && (
            <li className="nav-item mb-3">
              <NavLink
                to={`/process-config/${encodeURIComponent(dataURL)}`}
                className="nav-link text"
              >
                Edit Store
              </NavLink>
            </li>
          )}

          <li className="nav-item mb-3">
            <NavLink to="/edit/products" className="nav-link text">
              Products
            </NavLink>
          </li>
          <li className="nav-item mb-3">
            <NavLink to="/edit/collections" className="nav-link text">
              Collections
            </NavLink>
          </li>
          <li className="nav-item mb-3">
            <NavLink to="/edit/settings" className="nav-link text">
              Settings
            </NavLink>
          </li>

          {/* ------ start sep ------ */}

          <li className="nav-item mb-3">
            <div className="sep" />
          </li>

          {/* ------ end sep ------ */}

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

          <li className="nav-item mb-3">
            {authenticated ? (
              <NavLink to="/signout" className="nav-link text">
                Sign Out
              </NavLink>
            ) : (
              <NavLink to="/signin" className="nav-link text">
                Sign In
              </NavLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
