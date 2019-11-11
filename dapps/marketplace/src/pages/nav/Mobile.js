import React, { useState, useEffect } from 'react'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'
import withAuthStatus from 'hoc/withAuthStatus'

import Dropdown from 'components/Dropdown'
import Redirect from 'components/Redirect'
import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'

const SupportLink = 'https://goo.gl/forms/86tKQXZdmux3KNFJ2'

const MobileNav = ({
  open,
  onClose,
  onOpen,
  onShowFooter,
  onConsoleClick,
  screenConsoleEnabled,
  isLoggedIn
}) => {
  // Allow the menu to close before redirecting so it doesn't show when
  // the user clicks or swipes back.
  const [redirect, setRedirect] = useState()
  const [doRedirect, setDoRedirect] = useState()

  useEffect(() => {
    if (redirect) {
      setRedirect(null)
      setDoRedirect(redirect)
    }
  }, [redirect])

  useEffect(() => {
    if (doRedirect) {
      setDoRedirect(null)
    }
  }, [doRedirect])

  if (doRedirect) {
    return <Redirect to={doRedirect} push />
  }

  function click(e, to) {
    e.preventDefault()
    onClose()
    setRedirect(to)
  }

  const hasUnread = ''
  /* react uses upper/lower case convention to distinguish between DOM tags
   * and user defined components. For that reason if the components starts with
   * lowercase 'this.Earn...' it will miss interpret its attributes as DOM attributes
   */
  const EarnTokens = withEnrolmentModal('a')

  return (
    <Dropdown
      className="nav-item mobile"
      open={open}
      onClose={() => onClose()}
      animateOnExit={true}
      content={
        <>
          <div className="dropdown-menu-bg" onClick={() => onClose()} />
          <div className="dropdown-menu show">
            <a
              href="#close"
              onClick={e => {
                e.preventDefault()
                onClose()
              }}
              className="dropdown-item close-dropdown"
            >
              &nbsp;
            </a>
            <a
              href="#/"
              onClick={e => click(e, '/')}
              className="dropdown-item home"
              children={fbt('Home', 'navigation.Home')}
            />
            <a
              href="#/create"
              onClick={e => click(e, '/create')}
              className="dropdown-item add"
              children={fbt('Add a Listing', 'navigation.AddaListing')}
            />
            {isLoggedIn && (
              <>
                <EarnTokens
                  className="dropdown-item earn"
                  onClose={() => onClose()}
                  onNavigation={() => onClose()}
                  goToWelcomeWhenNotEnrolled="true"
                >
                  <fbt desc="navbar.earnTokens">Earn Origin Tokens</fbt>
                </EarnTokens>
                <div className="dropdown-divider" />
                <a
                  href="#/my-purchases"
                  onClick={e => click(e, '/my-purchases')}
                  className="dropdown-item purchases"
                  children={fbt('Purchases', 'navigation.purchases')}
                />
                <a
                  href="#/my-listings"
                  onClick={e => click(e, '/my-listings')}
                  className="dropdown-item listings"
                  children={fbt('Listings', 'navigation.listings')}
                />
                <a
                  href="#/my-sales"
                  onClick={e => click(e, '/my-sales')}
                  className="dropdown-item sales"
                  children={fbt('Sales', 'navigation.sales')}
                />
                <div className="dropdown-divider" />
                <a
                  href="#/messages"
                  onClick={e => click(e, '/messages')}
                  className="dropdown-item messages"
                  children={fbt('Messages', 'navigation.messages')}
                />
                <a
                  href="#/notifications"
                  onClick={e => click(e, '/notifications')}
                  className="dropdown-item notifications"
                  children={fbt('Notifications', 'navigation.notifications')}
                />
              </>
            )}
            <a
              href="#/settings"
              onClick={e => click(e, '/settings')}
              className="dropdown-item settings"
              children={fbt('Settings', 'navigation.settings')}
            />
            <a
              href={SupportLink}
              onClick={() => onClose()}
              className="dropdown-item feedback"
              children={fbt('Feedback', 'navigation.feedback')}
            />
            {screenConsoleEnabled && (
              <a
                onClick={() => {
                  onConsoleClick()
                  onClose()
                }}
                className="dropdown-item listings"
                children={fbt('Console', 'navbar.console')}
              />
            )}
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                onShowFooter()
                onClose()
              }}
              className="dropdown-item more"
              children={fbt('More', 'navigation.more')}
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
          open ? onClose() : onOpen()
        }}
      >
        <div className={`mobile-icon${hasUnread}`} />
      </a>
    </Dropdown>
  )
}

export default withWallet(withAuthStatus(MobileNav))

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
        padding: 0.75rem 1.5rem 0.75rem 4rem
        overflow: hidden
        text-overflow: ellipsis
        &:active,&.active
          background-color: var(--pale-grey)
        &::before
          position: absolute
          left: 1.25rem
          content: ""
          width: 2rem
          top: 0
          bottom: 0
          background-repeat: no-repeat
          background-position: center
          background-size: 22px
        &.close-dropdown::before
          background-image: url(images/nav/close-icon.svg)
          background-size: 30px
          left: 13px
          width: 30px
          height: 30px
          top: 4px
        &.home::before
          background-image: url(images/nav/home-icon.svg)
          background-size: 80%
        &.add::before
          background-image: url(images/nav/add-listing-icon.svg)
          background-size: 75%
        &.earn::before
          background-image: url(images/nav/ogn-icon.svg)
        &.purchases::before
          background-image: url(images/nav/purchases-icon.svg)
        &.listings::before
          background-image: url(images/nav/listings-icon.svg)
        &.sales::before
          background-image: url(images/nav/sales-icon.svg)
          background-size: 85%
        &.messages::before
          background-image: url(images/nav/chatbubble-icon.svg)
        &.notifications::before
          background-image: url(images/nav/alerts-icon.svg)
        &.settings::before
          background-image: url(images/nav/gear-icon.svg)
        &.feedback::before
          background-image: url(images/nav/feedback-icon.svg)
        &.more::before
          background-image: url(images/nav/more-icon.svg)
`)
