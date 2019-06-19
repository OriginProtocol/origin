import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Dropdown from 'components/Dropdown'
import Link from 'components/Link'
import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'

class MobileNav extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.EarnTokens = withEnrolmentModal('a')
  }

  render() {
    const { onClose } = this.props
    const hasUnread = ''
    /* react uses upper/lower case convention to distinguish between DOM tags
     * and user defined components. For that reason if the components starts with
     * lowercase 'this.Earn...' it will miss interpret its attributes as DOM attributes
     */
    const EarnTokens = this.EarnTokens

    return (
      <>
        <Dropdown
          className="nav-item mobile"
          open={this.props.open}
          onClose={() => this.props.onClose()}
          content={
            <>
              <div
                className="dropdown-menu-bg"
                onClick={() => this.props.onClose()}
              />
              <div className="dropdown-menu show">
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault()
                    this.props.onClose()
                  }}
                  className="dropdown-item close-dropdown"
                >
                  &nbsp;
                </a>
                <Link
                  onClick={() => onClose()}
                  to="/"
                  className="dropdown-item home"
                  children={fbt('Home', 'navigation.Home')}
                />
                <Link
                  onClick={() => onClose()}
                  to="/create"
                  className="dropdown-item add"
                  children={fbt('Add a Listing', 'navigation.AddaListing')}
                />
                <EarnTokens
                  className="dropdown-item earn"
                  onClose={() => onClose()}
                  onNavigation={() => onClose()}
                >
                  <fbt desc="navbar.earnTokens">Earn Origin Tokens</fbt>
                </EarnTokens>
                <div className="dropdown-divider" />
                <Link
                  onClick={() => onClose()}
                  to="/my-purchases"
                  className="dropdown-item purchases"
                  children={fbt('Purchases', 'navigation.purchases')}
                />
                <Link
                  onClick={() => onClose()}
                  to="/my-listings"
                  className="dropdown-item listings"
                  children={fbt('Listings', 'navigation.listings')}
                />
                <Link
                  onClick={() => onClose()}
                  to="/my-sales"
                  className="dropdown-item sales"
                  children={fbt('Sales', 'navigation.sales')}
                />
                <div className="dropdown-divider" />
                <Link
                  onClick={() => onClose()}
                  to="/messages"
                  className="dropdown-item messages"
                  children={fbt('Messages', 'navigation.messages')}
                />
                <Link
                  onClick={() => onClose()}
                  to="/notifications"
                  className="dropdown-item notifications"
                  children={fbt('Notifications', 'navigation.notifications')}
                />
                <Link
                  onClick={() => onClose()}
                  to="/settings"
                  className="dropdown-item settings"
                  children={fbt('Settings', 'navigation.settings')}
                />
              </div>
            </>
          }
        >
          <a
            className="nav-link"
            href="#"
            onClick={e => {
              e.preventDefault()
              this.props.open ? this.props.onClose() : this.props.onOpen()
            }}
          >
            <div className={`mobile-icon${hasUnread}`} />
          </a>
        </Dropdown>
      </>
    )
  }
}

export default MobileNav

require('react-styl')(`
  .navbar .nav-item.mobile
    .mobile-icon
      width: 30px
      height: 30px
      background: url(images/nav/menu-icon.svg) no-repeat center
      background-size: contain
      position:relative

    .dropdown-menu
      background-color: var(--white)
      padding: 11px 0 1rem 0
      top: 0
      .dropdown-divider
        margin: 0.5rem 1.5rem
        border-color: #dde6ea
      .dropdown-header
        text-transform: uppercase
        color: var(--dusk)
      .dropdown-item
        color: #000
        font-size: 18px
        font-weight: bold
        position: relative
        line-height: normal
        padding: 0.5rem 1.5rem 0.5rem 3.75rem
        overflow: hidden
        text-overflow: ellipsis
        &::before
          position: absolute
          left: 1.25rem
          content: ""
          width: 2rem
          top: 0
          bottom: 0
          background-repeat: no-repeat
          background-position: center left
          background-size: 22px
        &.close-dropdown::before
          background-image: url(images/nav/close-icon.svg)
          background-size: 26px
          left: 18px
        &.home::before
          background-image: url(images/nav/home-icon.svg)
        &.add::before
          background-image: url(images/nav/add-listing-icon.svg)
        &.earn::before
          background-image: url(images/nav/ogn-icon.svg)
        &.purchases::before
          background-image: url(images/nav/purchases-icon.svg)
        &.listings::before
          background-image: url(images/nav/listings-icon.svg)
        &.sales::before
          background-image: url(images/nav/sales-icon.svg)
        &.messages::before
          background-image: url(images/nav/chatbubble-icon.svg)
        &.notifications::before
          background-image: url(images/nav/alerts-icon.svg)
        &.settings::before
          background-image: url(images/nav/gear-icon.svg)

`)
