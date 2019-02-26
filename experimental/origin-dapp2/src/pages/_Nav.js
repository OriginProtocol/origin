import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'
import withCreatorConfig from 'hoc/withCreatorConfig'

import Link from 'components/Link'
import NavLink from 'components/NavLink'
import Profile from './nav/Profile'
import Notifications from './nav/Notifications'
import Messages from './nav/Messages'
import Confirmations from './nav/Confirmations'
import Mobile from './nav/Mobile'
import Sell from './nav/Sell'
import GetStarted from './nav/GetStarted'

class Nav extends Component {
  state = {}

  render() {
    const navProps = nav => ({
      onOpen: () => this.setState({ open: nav }),
      onClose: () => this.setState({ open: false }),
      open: this.state.open === nav
    })

    return (
      <nav className="navbar navbar-expand-md">
        <div className="container">
          <Mobile {...navProps('mobile')} />
          {!this.props.creatorConfig.logoUrl ? (
            <Link to="/" className="navbar-brand">
              Origin
            </Link>
          ) : (
            <Link to="/" className="custom-brand">
              <img
                src={this.props.creatorConfig.logoUrl}
                alt={this.props.creatorConfig.title}
              />
            </Link>
          )}
          {!this.props.wallet ? (
            <GetStarted />
          ) : (
            <>
              <ul className="navbar-nav">
                <li className="nav-item d-none d-md-flex">
                  <NavLink to="/my-purchases" className="nav-link text">
                    <span>
                      <fbt desc="navbar.buying">Buy</fbt>
                    </span>
                  </NavLink>
                </li>
                <Sell {...navProps('sell')} />
                <li className="nav-item d-none d-md-flex">
                  <NavLink to="/create" className="nav-link add-listing text">
                    <span>
                      <fbt desc="navbar.addListing">Add Listing</fbt>
                    </span>
                  </NavLink>
                </li>
                <Confirmations {...navProps('confirmations')} />
                <Messages {...navProps('messages')} />
                <Notifications {...navProps('notifications')} />
                <Profile {...navProps('profile')} />
              </ul>
            </>
          )}
        </div>
      </nav>
    )
  }
}

export default withWallet(withCreatorConfig(Nav))

require('react-styl')(`
  .navbar
    padding: 0 1rem
    background-color: var(--dusk) !important
    > .container
      align-items: stretch

    .nav-item
      display: flex
      align-items: center
      min-height: 3.75rem
      font-size: 14px
      font-weight: bold
      font-style: normal
      color: var(--pale-grey)
      &.show
        background-color: var(--white)
        .nav-link
          color: var(--dark)
      &.dark
        &.show
          background-color: var(--dark)
      .nav-link
        padding: 0 0.75rem
        color: var(--pale-grey)
        height: 100%
        display: flex
        align-items: center
        &.text
          background-color: initial
          padding: 0 0.5rem
          span
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            &:hover,&.active
              background-color: var(--dark-grey-blue)
          &.active span
            background-color: var(--dark-grey-blue)
        &.add-listing span
          display: inline-block
          padding-left: 2rem
          background: url(images/add-listing-icon.svg) no-repeat 0.5rem center
          background-size: 1rem

      .dropdown-menu
        padding: 0
        position: absolute !important
        margin-top: 1rem
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
        border-radius: var(--default-radius) 0 5px 5px
        border: 0
        font-weight: normal
        border-radius: var(--default-radius) 0 5px 5px

        &::before
          width: 1rem
          height: 1rem
          color: var(--white)
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          clip-path: polygon(150% -50%, 150% 150%, 100% 150%, 100% 100%, -10% 100%)
          font-size: 1rem
          line-height: 1rem
          content: "◢"
          position: absolute
          top: -1rem
          right: 0

        &.dark
          color: var(--white)
          background-color: var(--dark)
          border: 0
          box-shadow: none
          &::before
            color: var(--dark)
            text-shadow: none

  .navbar-brand
    background: url(images/origin-logo.svg) no-repeat center
    width: 90px
    text-indent: -9999px

  .custom-brand
    padding-top: 0.4125rem;
    padding-bottom: 0.4125rem;
    img
      max-height: 2.8rem

  @media (pointer: fine)
    .navbar .nav-item
      &.show .nav-link:hover
        background-color: initial
        &.text span
          background-color: initial
      .nav-link:hover
        background-color: var(--dark-grey-blue)
        &.text span
          background-color: var(--dark-grey-blue)

  @media (max-width: 767.98px)
    .navbar
      padding: 0
      .nav-item
        position: initial
        .dropdown-menu
          left: 1rem
          right: 1rem
`)
