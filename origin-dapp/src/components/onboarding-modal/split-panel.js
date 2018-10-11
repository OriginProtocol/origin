import React, { Component } from 'react'

import LeftPanel from './left-panel'
import RightPanel from './right-panel'

class SplitPanel extends Component {
  constructor(props) {
    super(props)
    this.displayNextStep = this.displayNextStep.bind(this)
  }

  firstIncompleteStep() {
    const { steps } = this.props

    return steps.find(({ complete, subStepComplete }) => {
      return !complete || (complete && subStepComplete === false)
    })
  }

  displayNextStep() {
    const { updateSteps, currentStep } = this.props

    updateSteps({ incompleteStep: currentStep })
  }

  render() {
    const { isOpen, closeModal, currentStep = {}, selectStep } = this.props
    const { complete, subStep } = currentStep
    const step = complete && subStep ? subStep : currentStep

    return (
      <div
        className={`modal fade onboarding-modal${isOpen ? ' show' : ''}`}
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        {isOpen && (
          <div className="modal-dialog modal-lg">
            <div className="modal-content d-flex">
              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row">
                    <LeftPanel
                      firstIncompleteStep={step}
                      selectStep={selectStep}
                    />
                    <RightPanel
                      displayNextStep={this.displayNextStep}
                      step={step}
                      closeModal={closeModal}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default SplitPanel
