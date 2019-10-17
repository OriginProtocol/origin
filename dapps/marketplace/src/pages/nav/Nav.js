import React, { useState, useEffect } from 'react'
import { fbt } from 'fbt-runtime'
import { withRouter } from 'react-router-dom'
import copy from 'copy-to-clipboard'

import withWallet from 'hoc/withWallet'
import withCreatorConfig from 'hoc/withCreatorConfig'
import withIsMobile from 'hoc/withIsMobile'

import Link from 'components/Link'
import NavLink from 'components/NavLink'
import Profile from './Profile'
import Notifications from './Notifications'
import Messages from './Messages'
import Mobile from './Mobile'
import Search from '../listings/_Search'
import GetStarted from './GetStarted'
import ConsoleLogCatcher from 'utils/ConsoleLogCatcher'

import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'

const Brand = withCreatorConfig(({ creatorConfig }) => {
  return creatorConfig.logoUrl ? (
    <Link to="/" className="custom-brand">
      <img src={creatorConfig.logoUrl} alt={creatorConfig.title} />
    </Link>
  ) : (
    <Link to="/" className="navbar-brand">
      Origin
    </Link>
  )
})

const ShowBackRegex = /^\/(listing)(\/[-0-9]*\/?)?$/gi
const ShowSearchRegex = /^\/(listings?|search)?(\/|$)/gi

const getTitle = pathname => {
  let title
  if (pathname.startsWith('/my-listings')) {
    title = <fbt desc="Listings.title">Listings</fbt>
  } else if (pathname.startsWith('/my-purchases')) {
    title = <fbt desc="Purchases.title">Purchases</fbt>
  } else if (pathname.startsWith('/my-sales')) {
    title = <fbt desc="Sales.title">Sales</fbt>
  } else if (pathname.startsWith('/messages')) {
    title = <fbt desc="Messages.title">Messages</fbt>
  } else if (pathname.startsWith('/notifications')) {
    title = <fbt desc="Notifications.title">Notifications</fbt>
  } else if (pathname.startsWith('/create')) {
    title = <fbt desc="CreateListing.title">Create a Listing</fbt>
  } else if (pathname.startsWith('/settings')) {
    title = <fbt desc="Settings.title">Settings</fbt>
  } else if (pathname.endsWith('/edit')) {
    title = <fbt desc="EditListing.title">Edit Listing</fbt>
  }

  return title ? <h1>{title}</h1> : <Brand />
}

