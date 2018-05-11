import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import ConnectivityDropdown from 'components/dropdowns/connectivity'
import NotificationsDropdown from 'components/dropdowns/notifications'
import UserDropdown from 'components/dropdowns/user'

class NavBar extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.state = { searchQuery: '' }
  }

  handleChange(e) {
    this.setState({ searchQuery: e.target.value })
  }

  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container">
          <button className="navbar-toggler mr-3" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <img src="/images/menu-icon-light.svg" alt="Menu" />
          </button>
          <Link to="/" className="navbar-brand mr-auto mr-lg-3">
            <div className="logo-container">
              <img src="/images/origin-logo.svg" className="origin-logo" alt="Origin Protocol" />
            </div>
          </Link>
          <div className="collapse navbar-collapse order-2 order-lg-1" id="navbarSupportedContent">
            <form className="form-inline my-2 my-lg-0">
              <input className="form-control mr-sm-2" type="search" placeholder="Search Listings" aria-label="Search" onChange={this.handleChange} value={this.state.searchQuery} />
            </form>
            <div className="navbar-nav justify-content-end">
              <Link to="/my-purchases" className="nav-item nav-link">Buy</Link>
              <div className="sell dropdown">
                <a className="dropdown-toggle nav-item nav-link" id="sellDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Sell</a>
                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="sellDropdown">
                  <div className="triangle-container d-none d-lg-flex justify-content-end"><div className="triangle"></div></div>
                  <div className="actual-menu">
                    <Link to="/my-listings" className="dropdown-item">My Listings</Link>
                    <Link to="/my-sales" className="dropdown-item">My Sales</Link>
                    <Link to="/create" className="dropdown-item d-none d-lg-block">Add a Listing</Link>
                  </div>
                </div>
              </div>
              <Link to="/create" className="nav-item nav-link"><img src="/images/add-listing-icon.svg" alt="Add Listing" className="add-listing" />Add Listing</Link>
            </div>
          </div>
          <div className="static navbar-nav order-1 order-lg-2">
            <ConnectivityDropdown />
            <NotificationsDropdown />
            <UserDropdown />
          </div>
        </div>
      </nav>
    )
  }
}

export default NavBar
