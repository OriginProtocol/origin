import React, { Component, Fragment } from 'react'

class ToastNotification extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      color: 'blue',
      text: ''
    }

    this.timeoutRoutine = null
    this.show = this.show.bind(this)
  }

  componentDidMount() {
    this.props.setShowHandler(this.show)
  }

  show(text, color) {
    if (this.timeoutRoutine)
      clearTimeout(this.timeoutRoutine)

    this.setState({
      text,
      color,
      visible: true
    })

    this.timeoutRoutine = setTimeout(() => this.setState({ visible: false }), 5000)
  }

  render() {
    const {
      visible,
      color,
      text
    } = this.state

    return(<div className="toast-notification-holder">
      <div className={`toast-notification-wrap d-flex justify-content-center ${visible ? 'show' : ''}`}>
        <div className={`toast-notification ${color}`}>
          {text}
        </div>
      </div>
    </div>)
  }
}

export default ToastNotification

require('react-styl')(`
  .toast-notification-holder
    position:relative
    height: 0px
    .toast-notification-wrap
      position: absolute
      left: 0
      right: 0
      top: -15px
      z-index: 1
      visibility: hidden
      opacity: 0
      transition: visibility 0s 2s, opacity 0.33s linear, top 0.33s ease-in
      &.show
        top: 0px
        visibility: visible
        opacity: 1
        transition: opacity 0.33s linear, top 0.33s ease-in
      .toast-notification
        border-radius: 5px
        background-color: var(--clear-blue)
        font-size: 18px
        font-weight: bold
        color: white
        padding: 8px 38px
        &.blue
          background-color: var(--clear-blue)
        &.green
          background-color: var(--greenblue)
`)