const Nav = ({
  location: { pathname, state: locationState },
  isMobile,
  wallet,
  walletType,
  onShowFooter,
  navbarDarkMode,
  history
}) => {
  const [open, setOpen] = useState()
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [consoleLogConnected, setConsoleLogConnected] = useState(false)

  const screenConsoleEnabled = localStorage.screenConsole === 'true'

  useEffect(() => {
    if (!consoleLogConnected && screenConsoleEnabled) {
      ConsoleLogCatcher().connect((method, logString) => {
        let logs = JSON.parse(localStorage.getItem('capturedLogs') || '[]')
        // only keep max 15 items in the logs
        logs = logs.slice(Math.max(0, logs.length - 30))
        logs.push({ method, log: logString })
        localStorage.setItem('capturedLogs', JSON.stringify(logs))
      })
      setConsoleLogConnected(true)
    }
  }, [consoleLogConnected, screenConsoleEnabled])

  const navProps = nav => ({
    onOpen: () => setOpen(nav),
    onClose: () => open === nav && setOpen(false),
    open: open === nav
  })

  const consoleCaptureContent = () => {
    const logs = JSON.parse(localStorage.getItem('capturedLogs') || '[]')

    return (
      <div className="screen-console-holder">
        <ul id="screen-console">
          {logs.map((log, index) => {
            return (
              <li key={index} className={`mt-2 ${log.method}`}>
                {log.log}
              </li>
            )
          })}
        </ul>
        <div className="actions d-flex justify-content-center">
          <div
            className="btn btn-primary mr-2"
            onClick={() => {
              setConsoleOpen(false)
            }}
          >
            <fbt desc="navbar.close">close</fbt>
          </div>
          <div
            className="btn btn-primary ml-2"
            onClick={() => {
              localStorage.removeItem('capturedLogs')
              setConsoleOpen(false)
            }}
          >
            <fbt desc="navbar.close">clear</fbt>
          </div>
          <div
            className="btn btn-primary ml-2"
            onClick={() => {
              copy(JSON.stringify(logs))
              setConsoleOpen(false)
            }}
          >
            <fbt desc="navbar.copyToClipboard">copy</fbt>
          </div>
        </div>
      </div>
    )
  }

  if (isMobile) {
    const canGoBack = history && history.length > 1

    // Make the hamburger menu absolute and hide branding and profile icon.
    const isProfilePage =
      pathname &&
      (pathname.startsWith('/profile') || pathname.startsWith('/user'))

    const walletEl = wallet ? (
      <Profile {...navProps('profile')} />
    ) : (
      <GetStarted />
    )

    const isStacked =
      (locationState && locationState.canGoBack) || (isProfilePage && canGoBack)
    const canShowBack =
      canGoBack &&
      (walletType === 'Mobile' || walletType === 'Origin Wallet') &&
      pathname.match(ShowBackRegex)
        ? true
        : false
    const canShowSearch = pathname.match(ShowSearchRegex) ? true : false

    return (
      <>
        <nav
          className={`navbar no-border ${navbarDarkMode ? 'dark' : ''} ${
            isProfilePage ? 'fixed-nav' : ''
          }`}
        >
          {isStacked && (
            <a className="nav-back-icon" onClick={() => history.goBack()} />
          )}
          {!isStacked && (
            <Mobile
              {...navProps('mobile')}
              onShowFooter={onShowFooter}
              onConsoleClick={() => {
                setConsoleOpen(!consoleOpen)
              }}
              screenConsoleEnabled={screenConsoleEnabled}
            />
          )}
          {!isProfilePage && getTitle(pathname)}
          {!isStacked && walletEl}
          {consoleOpen && consoleCaptureContent()}
        </nav>
        {canShowSearch && <Search className="search" placeholder />}
        {!isStacked && canShowBack && (
          <div className="container">
            <button
              className="btn btn-link btn-back-link"
              onClick={() => history.goBack()}
            >
              <fbt desc="Back">Back</fbt>
            </button>
          </div>
        )}
      </>
    )
  }

  if (!wallet) {
    return (
      <nav className="navbar navbar-expand-md">
        <div className="container">
          <Brand />
          <Search className="form-inline mr-auto" />
          <GetStarted />
        </div>
      </nav>
    )
  }

  /* react uses upper/lower case convention to distinguish between DOM tags
   * and user defined components. For that reason if the components starts with
   * lowercase 'this.Earn...' it will miss interpret its attributes as DOM attributes
   */
  const EarnTokens = withEnrolmentModal('a')

  return (
    <nav className={`navbar navbar-expand-md ${navbarDarkMode ? 'dark' : ''}`}>
      <div className="container">
        <Brand />
        <Search className="form-inline mr-auto" />
        <ul className="navbar-nav ml-3">
          <li className="nav-item">
            <NavLink to="/my-purchases" className="nav-link text">
              <span>
                <fbt desc="navbar.purchases">Purchases</fbt>
              </span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/my-listings" className="nav-link text">
              <span>
                <fbt desc="navbar.listings">Listings</fbt>
              </span>
            </NavLink>
          </li>
          <li className="nav-item">
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
            <EarnTokens
              className="nav-link text"
              href="#"
              goToWelcomeWhenNotEnrolled="true"
            >
              <span className="d-md-none d-xl-flex">
                <fbt desc="navbar.earnTokens">Earn Tokens</fbt>
              </span>
              <span className="d-xl-none">
                <fbt desc="navbar.tokens">Tokens</fbt>
              </span>
            </EarnTokens>
          </li>
          {screenConsoleEnabled && (
            <li className="nav-item d-none d-lg-flex">
              <div
                className="nav-link text"
                onClick={() => {
                  setConsoleOpen(!consoleOpen)
                }}
              >
                <span>
                  <fbt desc="navbar.console">Console</fbt>
                </span>
              </div>
            </li>
          )}
          <Messages {...navProps('messages')} />
          <Notifications {...navProps('notifications')} />
          <Profile {...navProps('profile')} />
        </ul>
      </div>
      {consoleOpen && consoleCaptureContent()}
    </nav>
  )
}

