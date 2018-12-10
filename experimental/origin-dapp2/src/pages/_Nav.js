import React from 'react'

import Profile from './nav/Profile'
import Notifications from './nav/Notifications'

const Nav = () => (
  <nav className="navbar navbar-expand-lg">
    <div className="container">
      <a className="navbar-brand" href="#">
        Origin
      </a>
      <button
        className="navbar-toggler"
        type="button"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item active">
            <a className="nav-link" href="#">
              Get Started
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">
              Sell on Origin
            </a>
          </li>
          <Notifications />
          <Profile />
        </ul>
      </div>
    </div>
  </nav>
)

export default Nav

require('react-styl')(`
  .navbar
    padding: 0 1rem
    background-color: var(--dusk) !important
    .nav-item
      display: flex
      align-items: center
      min-height: 3.75rem
      font-family: Lato
      font-size: 14px
      font-weight: bold
      font-style: normal
      color: var(--pale-grey)
      &.show
        background-color: var(--white)
      &.dark
        &.show
          background-color: var(--dark)
      .nav-link
        padding: 0 0.75rem
        color: var(--pale-grey)

      .dropdown-menu
        margin-top: 1rem
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
        border-radius: 5px 0 5px 5px
        border: 0
        font-weight: normal
        border-radius: 5px 0 5px 5px

        &::before
          width: 1rem
          height: 1rem
          color: var(--white)
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          clip-path: polygon(150% -50%, 150% 150%, 100% 150%, 100% 100%, -10% 100%)
          font-size: 1rem
          line-height: 1rem
          content: "◢"
          position: absolute
          top: -1rem
          right: 0

        &.dark
          color: var(--white)
          background-color: var(--dark)
          border: 0
          &::before
            color: var(--dark)


  .navbar-brand
    background: url(images/origin-logo.svg) no-repeat center
    width: 90px
    text-indent: -9999px
`)
