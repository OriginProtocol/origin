import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'
import withCreatorConfig from 'hoc/withCreatorConfig'

import Link from 'components/Link'
import NavLink from 'components/NavLink'
import Profile from './nav/Profile'
import Notifications from './nav/Notifications'
import Messages from './nav/Messages'
import Mobile from './nav/Mobile'
import GetStarted from './nav/GetStarted'
import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'

class Nav extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.EarnTokens = withEnrolmentModal('a')
  }

  render() {
    const navProps = nav => ({
      onOpen: () => this.setState({ open: nav }),
      onClose: () => this.setState({ open: false }),
      open: this.state.open === nav
    })

    /* react uses upper/lower case convention to distinguish between DOM tags
     * and user defined components. For that reason if the components starts with
     * lowercase 'this.Earn...' it will miss interpret its attributes as DOM attributes
     */
    const EarnTokens = this.EarnTokens

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
                      <fbt desc="navbar.purchases">Purchases</fbt>
                    </span>
                  </NavLink>
                </li>
                <li className="nav-item d-none d-md-flex">
                  <NavLink to="/my-listings" className="nav-link text">
                    <span>
                      <fbt desc="navbar.listings">Listings</fbt>
                    </span>
                  </NavLink>
                </li>
                <li className="nav-item d-none d-md-flex">
                  <NavLink to="/my-sales" className="nav-link text">
                    <span>
                      <fbt desc="navbar.sales">Sales</fbt>
                    </span>
                  </NavLink>
                </li>
                <li className="nav-item d-none d-lg-flex">
                  <NavLink to="/create" className="nav-link text">
                    <span>
                      <fbt desc="navbar.addListing">Add Listing</fbt>
                    </span>
                  </NavLink>
                </li>
                <li className="nav-item d-none d-lg-flex">
                  <EarnTokens className="nav-link text" href="#">
                    <span className="d-md-none d-xl-flex">
                      <fbt desc="navbar.earnTokens">Earn Tokens</fbt>
                    </span>
                    <span className="d-xl-none">
                      <fbt desc="navbar.tokens">Tokens</fbt>
                    </span>
                  </EarnTokens>
                </li>
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
    border-bottom: 1px solid rgba(0, 0, 0, 0.1)
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
      button
        border: 0px
      .nav-link
        padding: 0 0.75rem
        color: var(--dusk)
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
              background-color: rgba(0,0,0,0.1)
          &.active span
            background-color: rgba(0,0,0,0.1)
        &.icon-padding span
          padding-left: 2rem
        span
          display: inline-block

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
    background: url(images/origin-logo-black.svg) no-repeat center
    background-size: 100%
    width: 108px
    text-indent: -9999px

  .custom-brand
    padding-top: 0.4125rem;
    padding-bottom: 0.4125rem;
    img
      max-height: 2.8rem

  @media (pointer: fine)
    .navbar .nav-item
      &.show .nav-link:hover
        background-color: rgba(0,0,0,0.1)
        &.text
          background-color: var(--white)
          span
            background-color: rgba(0,0,0,0.1)
      .nav-link:hover
        background-color: rgba(0,0,0,0.1)
        &.text
          background-color: var(--white)
          span
            background-color: rgba(0,0,0,0.1)

  @media (max-width: 767.98px)
    .navbar
      padding: 0
      .nav-item
        position: initial
        .dropdown-menu
          left: 1rem
          right: 1rem
`)
