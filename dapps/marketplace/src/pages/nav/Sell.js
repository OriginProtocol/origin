import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Dropdown from 'components/Dropdown'
import Link from 'components/Link'

class SellNav extends Component {
  render() {
    return (
      <Dropdown
        el="li"
        className="nav-item sell d-none d-md-flex"
        open={this.props.open}
        onClose={() => this.props.onClose()}
        content={
          <div className="dropdown-menu dropdown-menu-right show">
            <Link
              onClick={() => this.props.onClose()}
              className="dropdown-item"
              to="/my-listings"
            >
              <fbt desc="navbar.myListings">My Listings</fbt>
            </Link>
            <Link
              onClick={() => this.props.onClose()}
              className="dropdown-item"
              to="/my-sales"
            >
              <fbt desc="navbar.mySales">My Sales</fbt>
            </Link>
            <Link
              onClick={() => this.props.onClose()}
              className="dropdown-item"
              to="/create"
            >
              <fbt desc="navbar.addListing">Add a Listing</fbt>
            </Link>
          </div>
        }
      >
        <a
          className="nav-link text"
          href="#"
          onClick={e => {
            e.preventDefault()
            this.props.open ? this.props.onClose() : this.props.onOpen()
          }}
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span className="padding-center">
            <fbt desc="navbar.selling">Sell</fbt>
          </span>
        </a>
      </Dropdown>
    )
  }
}

export default SellNav

require('react-styl')(`
  .nav-item.sell
    &.show
      .nav-link.text:hover
        background-color: #fff
    .dropdown-menu .dropdown-item
      border-bottom: 1px solid var(--pale-grey-two)
      padding: 0.75rem 1rem
      font-weight: bold
      &:first-child
        border-radius: var(--default-radius) 5px 0 0
      &:last-child
        border-bottom: 0
        border-radius: 0 0 5px 5px
`)
