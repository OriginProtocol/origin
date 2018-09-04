import React, { Component } from 'react'

import LeftPanel from './left-panel'
import RightPanel from './right-panel'

class SplitPanel extends Component {
  constructor(props) {
    super(props)
    const { onboarding: { currentStep, steps } } = this.props
    this.displayNextStep = this.displayNextStep.bind(this)
    this.state = { steps, currentStep }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.onboarding != this.props.onboarding) {
      this.setState({ ...this.props.onboarding })
    }
  }

  firstIncompleteStep() {
    const { steps } = this.state

    return steps.find(({ complete, subStepComplete }) => {
      return (!complete || complete && subStepComplete === false)
    })
  }

  storeCurrentStep(incompleteStep) {
    const { updateSteps } = this.props

    updateSteps(incompleteStep)
  }

  displayNextStep() {
    const { steps = [] } = this.state
    const firstIncompleteStep = this.firstIncompleteStep()
    if (!firstIncompleteStep) return

    this.storeCurrentStep(firstIncompleteStep)
  }

  render() {
    const { currentStep, steps } = this.state
    const { isOpen, closeModal } = this.props
    const { complete, subStep } = currentStep
    const step = complete && subStep ? subStep : currentStep
    const firstIncompleteStep = this.firstIncompleteStep()

    return (
      <div
        className={`modal fade onboarding-modal ${isOpen ? ' show' : ''}`}
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        { isOpen && (
          <div className="modal-dialog modal-lg">
            <div className="modal-content d-flex">
              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row">
                    <LeftPanel
                      steps={steps}
                      firstIncompleteStep={firstIncompleteStep}
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
