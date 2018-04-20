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
    return (
      <div ref={el => this.el = el} className={`modal fade ${this.props['data-modal']}`} tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
