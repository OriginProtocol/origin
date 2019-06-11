import React, { Component } from 'react'
import ReactDOM from 'react-dom'

function freezeVp(e) {
  e.preventDefault()
}

const MobileModalHeader = ({
  children,
  headerImageUrl,
  className = '',
  showBackButton = true,
  onBack
}) => {
  if (!children && !headerImageUrl) {
    return null
  } else if (!children) {
    return (
      <div
        className={`modal-header image-only${className ? ' ' + className : ''}`}
      >
        <img src={headerImageUrl} />
      </div>
    )
  }

  let headerClassList = ['modal-header']
  let headerStyle

  if (headerImageUrl) {
    headerClassList.push('with-image')
    headerStyle = { backgroundImage: `url(${headerImageUrl})` }
  }

  if (className) {
    headerClassList = headerClassList.concat(className.split(' '))
  }

  return (
    <div className={`${headerClassList.join(' ')}`} style={headerStyle}>
      {showBackButton && (
        <a className="modal-action-button back-button" onClick={onBack} />
      )}
      <h3 className="modal-title">{children}</h3>
      {showBackButton && <span className="modal-action-button" />}
    </div>
  )
}

export default class MobileModal extends Component {
  constructor(props) {
    super(props)
    this.portal = document.createElement('div')
    this.portal.classList.add('mobile-modal-light')
  }

  componentDidMount() {
    document.body.appendChild(this.portal)
    document.body.className += ' mobile-modal-light-open'
    document.body.addEventListener('touchmove', freezeVp, false)
    this.renderContent(this.props)

    this.onKeyDown = this.onKeyDown.bind(this)
    this.onClose = this.onClose.bind(this)
    this.doClose = this.doClose.bind(this)

    window.addEventListener('keydown', this.onKeyDown)
    this.timeout = setTimeout(() => {
      if (this.props.onOpen) {
        this.props.onOpen()
      }
      this.portal.classList.add('open')
    }, 10)
  }

  componentWillUnmount() {
    this.portal.classList.remove('open')
    document.body.className = document.body.className.replace(
      ' mobile-modal-light-open',
      ''
    )
    document.body.removeEventListener('touchmove', freezeVp, false)
    window.removeEventListener('keydown', this.onKeyDown)
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
      showBackButton
    } = this.props

    return (
      <>
        <div
          className="mobile-modal-light-overlay"
          onClick={() => this.onClose()}
        />
        <div className="modal-spacer" />
        <MobileModalHeader
          className={className}
          headerImageUrl={headerImageUrl}
          showBackButton={showBackButton}
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
      showBackButton
    } = this.props

    return (
      <>
        <MobileModalHeader
          className={className}
          headerImageUrl={headerImageUrl}
          showBackButton={showBackButton}
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
    this.portal.classList.remove('open')
    if (this.props.onClose) {
      this.onCloseTimeout = setTimeout(() => this.props.onClose(), 300)
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
    overflow: hidden
    touch-action: none
    position: relative
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
  .mobile-modal-light
    touch-action: none
    position: fixed
    z-index: 1000
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
    &.open
      top: 0
      left: 0
      opacity: 1
      right: 0
    .modal-content
      overflow: auto
      flex: auto 1 1
      border: 0
      display: flex
      flex-direction: column
    .modal-spacer
      visibility: hidden
      flex-grow: 1
    .actions
      margin-top: auto
    .modal-header
      flex-grow: 0
      flex-shrink: 0
      display: flex
      border-bottom: 0
      border-radius: 0
      width: 100%
      &.image-only
        width: 100%
        max-height: 175px
      &.with-image
        height: 200px
        background-size: cover
        background-repeat: no-repeat
      .modal-action-button
        flex: 2rem 0 0
        cursor: pointer
        height: 2rem
        &.back-button
          background-image: url('images/caret-grey.svg')
          background-size: 1.5rem
          background-position: center
          transform: rotateZ(270deg)
          background-repeat: no-repeat
      .modal-title
        flex: auto
        white-space: nowrap
        text-align: center
        font-family: Poppins
        font-size: 1.5rem
        font-weight: 500
        color: var(--dark-grey-blue)
    &.contained
      top: 100%
      bottom: -100%
      left: 0
      right: 0
      box-sizing: border-box
      padding: 30px
      background: transparent
      transition: top 0.3s ease, opacity 0.3s ease, bottom 0.3s ease
      &.open
        top: 0
        bottom: 0
      .modal-content
        overflow: auto
        flex-grow: 0
        border-radius: 0
        border: 0
      .modal-content, .modal-header
        max-width: 400px
        margin: 0 auto
`)
