import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'

class AttestationSuccess extends Component {
  render() {
    const { open, message, handleToggle } = this.props

    return (
      <Modal isOpen={open} className="attestationSuccess" tabIndex="-1">
        <div className="image-container">
          <img src="images/circular-check-button.svg" role="presentation" />
        </div>
        <h2 className="success-message">{message}</h2>
        <div className="reminder">
          <FormattedMessage
            id={'AttestationSuccess.publishChangesReminder'}
            defaultMessage={"Don't forget to publish your changes."}
          />
        </div>
        <div className="explanation">
          <FormattedMessage
            id={'AttestationSuccess.publishChangesNotice'}
            defaultMessage={
              'Publishing to the blockchain lets other users know that you have a verified profile.'
            }
          />
        </div>
        <div className="button-container">
          <button
            data-modal="attestationSuccess"
            className="btn btn-clear"
            onClick={handleToggle}
          >
            <FormattedMessage
              id={'AttestationSuccess.continue'}
              defaultMessage={'Continue'}
            />
          </button>
        </div>
      </Modal>
    )
  }
}

export default AttestationSuccess
