import React, { Component } from 'react'
import ModalBS from 'react-bootstrap/Modal'

class Modal extends Component {
  render() {
    const {
      isOpen,
      children,
      className,
      tabIndex,
      alignItems,
      backdrop
    } = this.props
    const setTabIndex = tabIndex ? { tabIndex } : {}

    return (
      <ModalBS
        show={isOpen}
        backdrop={backdrop !== undefined ? backdrop : true}
        onHide={() => {}}
        className={className}
        dialogAs="div"
        {...setTabIndex}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div
            className="modal-content d-flex"
            style={{ alignItems: alignItems ? alignItems : 'stretch' }}
          >
            {children}
          </div>
        </div>
      </ModalBS>
    )
  }
}

export default Modal
