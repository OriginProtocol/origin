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
      <div className={`toast-notification ${visible ? 'show' : ''} ${color}`}>
        {text}
      </div>
    </div>)
  }
}

export default ToastNotification

require('react-styl')(`
  .toast-notification-holder
    position:relative
    height: 0px

    .toast-notification
      position: absolute
      left: 50%
      top: 0px
      border-radius: 5px
      background-color: var(--clear-blue)
      font-size: 18px
      font-weight: bold
      color: white
      z-index: 1
      padding: 8px 38px
      visibility: hidden
      opacity: 0
      transition: visibility 0s linear 0.33s, opacity 0.33s linear
      &.show
        visibility: visible
        opacity: 1
        transition-delay: 0s
      &.blue
        background-color: var(--clear-blue)
      &.green
        background-color: var(--greenblue)
`)
