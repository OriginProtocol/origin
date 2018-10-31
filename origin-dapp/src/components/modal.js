import React, { Component } from 'react'
import $ from 'jquery'

class Modal extends Component {
  componentDidMount() {
    const { isOpen, backdrop = true } = this.props
    this.$el = $(this.el)

    this.$el.modal({ backdrop, show: isOpen })
  }

  componentDidUpdate(prevProps) {
    const { isOpen } = this.props

    if (prevProps.isOpen !== isOpen) {
      this.$el.modal(isOpen ? 'show' : 'hide')
    }
  }

  componentWillUnmount() {
    this.$el.modal('hide')
  }

  render() {
    const { children, className, tabIndex, alignItems } = this.props
    const setTabIndex = tabIndex && { tabIndex }

    return (
      <div
        ref={el => (this.el = el)}
        className={`modal fade ${this.props['data-modal']}${
          className ? ` ${className}` : ''
        }`}
        role="dialog"
        aria-hidden="true"
        {...setTabIndex}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content d-flex" style={{ 'alignItems': alignItems ? alignItems : 'stretch' }}>{children}</div>
        </div>
      </div>
    )
  }
}

export default Modal
