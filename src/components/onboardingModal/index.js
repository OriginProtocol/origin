import React, { Component } from 'react'
import $ from 'jquery'

import RightPanel from './right-panel'
import steps from './steps'

class OnboardingModal extends Component {
  constructor(props) {
    super(props)
    this.state = {steps, currentStep: steps[0]}

    this.displayNextStep = this.displayNextStep.bind(this)
  }

  componentDidMount() {
    this.$el = $(this.el)

    this.$el.modal({
      backdrop: this.props.backdrop || true,
      show: this.props.isOpen || true
    })
  }

  componentDidUpdate(prevProps) {
    const { isOpen=true } = this.props

    if (prevProps.isOpen !== isOpen) {
      this.$el.modal(isOpen ? 'show' : 'hide')
    }
  }

  componentWillUnmount() {
    this.$el.modal('hide')
  }

  firstIncompleteStep() {
    const { steps } = this.state

    return steps.find(({subStep, complete, subStepComplete}) => {
      return (!complete || complete && subStepComplete === false)
    })
  }

  displayNextStep() {
    const { steps=[] } = this.state
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
        if (step.complete) return {...step, subStepComplete: true}
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
    const { complete, subStep } = currentStep
    const selected = (name) => {
      const firstIncompleteStep = this.firstIncompleteStep()
      const matchingStep = firstIncompleteStep.name === name

      return matchingStep ? 'selected' : ''
    }

    const step = complete && subStep ? subStep : currentStep

    return (
      <div
        ref={el => (this.el = el)}
        className={`modal fade`}
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog onboarding-modal">
          <div className="modal-content d-flex">
            <div className="row">
              <div className="flex-column col-4 text-left left-panel">
                { steps && steps.map(({name, description}, i) => (
                  <div key={name} className={`content ${selected(name)}`}>
                    <div className="oval rounded-circle"> </div>
                    <span>{name}</span>
                    <p className="text-muted">{description}</p>
                  </div>
                ))}
              </div>
              <RightPanel
                displayNextStep={this.displayNextStep}
                step={step}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default OnboardingModal
