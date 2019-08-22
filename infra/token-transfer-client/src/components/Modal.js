import React, { Component } from 'react'
import ReactDOM from 'react-dom'

function freezeVp(e) {
  e.preventDefault()
}

export default class Modal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      anim: 'is-entering'
    }
    this.portal = document.createElement('div')
  }

  componentDidMount() {
    document.body.appendChild(this.portal)
    document.body.className += ' pl-modal-open'
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
      this.setState({ active: true })
    }, 10)
  }

  componentWillUnmount() {
    document.body.className = document.body.className.replace(
      ' pl-modal-open',
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
    return (
      <>
        <div
          className={`pl-modal-bg ${this.state.anim}${
            this.state.active ? ' is-active' : ''
          }`}
        />
        <div
          className={`${this.props.classNameOuter || ''} pl-modal`}
          onMouseDown={e => !this.props.disableDismiss && this.onClose(e)}
        >
          <div className="pl-modal-table">
            <div
              className={`pl-modal-cell ${this.state.anim}${
                this.state.active ? ' is-active' : ''
              }`}
            >
              <div
                className={`pl-modal-content ${this.props.className || ''}`}
                style={{ ...this.props.style }}
              >
                {!this.props.closeBtn ? null : (
                  <a
                    href="#"
                    className="close"
                    onClick={e => {
                      e.preventDefault()
                      this.doClose()
                    }}
                  >
                    &times;
                  </a>
                )}
                {this.props.children}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  onClose(e) {
    if (
      this.props.onClose &&
      String(e.target.className).indexOf('pl-modal-cell') >= 0 &&
      !this.onCloseTimeout
    ) {
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

    this.setState({ anim: 'is-leaving' })
    setTimeout(() => {
      this.setState({
        anim: `is-leaving is-${this.props.submitted ? 'submitted' : 'closed'}`
      })
    }, 10)

    this.onCloseTimeout = setTimeout(
      () => this.props.onClose && this.props.onClose(),
      500
    )
  }

  onKeyDown(e) {
    if (e.keyCode === 27 && !this.props.disableDismiss) {
      // Esc
      this.doClose()
    }
  }
}
