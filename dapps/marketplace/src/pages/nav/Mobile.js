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
          className="nav-item mobile d-flex d-md-none"
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
      width: 2.2rem
      height: 1.6rem
      background: url(images/nav/menu-icon.svg) no-repeat center
      background-size: contain
      position:relative
    &.show2
      background-color: var(--pale-grey)
      .mobile-icon
        background-image: url(images/nav/menu-icon-active.svg)

    .dropdown-menu
      background-color: var(--white)
      padding: 11px 0 1rem 0
      border-radius: 0 5px 5px 5px
      top: 0
      &::before
        content: "◣"
        right: auto
        left: 0
        clip-path: polygon(-50% -50%, 150% 150%, 100% 150%, 100% 100%, -10% 100%)
        color: var(--pale-grey)
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
          left: 17px
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

  @media (max-width: 767.98px)
    .navbar .nav-item.mobile .dropdown-menu-bg
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(0,0,0,0.3);
      clip-path: none;
      width: auto;
      height: auto;
      z-index: 1;
    .navbar .nav-item.mobile .dropdown-menu
      &::before
        content: ""
      overflow: auto
      position: fixed !important
      box-shadow: none
      margin-top: 0
      border-radius: 0
      left: 0
      right: auto
      bottom: 0
      top: 0
`)
