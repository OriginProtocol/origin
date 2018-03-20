import React from 'react'
import { Link } from 'react-router-dom'

const NavBar = (props) => {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/">
          <div className="logo-container">
            <img src="/images/origin-logo.png"
              srcSet="/images/origin-logo@2x.png 2x, /images/origin-logo@3x.png 3x"
              className="origin-logo" alt="Origin Protocol" />
          </div>
        </Link>
        {!props.hideCreateLink &&
          <div className="navbar-create">
            <Link to="/create">
              Create Listing
            </Link>
          </div>
        }
        {!props.hideProfileLink &&
          <div className="navbar-create">
            <Link to="/profile">
              Profile
            </Link>
          </div>
        }
      </div>
    </nav>
  )
}

export default NavBar
