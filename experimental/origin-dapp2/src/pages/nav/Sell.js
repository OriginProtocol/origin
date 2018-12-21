import React, { Component } from 'react'

import Dropdown from 'components/Dropdown'
import Link from 'components/Link'

class SellNav extends Component {
  render() {
    return (
      <Dropdown
        el="li"
        className="nav-item sell"
        open={this.props.open}
        onClose={() => this.props.onClose()}
        content={
          <div className="dropdown-menu dropdown-menu-right show">
            <Link
              onClick={() => this.props.onClose()}
              className="dropdown-item"
              to="/my-listings"
            >
              My Listings
            </Link>
            <Link
              onClick={() => this.props.onClose()}
              className="dropdown-item"
              to="/my-sales"
            >
              My Sales
            </Link>
            <Link
              onClick={() => this.props.onClose()}
              className="dropdown-item"
              to="/add-listing"
            >
              Add a Listing
            </Link>
          </div>
        }
      >
        <a
          className="nav-link"
          href="#"
          onClick={e => {
            e.preventDefault()
            this.props.open ? this.props.onClose() : this.props.onOpen()
          }}
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Sell
        </a>
      </Dropdown>
    )
  }
}

export default SellNav

require('react-styl')(`
  .nav-item.sell
    .dropdown-menu .dropdown-item
      border-bottom: 1px solid var(--pale-grey-two)
      padding: 0.75rem 1rem
      font-weight: bold
      &:first-child
        border-radius: 5px 5px 0 0
      &:last-child
        border-bottom: 0
        border-radius: 0 0 5px 5px
`)
