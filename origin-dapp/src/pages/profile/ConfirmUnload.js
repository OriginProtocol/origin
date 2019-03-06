import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'
import ProvisionedChanges from './_ProvisionedChanges'

class ConfirmUnload extends Component {
  render() {
    const { open, changes, onConfirm, handleToggle } = this.props

    return (
      <Modal
        isOpen={open}
        className="unload"
        handleToggle={handleToggle}
        tabIndex="-1"
      >
        <div className="image-container">
          <img src="images/public-icon.svg" role="presentation" />
        </div>
        <h2>
          <FormattedMessage
            id={'ConfirmUpload.waitNotice'}
            defaultMessage={'Wait! You haven’t published yet.'}
          />
        </h2>
        <p>
          <FormattedMessage
            id={'ConfirmUpload.ifYouExitNotice'}
            defaultMessage={
              'If you exit without publishing you’ll lose all your changes.'
            }
          />
        </p>
        <p>
          <FormattedMessage
            id={'ConfirmUpload.readyToGoPublic'}
            defaultMessage={
              'Ready to go public? After you publish your changes to the blockchain, other users will be able to see that you have verified the following, but they will not be able to see your actual data:'
            }
          />
        </p>
        {!!changes.length && <ProvisionedChanges changes={changes} />}
        <div className="button-container">
          <button className="btn btn-clear" onClick={onConfirm}>
            <FormattedMessage
              id={'ConfirmUpload.publishNow'}
              defaultMessage={'Publish Now'}
            />
          </button>
        </div>
        <a data-modal="unload" onClick={handleToggle}>
          <FormattedMessage
            id={'ConfirmUpload.notRightNow'}
            defaultMessage={'Not Right Now'}
          />
        </a>
      </Modal>
    )
  }
}

export default ConfirmUnload
