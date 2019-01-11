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
            defaultMessage={'Upgrade your Identity?'}
          />
        </h2>
        <p>
          <FormattedMessage
            id={'ConfirmReset.afterResetNotice'}
            defaultMessage={
              'If you accept, your existing attestation(s) will get cleared and you should go thru the attestation process again before re-publishing.'
            }
          />
        </p>
        <div className="button-container">
          <button type="submit" className="btn btn-clear" onClick={onConfirm}>
            <FormattedMessage
              id={'ConfirmReset.letsDoIt'}
              defaultMessage={"Let's do it!"}
            />
          </button>
        </div>
        <a data-modal="publish" onClick={handleToggle}>
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
