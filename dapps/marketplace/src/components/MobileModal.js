import React, { Component } from 'react'
import ReactDOM from 'react-dom'

function freezeVp(e) {
  e.preventDefault()
}

export default class MobileModal extends Component {
  constructor(props) {
    super(props)
    this.portal = document.createElement('div')
    this.portal.classList.add('mobile-modal')
  }

  componentDidMount() {
    document.body.appendChild(this.portal)
    document.body.className += ' mobile-modal-open'
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
      ' mobile-modal-open',
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

  componentWillReceiveProps(nextProps) {
    if (!this.props.shouldClose && nextProps.shouldClose) {
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
    return (
      <>
        <div className="mobile-modal-overlay" />
        <div className="modal-header" />
        <div className={`modal-content ${this.props.className}`}>
          {this.props.children}
        </div>
        <div className="modal-header" />
      </>
    )
  }

  renderFullScreenModal() {
    return (
      <>
        <nav className="navbar">
          <div className="modal-header">
            <a className="back-button" onClick={() => this.onClose()}>
              <img src="images/caret-grey.svg" />
            </a>
            <h3 className="modal-title">{this.props.title}</h3>
          </div>
        </nav>
        <div className={`modal-content ${this.props.className}`}>
          {this.props.children}
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
  .mobile-modal-open
    overflow: hidden
    touch-action: none
  .mobile-modal-overlay
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background-color: rgba(11, 24, 35, 0.3)
  .mobile-modal
    touch-action: none
    position: fixed
    opacity: 0
    top: 100%
    left: 0
    right: 0
    bottom: 0
    transition: top 0.3s ease, opacity 0.3s ease
    z-index: 1000
    background-color: white
    display: flex
    flex-direction: column
    &.open
      top: 0 
      opacity: 1
    .modal-content
      overflow: auto
      flex: auto 1 1
    .modal-header
      flex-grow: 0
      flex-shrink: 0
      display: flex
      border-bottom: 0
      width: 100%
      .back-button
        flex: 26px 0 0
        cursor: pointer
        img
          transform: rotateZ(270deg)
          height: 1rem
      .modal-title
        flex: auto
        white-space: nowrap
        text-align: center
        color: white
    &.contained
      box-sizing: border-box
      margin: 30px
      max-height: calc(100% - 40px)
      background: transparent
      .modal-content
        overflow: auto
        flex-grow: 0
        border-radius: 0
        border: 0
      .modal-header
        visibility: hidden
        flex-grow: 1
`)
