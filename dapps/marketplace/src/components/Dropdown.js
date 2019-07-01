import React, { Component } from 'react'

class Dropdown extends Component {
  constructor(props) {
    super(props)
    this.onBlur = this.onBlur.bind(this)
    this.state = {}
  }

  componentDidMount() {
    if (this.props.open) {
      document.addEventListener('click', this.onBlur)
    }
  }

  componentWillUnmount() {
    if (this.props.open) {
      document.removeEventListener('click', this.onBlur)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open && !this.props.open) {
      document.removeEventListener('click', this.onBlur)
    } else if (!prevProps.open && this.props.open) {
      document.addEventListener('click', this.onBlur)
    }
  }

  onBlur() {
    if (document.body.classList.contains('mobile-modal-open')) {
      return
    }

    if (!this.mouseOver && this.props.onClose) {
      this.props.onClose()
    }
  }

  render() {
    let className = `dropdown${this.props.open ? ' show' : ''}`
    if (this.props.className) className += ` ${this.props.className}`
    const El = this.props.el || 'div'

    return (
      <El
        className={className}
        onMouseOver={() => (this.mouseOver = true)}
        onMouseOut={() => (this.mouseOver = false)}
      >
        {this.props.children}
        {this.props.content && this.state.open ? this.props.content : null}
      </El>
    )
  }
}

export default Dropdown

require('react-styl')(`
  .dropdown:not(.show)
    .dropdown-menu
      display: none
    .dropdown-menu-bg
      display: none !important
    
  @media (max-width: 767.98px)
    .dropdown:not(.show)
      .dropdown-menu
        display: block
`)
