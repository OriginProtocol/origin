import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import NavbarBS from 'react-bootstrap/Navbar'

import ConnectivityDropdown from 'components/dropdowns/connectivity'
import MessagesDropdown from 'components/dropdowns/messages'
import NotificationsDropdown from 'components/dropdowns/notifications'
import TransactionsDropdown from 'components/dropdowns/transactions'
import UserDropdown from 'components/dropdowns/user'
import NavigationDropdown from 'components/dropdowns/navigation'
import Dropdown from 'components/dropdown'

class NavBar extends Component {
  constructor() {
    super()
    this.state = {}
  }

  renderMenuNavigation() {
    const {
      sellDropdown
    } = this.state

    return(
      <NavbarBS.Collapse
        id="navbarSupportedContent"
        className="order-2 order-lg-1"
      >
        <div className="navbar-nav justify-content-end">
          <Link
            to="/"
            className="d-lg-none nav-item nav-link"
            ga-category="top_nav"
            ga-label="listings"
          >
            <FormattedMessage
              id={'navbar.listings'}
              defaultMessage={'Listings'}
            />
          </Link>
          <Link
            to="/my-purchases"
            className="nav-item nav-link"
            ga-category="top_nav"
            ga-label="buying"
          >
            <FormattedMessage
              id={'navbar.buying'}
              defaultMessage={'Buying'}
            />
          </Link>
          <Dropdown
            className="sell"
            open={sellDropdown}
            onClose={() => this.setState({ sellDropdown: false })}
          >
            <a
              className="dropdown-toggle nav-item nav-link"
              id="sellDropdown"
              onClick={() => this.setState({ sellDropdown: true })}
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
              ga-category="top_nav"
              ga-label="sell_dropdown"
            >
              <FormattedMessage
                id={'navbar.selling'}
                defaultMessage={'Selling'}
              />
            </a>
            <div
              className={`dropdown-menu dropdown-menu-right${
                sellDropdown ? ' show' : ''
              }`}
              aria-labelledby="sellDropdown"
            >
              <div className="triangle-container d-none d-lg-flex justify-content-end">
                <div className="triangle" />
              </div>
              <div className="actual-menu">
                <Link
                  to="/my-listings"
                  className="dropdown-item"
                  ga-category="top_nav"
                  ga-label="sell_dropdown_my_listings"
                >
                  <FormattedMessage
                    id={'navbar.myListings'}
                    defaultMessage={'My Listings'}
                  />
                </Link>
                <Link
                  to="/my-sales"
                  className="dropdown-item"
                  ga-category="top_nav"
                  ga-label="sell_dropdown_my_sales"
                >
                  <FormattedMessage
                    id={'navbar.mySales'}
                    defaultMessage={'My Sales'}
                  />
                </Link>
                <Link
                  to="/create"
                  className="dropdown-item d-none d-lg-block"
                  ga-category="top_nav"
                  ga-label="sell_dropdown_add_listing"
                >
                  <FormattedMessage
                    id={'navbar.addListing'}
                    defaultMessage={'Add a Listing'}
                  />
                </Link>
              </div>
            </div>
          </Dropdown>
          <Link
            to="/create"
            className="nav-item nav-link"
            ga-category="top_nav"
            ga-label="add_listing"
          >
            <img
              src="images/add-listing-icon.svg"
              alt="Add Listing"
              className="add-listing"
            />
            <FormattedMessage
              id={'navbar.addListing'}
              defaultMessage={'Add a Listing'}
            />
          </Link>
        </div>
      </NavbarBS.Collapse>
    )
  }

  renderOriginBrand() {
    const {
      isWhiteLabel,
      logoUrl
    } = this.props
    return(
      <Link
        to="/"
        className="d-block navbar-brand mr-lg-3"
        ga-category="top_nav"
        ga-label="logo"
      >
        <div className="logo-container">
          {!isWhiteLabel &&
            <img
              src="images/origin-logo.svg"
              className="origin-logo"
              alt="Origin Protocol"
            />
          }
          {isWhiteLabel && logoUrl &&
            <img
              src={logoUrl}
              className="origin-logo"
              alt="Origin Protocol"
            />
          }
        </div>
      </Link>
    )
  }

  render() {
    const {
      mobileDevice,
      showNav
    } = this.props

    return (
      showNav && (
        <NavbarBS variant="dark" expand="lg" className="navigation-bar">
          <div className="container d-flex justify-content-between">
            {this.renderMenuNavigation()}
            <NavigationDropdown />
            {this.renderOriginBrand()}
            <div className="d-none d-lg-flex static navbar-nav order-1 order-lg-2 flex-row justify-content-end">
              {!mobileDevice && <ConnectivityDropdown />}
              <TransactionsDropdown />
              <MessagesDropdown />
              <NotificationsDropdown />
              <UserDropdown />
            </div>
            <div className="d-flex d-lg-none">
              <UserDropdown />
            </div>
          </div>
        </NavbarBS>
      )
    )
  }
}

const mapStateToProps = ({ app, config }) => {
  return {
    isWhiteLabel: config.isWhiteLabel,
    logoUrl: config.logoUrl,
    mobileDevice: app.mobileDevice,
    showNav: app.showNav
  }
}

export default connect(mapStateToProps)(NavBar)
