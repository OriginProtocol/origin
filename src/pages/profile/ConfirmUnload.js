import React, { Component } from 'react'

import Modal from 'components/modal'

class ConfirmUnload extends Component {
  render() {
    const { open, onConfirm, handleToggle } = this.props

    return (
      <Modal isOpen={open} data-modal="unload" handleToggle={handleToggle}>
        <div className="image-container">
          <img src="images/public-icon.svg" role="presentation" />
        </div>
        <h2>Wait! You haven’t published yet.</h2>
        <p>If you exit without publishing you’ll lose all your changes.</p>
        <p>
          Ready to go public? By publishing to the blockchain, other users will be able to see that you have verified your account.
        </p>
        <div className="button-container">
          <button
            className="btn btn-clear"
            onClick={onConfirm}
          >
            Publish Now
          </button>
        </div>
        <a href="#" data-modal="unload" onClick={handleToggle}>
          Not Right Now
        </a>
      </Modal>
    )
  }
}

export default ConfirmUnload
