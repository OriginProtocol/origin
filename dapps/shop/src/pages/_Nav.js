import React from 'react'

import { useStateValue } from 'data/state'
import Link from 'components/Link'
import CartIcon from 'components/icons/Cart'
import Search from './_Search'

const Nav = () => {
  const [{ cart }] = useStateValue()

  return (
    <nav className="navbar navbar-expand-md">
      <div className="container">
        <form className="form-inline" onSubmit={e => e.preventDefault()}>
          <Search />
        </form>
        <button className="navbar-toggler">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to="/cart" className="nav-link">
                <CartIcon />
                {`Cart${cart.items.length ? ` (${cart.items.length})` : ''}`}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to={cart.items.length ? '/checkout' : '/cart'}
              >
                Check Out
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Nav

require('react-styl')(`
  .navbar
    border-top: 5px solid black
  .navbar > .container
    position: relative
    &::after
      content: ""
      border-bottom: 1px solid #eee
      position: absolute
      left: 1rem
      right: 1rem
      bottom: -0.5rem
    .nav-link
      display: flex
      svg
        width: 1.25rem
        margin-right: 0.5rem

`)
