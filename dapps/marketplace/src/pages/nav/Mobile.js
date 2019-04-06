import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Dropdown from 'components/Dropdown'
import Link from 'components/Link'

class MobileNav extends Component {
  render() {
    const { onClose } = this.props
    const hasUnread = ''
    return (
      <Dropdown
        className="nav-item mobile d-flex d-md-none"
        open={this.props.open}
        onClose={() => this.props.onClose()}
        content={
          <div className="dropdown-menu show">
            <Link
              onClick={() => onClose()}
              to="/"
              className="dropdown-item browse"
              children={fbt('Browse Categories', 'navigation.BrowseCategories')}
            />
            <Link
              onClick={() => onClose()}
              to="/create"
              className="dropdown-item add"
              children={fbt('Add a Listing', 'navigation.AddaListing')}
            />
            <div className="dropdown-divider" />
            <h6 className="dropdown-header">My Items</h6>
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
              to="/about/dapp-info"
              className="dropdown-item dapp-info"
              children={fbt('DApp Info', 'DApp Info')}
            />
            {/* <a href="#" className="dropdown-item transactions">
              Transactions
            </a> */}
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
        >
          <div className={`mobile-icon${hasUnread}`} />
        </a>
      </Dropdown>
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
    &.show
      background-color: var(--pale-grey)
      .mobile-icon
        background-image: url(images/nav/menu-icon-active.svg)

    .dropdown-menu
      background-color: var(--pale-grey)
      padding: 1rem 0
      border-radius: 0 5px 5px 5px
      &::before
        content: "◣"
        right: auto
        left: 0
        clip-path: polygon(-50% -50%, 150% 150%, 100% 150%, 100% 100%, -10% 100%)
        color: var(--pale-grey)
      .dropdown-divider
        margin: 0.5rem 1.5rem
        border-color: var(--light)
      .dropdown-header
        text-transform: uppercase
        color: var(--dusk)
      .dropdown-item
        color: #000
        font-size: 20px
        font-weight: bold
        position: relative
        line-height: normal
        padding: 0.75rem 3rem 0.75rem 3.75rem
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
        &.browse::before
          background-image: url(images/nav/categories-icon.svg)
          background-size: 26px
        &.add::before
          background-image: url(images/nav/add-listing-icon.svg)
        &.purchases::before
          background-image: url(images/nav/purchases-icon.svg)
        &.listings::before
          background-image: url(images/nav/listings-icon.svg)
        &.sales::before
          background-image: url(images/nav/sales-icon.svg)
        &.messages::before
          background-image: url(images/messages-icon-selected.svg)
        &.notifications::before
          background-image: url(images/alerts-icon-selected.svg)
        &.transactions::before
          background-image: url(images/nav/arrows-dark.svg)
        &::after
          position: absolute
          right: 1.75rem
          top: 1.125rem
          content: ""
          border-top: 2px solid var(--bluey-grey)
          border-right: 2px solid var(--bluey-grey)
          width: 10px
          height: 10px
          transform: rotate(45deg)

  @media (max-width: 767.98px)
    .navbar .nav-item.mobile .dropdown-menu
      &::before
        content: none
      box-shadow: none
      margin-top: 0
      border-radius: 0
      left: 0
      right: 0
`)
