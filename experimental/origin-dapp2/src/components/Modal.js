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
    setTimeout(() => {
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
        <div className="pl-modal" onMouseDown={e => this.onClose(e)}>
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
    this.setState({ anim: 'is-leaving' })
    setTimeout(() => {
      this.setState({
        anim: `is-leaving is-${this.props.submitted ? 'submitted' : 'closed'}`
      })
    }, 10)
    this.onCloseTimeout = setTimeout(() => this.props.onClose(), 500)
  }

  onKeyDown(e) {
    if (e.keyCode === 27) {
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
  .pl-modal-open
    overflow: hidden
    touch-action: none
  .pl-modal
    position: fixed
    z-index: 2000
    top: 0
    right: 0
    bottom: 0
    left: 0
    overflow-y: auto
    -webkit-transform: translate3d(0, 0, 0)

    .btn
      border-radius: 2rem
      padding: 0.5rem 2rem
      min-width: 10rem
      font-size: 18px

    .btn-success
      border-width: 0

    .btn-link
      font-size: 14px
      font-weight: normal
      text-decoration: underline
      color: var(--white)

    .pl-modal-table
      display: table;
      table-layout: fixed;
      height: 100%;
      width: 100%;
      .pl-modal-cell
        display: table-cell;
        height: 100%;
        width: 100%;
        vertical-align: middle;
        padding: 1rem;
        .pl-modal-content
          text-align: center
          position: relative;
          overflow: hidden;
          margin-left: auto;
          margin-right: auto;
          max-width: 500px;
          border-radius: 10px;
          font-size: 18px
          font-weight: normal
          background-color: var(--dark-grey-blue);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden

          align-items: center;
          color: white;
          padding: 3rem;

  .pl-modal-cell
    position: relative;
    -webkit-transition-property: opacity,-webkit-transform;
    transition-property: opacity,-webkit-transform;
    transition-property: opacity,transform;
    transition-property: opacity,transform,-webkit-transform

  .pl-modal-cell.is-entering>.pl-modal-content
    opacity: 0;
    -webkit-transform: translateY(50px) scale(.95);
    transform: translateY(50px) scale(.95)

  .pl-modal-cell.is-active.is-entering>.pl-modal-content
    opacity: 1;
    -webkit-transform: translateY(0) scale(1);
    transform: translateY(0) scale(1);
    -webkit-transition-timing-function: cubic-bezier(.15,1.45,.55,1);
    transition-timing-function: cubic-bezier(.15,1.45,.55,1);
    -webkit-transition-duration: .4s;
    transition-duration: .4s

  .pl-modal-cell.is-leaving.is-closed>.pl-modal-content
    opacity: 0;
    -webkit-transform: translateY(50px) scale(.95);
    transform: translateY(50px) scale(.95);
    -webkit-transition-timing-function: ease-in-out;
    transition-timing-function: ease-in-out;
    -webkit-transition-duration: .2s;
    transition-duration: .2s

  .pl-modal-cell.is-leaving.is-submitted>.pl-modal-content
    opacity: 0;
    -webkit-transform: translateY(-300px) translateZ(-70px) rotateX(10deg);
    transform: translateY(-300px) translateZ(-70px) rotateX(10deg);
    -webkit-transition-property: opacity,-webkit-transform;
    transition-property: opacity,-webkit-transform;
    transition-property: opacity,transform;
    transition-property: opacity,transform,-webkit-transform;
    -webkit-transition-timing-function: cubic-bezier(.5,-.33,1,1);
    transition-timing-function: cubic-bezier(.5,-.33,1,1);
    -webkit-transition-duration: .2s;
    transition-duration: .2s

  .pl-modal
    -webkit-transition-property: opacity;
    transition-property: opacity

  .pl-modal-bg
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0
    touch-action: none
    z-index: 1999
    background: rgba(235, 240, 243, .6);

  .pl-modal-bg.is-entering
    opacity: 0;
    transition-duration: .2s;
    transition-timing-function: ease

  .pl-modal-bg.is-active.is-entering
    opacity: 1

  .pl-modal-bg.is-leaving
    opacity: 1;
    transition-delay: .2s;
    transition-duration: .2s;
    transition-timing-function: ease-in-out

  .pl-modal-bg.is-active.is-leaving
    opacity: 0

  .pl-modal-content
    h5
      font-family: Poppins
      font-size: 22px
      font-weight: normal
    .actions
      margin-top: 2rem
      .btn
        margin: 0 0.5rem 1rem 0.5rem

  @media (max-width: 575.98px)
    .pl-modal
      .pl-modal-table
        .pl-modal-cell
          .pl-modal-content
            padding: 1rem
            .actions
              display: flex
              flex-direction: column-reverse
              align-items: center

`)
