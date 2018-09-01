import React, { Component } from 'react'

import LeftPanel from './left-panel'
import RightPanel from './right-panel'
import steps from './steps'

class SplitPanel extends Component {
  constructor(props) {
    super(props)

    this.displayNextStep = this.displayNextStep.bind(this)

    this.state = { steps, currentStep: steps[0] }
  }

  firstIncompleteStep() {
    const { steps } = this.state

    return steps.find(({ subStep, complete, subStepComplete }) => {
      return (!complete || complete && subStepComplete === false)
    })
  }

  displayNextStep() {
    const { steps = [] } = this.state
    const firstIncompleteStep = this.firstIncompleteStep()
    if (!firstIncompleteStep) return

    const currentIndex = steps.indexOf(firstIncompleteStep)
    const nextStep = steps[currentIndex+1]

    const setCurrentStep = () => {
      const { complete, subStep } = firstIncompleteStep
      if (!complete && subStep) return {...firstIncompleteStep, complete: true}
      return nextStep
    }

    const updateSteps = (step) => {
      const { complete, subStep, subStepComplete } = step
      if (step === firstIncompleteStep) {
        if (complete) return {...step, subStepComplete: true}
        return {...step, complete: true}
      }
      return step
    }

    this.setState((state) => ({
      ...state,
      steps: steps.map(updateSteps),
      currentStep: setCurrentStep()
    }))
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
