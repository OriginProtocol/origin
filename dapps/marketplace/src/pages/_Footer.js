import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import ExternalAnchor from 'components/ExternalAnchor'
import Link from 'components/Link'
import withIsMobile from 'hoc/withIsMobile'

import LocaleDropdown from 'components/LocaleDropdown'
import CurrencyDropdown from 'components/CurrencyDropdown'

const SupportLink = 'https://goo.gl/forms/86tKQXZdmux3KNFJ2'

class Footer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      reminders: false,
      open: false,
      closing: false
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.open && this.props.open) {
      return this.setState({
        open: true
      })
    } else if (prevProps.open && !this.props.open) {
      return this.setState({
        closing: true
      })
    }

    if (this.state.open && !prevState.open) {
      // will open
      setTimeout(() => this.wrapperRef.classList.add('open'), 10)
    } else if (this.state.closing && !prevState.closing) {
      // will close
      this.wrapperRef.classList.remove('open')
      setTimeout(() => this.setState({ open: false, closing: false }), 300)
    } else if (!this.state.closing && prevState.closing && this.props.onClose) {
      // has been closed
      this.props.onClose()
    }
  }

  onToggle() {
    const { open, closing } = this.state

    if (closing) {
      return
    }

    if (open) {
      this.setState({ closing: true })
    } else {
      this.setState({ open: true })
    }
  }

  renderFooterActionButton() {
    const { open, closing } = this.state
    const { isMobile } = this.props

    if (isMobile) {
      return null
    }

    return (
      <button
        className="footer-action-button"
        type="button"
        onClick={() => this.onToggle()}
      >
        {isMobile && !open && <fbt desc="footer.Help">Help</fbt>}
        {!isMobile && open && !closing && <fbt desc="footer.Close">Close</fbt>}
      </button>
    )
  }

  renderFooter() {
    const { open } = this.state

    if (!open) {
      return null
    }

    const {
      creatorConfig,
      isMobile,
      locale,
      onLocale,
      currency,
      onCurrency
    } = this.props

    return (
      <footer>
        <div className="container">
          {!isMobile && (
            <ExternalAnchor
              href="https://www.originprotocol.com"
              target="_blank"
              rel="noopener noreferrer"
              className="logo-link"
            >
              <div className="logo-box">
                {creatorConfig.isCreatedMarketplace && (
                  <span className="font-weight-bold">Powered by</span>
                )}
                <div className="logo" />
              </div>
            </ExternalAnchor>
          )}
          <div className="footer-content">
            <div className="desc">
              <fbt desc="footer.desc">
                Origin enables true peer-to-peer commerce.
              </fbt>
            </div>
            <div>
              <fbt desc="footer.copyright">
                &copy; 2019 Origin Protocol, Inc.
              </fbt>
            </div>
            <div className="external-links">
              <a
                href="https://www.originprotocol.com/tos"
                target="_blank"
                rel="noopener noreferrer"
              >
                <fbt desc="footer.acceptableUsePolicy">Terms</fbt>
              </a>
              <a
                href="https://www.originprotocol.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                <fbt desc="footer.privacy">Privacy</fbt>
              </a>
              <a
                href="https://www.originprotocol.com/aup"
                target="_blank"
                rel="noopener noreferrer"
              >
                <fbt desc="footer.acceptableUsePolicy">
                  Acceptable Use Policy
                </fbt>
              </a>
            </div>
          </div>
          <div className="footer-content">
            <div className="links">
              <a
                href="https://www.originprotocol.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <fbt desc="footer.websiteLink">About Origin</fbt>
              </a>

              <a
                href="https://www.originprotocol.com/creator"
                target="_blank"
                rel="noopener noreferrer"
              >
                <fbt desc="footer.creatorLink">Create a Marketplace</fbt>
              </a>
              <span className="d-none d-md-inline">
                <Link to="/settings" onClick={() => this.onToggle()}>
                  <fbt desc="footer.settings">Settings</fbt>
                </Link>
              </span>
              <span className="d-none d-md-inline">
                <a href={SupportLink}>
                  <fbt desc="footer.giveFeedback">Give Feedback</fbt>
                </a>
              </span>
            </div>
            <div className="footer-settings">
              <div className="footer-dropdown-wrapper">
                <CurrencyDropdown
                  value={currency}
                  onChange={onCurrency}
                  className="footer-dropdown"
                  useNativeSelectbox={true}
                />
              </div>
              <div className="footer-dropdown-wrapper">
                <LocaleDropdown
                  locale={locale}
                  onLocale={onLocale}
                  className="footer-dropdown"
                  useNativeSelectbox={true}
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  render() {
    const { open } = this.state
    return (
      <div className="footer-wrapper" ref={ref => (this.wrapperRef = ref)}>
        {open && (
          <div
            className="footer-wrapper-overlay"
            onClick={() => this.onToggle()}
          />
        )}
        {this.renderFooter()}
        {this.renderFooterActionButton()}
      </div>
    )
  }
}

export default withIsMobile(Footer)

require('react-styl')(`
  .footer-wrapper
    z-index: 500
    .footer-action-button
      position: fixed
      z-index: 500
      bottom: 1.25rem
      right: 1.5rem
      border-radius: 30px
      box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.15)
      background-color: var(--white)
      font-size: 12px
      font-weight: bold
      color: var(--steel)
      border-style: none
      outline: none
      padding: 0.5rem 0.75rem
      &:before
        content: '•••'
        margin-right: 5px
        color: #6f8294
        font-size: 10px

    footer
      position: fixed
      bottom: -100%
      right: 0
      left: 0
      transition: bottom 0.3s ease
      z-index: 500
      box-shadow: 0 -1px 2px 0 rgba(0, 0, 0, 0.1)
      background-color: var(--white)
      padding: 2.5rem 2rem
      font-size: 12px
      color: var(--dark-grey-blue)
      min-height: 22rem
      .container
        display: flex
        justify-content: space-between
        > .logo-link, > .logo-box
          text-align: center
          flex: auto 0 0
          padding-right: 2.5rem
          border-right: 1px solid #dde6ea
          margin-right: 2.5rem
          .logo
            background: url(images/origin-logo-black.svg) no-repeat
            height: 25px
            width: 100px
            margin: 0 auto
        .footer-content
          flex: 1
          color: var(--dark-grey-blue)
          font-weight: 300
          > div
            margin-bottom: 0.25rem
          a
            margin-right: 10px
            color: var(--dark-grey-blue)
          .links
            font-weight: 400
            display: flex
            justify-content: space-between
            color: var(--dark-grey-blue)
            margin-bottom: 3rem
          .desc
            margin-bottom: 3rem
        .footer-settings
          text-align: right
          .footer-dropdown-wrapper
            position: relative
            display: inline-block
            &:after
              content: ''
              position: absolute
              display: inline-block
              width: 5px
              background-image: url('images/caret-dark.svg')
              background-repeat: no-repeat
              background-position: right center
              background-size: 5px
              top: 0
              bottom: 0
              right: 12px
              transform: rotateZ(90deg)
          .footer-dropdown
            cursor: pointer
            margin-left: 12px
            border-radius: 30px
            border: solid 1px #c2cbd3
            box-shadow: 0 -1px 2px 0 rgba(0, 0, 0, 0.1)
            background-color: var(--white)
            min-width: 6.25rem
            -webkit-appearance: none
            padding: 0.25rem 1rem

    &.open
      .footer-action-button:before
        content: ''
        width: 10px
        height: 10px
        background-image: url('images/nav/close-material.svg')
        background-position: center
        background-size: 10px
        background-repeat: no-repat
        display: inline-block
      footer
        bottom: 0
    .footer-wrapper-overlay
      position: fixed
      z-index: 500
      top: 0
      bottom: 0
      left: 0
      right: 0

  @media (max-width: 767.98px)
    .footer-wrapper
      .footer-action-button
        bottom: 10px
        right: 10px
      footer
        min-height: auto
        .container
          flex-direction: column
          .footer-content
            .links
              display: block
              margin-bottom: 1.5rem
              a
                width: 50%
                display: inline-block
                margin: 0.5rem 0
            .desc, .external-links
              margin-bottom: 1.5rem
          .footer-settings
            text-align: auto
            display: flex
            .footer-dropdown-wrapper
              flex: 1
              margin: 0 0.75rem
              &:first-child
                margin-left: 0
              &:last-child
                margin-right: 0
              .footer-dropdown
                width: 100%
                margin-left: 0
`)
