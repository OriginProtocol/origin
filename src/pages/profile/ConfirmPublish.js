import React, { Component } from 'react'

import Modal from 'components/modal'

class ConfirmPublish extends Component {
  render() {
    const { open, onConfirm, handleToggle } = this.props

    return (
      <Modal isOpen={open} data-modal="publish" handleToggle={handleToggle}>
        <div className="image-container">
          <img src="images/public-icon.svg" role="presentation" />
        </div>
        <h2>Ready to go public?</h2>
        <p>
          By publishing to the blockchain, other users will be able to see that you have verified your account.
        </p>
        <div className="button-container">
          <button
            type="submit"
            className="btn btn-clear"
            onClick={onConfirm}
          >
            Let&apos;s do it!
          </button>
        </div>
        <a href="#" data-modal="publish" onClick={handleToggle}>
          Oops, no wait...
        </a>
      </Modal>
    )
  }
}

export default ConfirmPublish
