import React, { Component } from 'react'

import Modal from 'components/modal'

class ConfirmPublish extends Component {
  render() {
    const { open, handleToggle, handlePublish } = this.props

    return (
      <Modal isOpen={open} data-modal="unload" handleToggle={handleToggle}>
        <div className="image-container">
          <img src="/images/public-icon.svg" role="presentation" />
        </div>
        <h2>Wait! You haven’t published yet.</h2>
        <p>If you exit without publishing you’ll lose all your changes.</p>
        <p>
          Ready to go public? By updating your profile, you are publishing your
          information publicly and others will be able to see it on the
          blockchain and IPFS.
        </p>
        <div className="button-container">
          <button
            className="btn btn-clear"
            onClick={e => handlePublish(() => handleToggle(e))}
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

export default ConfirmPublish
