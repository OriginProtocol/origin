import React, { Component } from 'react'

import Modal from 'components/modal'
import ProvisionedChanges from './_ProvisionedChanges'

class ConfirmUnload extends Component {
  render() {
    const { open, changes, onConfirm, handleToggle } = this.props

    return (
      <Modal isOpen={open} data-modal="unload" handleToggle={handleToggle}>
        <div className="image-container">
          <img src="images/public-icon.svg" role="presentation" />
        </div>
        <h2>Wait! You haven’t published yet.</h2>
        <p>If you exit without publishing you’ll lose all your changes.</p>
        <p>
          Ready to go public? After you publish your changes to the blockchain, other users will be able to see that you have verified the following:
        </p>
        {!!changes.length &&
          <ProvisionedChanges changes={changes} />
        }
        <div className="button-container">
          <button
            className="btn btn-clear"
            onClick={onConfirm}
          >
            Publish Now
          </button>
        </div>
        <a data-modal="unload" onClick={handleToggle}>
          Not Right Now
        </a>
      </Modal>
    )
  }
}

export default ConfirmUnload
