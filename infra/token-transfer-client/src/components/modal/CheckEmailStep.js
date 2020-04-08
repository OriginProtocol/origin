import React from 'react'

import ModalStep from '@/components/ModalStep'
import EmailIcon from '@/assets/email-icon.svg'

const CheckEmailStep = ({
  onDoneClick,
  modalSteps,
  modalStepsCompleted,
  text
}) => (
  <>
    <div className="mt-5 mb-3">
      <EmailIcon />
    </div>
    <h1 className="mb-2">Please check your email</h1>
    <p className="text-muted">
      {text ? text : 'Click the link in the email we just sent you'}
    </p>
    <div className="actions">
      <div className="row">
        <div className="col d-none d-md-block"></div>
        <div className="col text-center d-none d-md-block">
          <ModalStep steps={modalSteps} completedSteps={modalStepsCompleted} />
        </div>
        <div className="col text-sm-right mb-3 mb-sm-0">
          <button className="btn btn-primary btn-lg" onClick={onDoneClick}>
            Done
          </button>
        </div>
      </div>
    </div>
  </>
)

export default CheckEmailStep
