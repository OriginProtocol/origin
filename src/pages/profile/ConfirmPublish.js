import React, { Component } from 'react'

import Modal from 'components/modal'

class ConfirmPublish extends Component {
  render() {
    const { open, handleToggle } = this.props

    return (
      <Modal isOpen={open} data-modal="publish" handleToggle={handleToggle}>
        <div className="image-container">
          <img src="images/public-icon.svg" role="presentation" />
        </div>
        <h2>Ready to go public?</h2>
        <p>
          By updating your profile, you are publishing your
          information publicly and others will be able to see it on the
          blockchain and IPFS.
        </p>
        <div className="button-container">
          <a
            href="#"
            className="btn btn-clear mr-3"
            data-modal="publish"
            onClick={this.props.handleToggle}
          >
            Oops, no wait...
          </a>
          <button
            type="submit"
            className="btn btn-clear"
            onClick={() => this.props.onConfirm()}
          >
            Let&apos;s do it!
          </button>
        </div>
      </Modal>
    )
  }
}

export default ConfirmPublish
