import React, { Component } from 'react'

class Avatar extends Component {
  render() {
    const props = { style: {}, className: 'avatar' }
    if (this.props.size) {
      props.style = {
        width: this.props.size || 50,
        paddingTop: this.props.size || 50
      }
    }

    if (!this.props.avatar) {
      props.className += ' empty'
    } else {
      props.style.backgroundImage = `url(${this.props.avatar})`
    }

    if (this.props.className) {
      props.className += ` ${this.props.className}`
    }

    return <div {...props} />
  }
}

export default Avatar

require('react-styl')(`
  .avatar
    position: relative
    width: 100%
    padding-top: 100%
    background-size: contain
    border-radius: var(--default-radius)
    background-repeat: no-repeat
    background-position: center

    &.empty
      background: var(--dark-grey-blue) url(images/avatar-blue.svg) no-repeat center bottom;
      background-size: 63%
      &.dark
        background: var(--dark-two) url(images/avatar-unnamed.svg) no-repeat center bottom;
        background-size: 63%
    &.with-cam::after
      content: ""
      width: 2.5rem
      height: 2.5rem
      background: url(images/camera-icon-circle.svg) no-repeat center
      background-size: 100%
      position: absolute
      bottom: 0.5rem
      right: 0.5rem

`)
