import React, { Component } from 'react'

class Dropdown extends Component {
  constructor(props) {
    super(props)
    this.onBlur = this.onBlur.bind(this)
    this.state = {
      open: false
    }
  }

  componentDidMount() {
    if (this.props.open) {
      this.doOpen()
    }
  }

  componentWillUnmount() {
    if (this.state.open) {
      this.doClose()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open === this.props.open) {
      return
    }

    if (prevProps.open && !this.props.open) {
      // Should close
      this.doClose()
    } else if (!prevProps.open && this.props.open) {
      // Should open
      this.doOpen()
    }
  }

  onBlur() {
    if (!this.mouseOver) {
      this.doClose()
    }
  }

  doOpen() {
    if (this.state.open) {
      return
    }

    document.addEventListener('click', this.onBlur)

    this.setState({ open: true })
    setTimeout(() => this.dropdownEl.classList.add('show'), 10)
  }

  doClose() {
    if (!this.state.open || this.state.closing) {
      return
    }

    document.removeEventListener('click', this.onBlur)

    this.dropdownEl.classList.remove('show')
    if (this.props.onClose) {
      if (this.props.animateOnExit) {
        this.setState({ closing: true })

        this.onCloseTimeout = setTimeout(() => {
          this.setState({ open: false, closing: false })
          this.props.onClose()
        }, 300)
        return
      }

      this.props.onClose()
    }

    this.setState({ open: false })
  }

  render() {
    let className = 'dropdown'
    if (this.props.className) className += ` ${this.props.className}`
    const El = this.props.el || 'div'

    return (
      <El
        ref={ref => (this.dropdownEl = ref)}
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