export default withRouter(withWallet(withIsMobile(Nav)))

require('react-styl')(`
  .navbar
    padding: 0 1rem
    &.dark
      background-color: #131d27
      .navbar-brand
        background: url(images/origin-logo.svg) no-repeat center
    &:not(.no-border)
      border-bottom: 1px solid rgba(0, 0, 0, 0.1)
    > .container
      align-items: stretch

    .screen-console-holder
      position: fixed
      font-size: 10px
      top: 50px
      bottom: 3px
      left: 3px
      right: 3px
      background-color: #222222DD
      z-index: 1
      border-radius: 15px
      padding-top: 40px
      overflow: scroll
      .log
        color: white
      .info
        color: white
      .warn
        color: yellow
      .error
        color: red
      .actions
        position: fixed
        bottom: 30px
        width: 100vw
      .btn
        bottom: 30px
        border-radius: 15px
        padding: 0.2rem 1.5rem
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
          padding: 0 0.25rem
          span
            color: var(--dusk)
            padding: 0.25rem 0.75rem
            border-radius: 1rem
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
        margin-top: 0
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1)
        border-radius: 0 0 5px 5px
        border: 1px solid var(--light)
        font-weight: normal

  .navbar-brand
    background: url(images/origin-logo-black.svg) no-repeat center
    background-size: 100%
    width: 90px
    text-indent: -9999px

  .custom-brand
    display: flex
    align-items: center
    img
      max-height: 32px

  .btn-back-link
    color: var(--dark)
    font-size: 14px
    text-decoration: none
    font-weight: normal
    position: relative
    padding: 0 0 0 1rem
    line-height: 1rem
    margin-top: 1rem
    margin-bottom: 0.5rem
    &:before
      content: ''
      position: absolute
      display: inline-block
      background-image: url(images/caret-grey.svg)
      background-size: 0.8rem
      background-position: top
      background-repeat: no-repeat
      transform: rotateZ(270deg)
      height: 1rem
      width: 1rem
      left: 0

  .nav-back-icon
    display: none
    height: 2rem
    width: 2rem
    top: 1rem
    left: 0.5rem
    position: absolute
    background-image: url('images/caret-grey.svg')
    background-size: 1.5rem
    background-position: center
    transform: rotateZ(270deg)
    background-repeat: no-repeat
    z-index: 10

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
    .navbar-brand,.custom-brand
      position: absolute
      left: 50%
      transform: translateX(-50%)
      margin-right: 0
    .navbar
      padding: 0
      min-height: 3.75rem
      &.fixed-nav
        position: absolute
        z-index: 100
      h1
        font-size: 24px
        position: absolute
        left: 50%
        transform: translateX(-50%)
        white-space: nowrap
        max-width: calc(100% - 7rem)
        overflow: hidden
        text-overflow: ellipsis
      .nav-item
        position: initial
        .dropdown-menu
          border: 0
          &::before
            content: ""
          overflow: auto
          position: fixed !important
          box-shadow: none
          margin-top: 0
          border-radius: 0
          left: -100%
          right: auto
          bottom: 0
          top: 0
          transition: left 0.3s ease
          &.dropdown-menu-right
            left: auto
            right: -100%
            transition: right 0.3s ease
        .dropdown-menu-bg
          position: fixed
          left: 0
          right: 0
          top: 0
          bottom: 0
          background: rgba(0,0,0,0.3)
          clip-path: none
          width: auto
          height: auto
          z-index: 1
          opacity: 0
          transition: opacity 0.3s ease
        &.show
          .dropdown-menu
            left: 0
            &.dropdown-menu-right
              left: auto
              right: 0
          .dropdown-menu-bg
            opacity: 1

    .nav-back-icon
      display: inline-block

`)
