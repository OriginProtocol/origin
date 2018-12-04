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
    if (!this.mouseOver && this.props.onClose) {
      this.props.onClose()
    }
  }

  render() {
    let className = `dropdown${this.props.open ? ' show' : ''}`
    if (this.props.className) className += ` ${this.props.className}`

    return (
      <div
        className={className}
        onMouseOver={() => this.mouseOver = true}
        onMouseOut={() => this.mouseOver = false}
      >
        {this.props.children}
      </div>
    )
  }
}

export default Dropdown
