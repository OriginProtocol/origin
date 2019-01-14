import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'

class ConfirmReset extends Component {
  render() {
    const { open, onConfirm, handleToggle, mobileDevice } = this.props
    const dataModal = mobileDevice ? 'mobile-reset' : 'reset'

    return (
      <Modal
        isOpen={open}
        handleToggle={handleToggle}
        tabIndex="-1"
        className={dataModal}
      >
        <div className="image-container">
          <img src="images/public-icon.svg" role="presentation" />
        </div>
        <h2>
          <FormattedMessage
            id={'ConfirmReset.resetIdentity'}
            defaultMessage={'Upgrade Your Identity'}
          />
        </h2>
        <p>
          <FormattedMessage
            id={'ConfirmReset.afterResetNotice'}
            defaultMessage={
              'OriginID has been updated to make profiles significantly cheaper to publish. We recommend verifying each of your accounts and publishing your profile again. Your existing account verifications will be removed.'
            }
          />
        </p>
        <div className="button-container">
          <button type="submit" className="btn btn-clear" onClick={onConfirm}>
            <FormattedMessage
              id={'ConfirmReset.letsDoIt'}
              defaultMessage={`Let's do it!`}
            />
          </button>
        </div>
        <a data-modal="reset" onClick={handleToggle}>
          <FormattedMessage
            id={'ConfirmReset.oopsNoWait'}
            defaultMessage={'Not now...'}
          />
        </a>
      </Modal>
    )
  }
}

export default ConfirmReset
