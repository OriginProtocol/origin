import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import MobileModalHeader from 'components/MobileModalHeader'

function freezeVp(e) {
  e.preventDefault()
}

export default class MobileModal extends Component {
  constructor(props) {
    super(props)
    this.portal = document.createElement('div')
    this.portal.classList.add('mobile-modal-light')
    this.overlay = document.createElement('div')
    this.overlay.classList.add('mobile-modal-light-overlay')
  }

  componentDidMount() {
    document.body.appendChild(this.overlay)
    document.body.appendChild(this.portal)
    document.body.className += ' mobile-modal-light-open'
    document.body.addEventListener('touchmove', freezeVp, false)
    this.renderContent(this.props)

    this.onKeyDown = this.onKeyDown.bind(this)
    this.onClose = this.onClose.bind(this)
    this.doClose = this.doClose.bind(this)
    this.onClick = this.onClick.bind(this)

    window.addEventListener('keydown', this.onKeyDown)
    this.timeout = setTimeout(() => {
      if (this.props.onOpen) {
        this.props.onOpen()
      }
      this.overlay.classList.add('open')
      this.portal.classList.add('open')
    }, 10)

    this.overlay.addEventListener('click', this.onClick)
    this.portal.addEventListener('click', this.onClick)
  }

  componentWillUnmount() {
    this.portal.classList.remove('open')
    this.overlay.classList.remove('open')
    document.body.className = document.body.className.replace(
      ' mobile-modal-light-open',
      ''
    )
    document.body.removeEventListener('touchmove', freezeVp, false)
    window.removeEventListener('keydown', this.onKeyDown)
    this.portal.removeEventListener('click', this.onClick)
    this.overlay.removeEventListener('click', this.onClick)
    document.body.removeChild(this.overlay)
    document.body.removeChild(this.portal)
    clearTimeout(this.timeout)
  }

  render() {
    return ReactDOM.createPortal(this.renderContent(), this.portal)
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.shouldClose && this.props.shouldClose) {
      this.doClose()
    }
  }

  renderContent() {
    const shouldSlideUp =
      this.props.slideUp === true || this.props.fullscreen === false

    if (shouldSlideUp) {
      this.portal.classList.add('animate-slide-up')
    } else {
      this.portal.classList.add('animate-slide-up')
    }

    if (this.props.fullscreen === false) {
      this.portal.classList.add('contained')
      return this.renderModal()
    }

    this.portal.classList.remove('contained')
    return this.renderFullScreenModal()
  }

  renderModal() {
    const {
      title,
      className = '',
      children,
      headerImageUrl = '',
      onBack,
      showBackButton,
      showCloseButton,
      fullscreen
    } = this.props

    return (
      <>
        <div className="modal-spacer" />
        <MobileModalHeader
          className={className}
          fullscreen={fullscreen}
          headerImageUrl={headerImageUrl}
          showBackButton={showBackButton}
          showCloseButton={showCloseButton}
          onBack={() => {
            if (onBack) {
              onBack()
            } else {
              this.onClose()
            }
          }}
        >
          {title}
        </MobileModalHeader>
        <div className={`modal-content${className ? ' ' + className : ''}`}>
          {children}
        </div>
        <div className="modal-spacer" />
      </>
    )
  }

  renderFullScreenModal() {
    const {
      title,
      className = '',
      children,
      headerImageUrl = '',
      onBack,
      showBackButton,
      showCloseButton,
      fullscreen
    } = this.props

    return (
      <>
        <MobileModalHeader
          className={className}
          fullscreen={fullscreen}
          headerImageUrl={headerImageUrl}
          showBackButton={showBackButton}
          showCloseButton={showCloseButton}
          onBack={() => {
            if (onBack) {
              onBack()
            } else {
              this.onClose()
            }
          }}
        >
          {title}
        </MobileModalHeader>
        <div className={`modal-content${className ? ' ' + className : ''}`}>
          {children}
        </div>
      </>
    )
  }

  onClose() {
    if (this.props.onClose && !this.onCloseTimeout) {
      this.doClose()
    }
  }

  doClose() {
    if (this.props.skipAnimateOnExit) {
      if (this.props.onClose) {
        this.props.onClose()
      }
      return
    }

    this.portal.classList.remove('open')
    this.overlay.classList.remove('open')
    if (this.props.onClose) {
      this.onCloseTimeout = setTimeout(() => this.props.onClose(), 300)
    }
  }

  onClick(e) {
    // Close modal, when clicking outside it
    if (
      this.portal === e.target ||
      this.overlay === e.target ||
      !this.portal.contains(e.target)
    ) {
      this.onClose()
    }
  }

  onKeyDown(e) {
    if (this.props.closeOnEsc === true && e.keyCode === 27) {
      // Esc
      this.doClose()
    }
    if (e.keyCode === 13 && this.props.onPressEnter) {
      // Enter
      this.props.onPressEnter()
    }
  }
}

require('react-styl')(`
  .mobile-modal-light-open
    touch-action: none
    position: relative
    overflow: scroll
    #app
      overflow: hidden !important
      max-height: 100% !important
      max-width: 100% !important
  .mobile-modal-light-overlay
    position: fixed
    touch-action: none
    top: 0
    left: 0
    right: 0
    bottom: 0
    background-color: rgba(11, 24, 35, 0.3)
    cursor: pointer
    opacity: 0
    transition: opacity 0.3s ease
    z-index: 2000
    display: none
    &.open
      opacity: 1
      display: block
  .mobile-modal-light
    position: fixed
    z-index: 2000
    -webkit-transform: translate3d(0, 0, 0)
    opacity: 0
    top: 0
    left: 100%
    right: -100%
    bottom: 0
    transition: left 0.3s ease, opacity 0.3s ease, right 0.3s ease
    background-color: white
    display: flex
    flex-direction: column
    overflow: auto
    &.open
      top: 0
      left: 0
      opacity: 1
      right: 0
    .modal-content
      min-height: min-content
      flex: auto 1 1
      border: 0
      display: flex
      flex-direction: column
    .modal-spacer
      visibility: hidden
      flex-grow: 1
    > .modal-content > div
      .actions
        margin-top: auto !important
      .published-info-box
        margin-top: auto !important
        & + .actions
          margin-top: 3rem !important
    &.contained
      padding: 30px
      background: transparent
      box-sizing: border-box
      .modal-content
        overflow: auto
        flex-grow: 0
        border-radius: 0
        border: 0
      .modal-content
        max-width: 400px
        margin: 0 auto
    &.animate-slide-up
      top: 100%
      bottom: -100%
      left: 0
      right: 0
      transition: top 0.3s ease, opacity 0.3s ease, bottom 0.3s ease
      &.open
        top: 0
        bottom: 0
`)
