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

  changeStep(currentStep) {
    this.setState({ currentStep })
  }

  displayNextStep() {
    const { currentStep, steps=[] } = this.state
    const firstIncompleteStep = steps.find((step) => !step.complete)

    if (!firstIncompleteStep) return

    const currentIndex = steps.indexOf(currentStep)
    const displayNextStep = steps[currentIndex+1]
    const updateSteps = (step) => {
      if (step === firstIncompleteStep) {
        return {...step, complete: true}
      }
      return step
    }

    this.setState((state) => ({
      ...state,
      steps: steps.map(updateSteps),
      currentStep: displayNextStep
    }))
  }

  render() {
    const { currentStep, steps } = this.state

    const selected = (name) => {
      const firstIncompleteStep = steps.find((step) => !step.complete)
      if (!firstIncompleteStep) return
      return firstIncompleteStep.name === name && 'selected'
    }

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
                currentStep={currentStep}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default OnboardingModal
