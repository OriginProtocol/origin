import React from 'react'

const Nav = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <div className="container">
      <a className="navbar-brand" href="#">
        Origin
      </a>
      <button
        className="navbar-toggler"
        type="button"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
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
        </ul>
      </div>
    </div>
  </nav>
)

export default Nav

require('react-styl')(`
  .navbar.bg-dark
    background-color: var(--dusk) !important
  .navbar
    .nav-item
      font-family: Lato
      font-size: 14px
      font-weight: bold
      font-style: normal
      color: var(--pale-grey)
      margin-left: 1.5rem
  .navbar-brand
    background: url(images/origin-logo.svg) no-repeat center
    width: 90px
    text-indent: -9999px
`)
