import React, { Component } from 'react'
import $ from 'jquery'

class Modal extends Component {
  componentDidMount() {
    this.$el = $(this.el)

    this.$el.modal({
      backdrop: this.props.backdrop || true,
      show: this.props.isOpen,
    })
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
    const { children, className } = this.props

    return (
      <div
        ref={el => this.el = el}
        className={`modal fade ${this.props['data-modal']}${className ? ` ${className}` : ''}`}
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content d-flex">
            {children}
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
