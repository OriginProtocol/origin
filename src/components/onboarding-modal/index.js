import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'

import { updateSteps, fetchSteps, toggleSplitPanel, toggleLearnMore } from 'actions/Onboarding'
import SplitPanel from './split-panel'
import Modal from 'components/modal'
import steps from './steps'

class OnboardingModal extends Component {
  constructor(props) {
    super(props)

    this.closeModal = this.closeModal.bind(this)
  }

  async componentWillMount() {
    const { fetchSteps, onboarding } = this.props
    await fetchSteps()

    if (!onboarding.stepsCompleted) {
      this.userProgress()
    }
  }

  componentDidUpdate(prevProps) {
    const { onboarding } = this.props

    if (!onboarding.stepsCompleted && onboarding.progress) this.addModalClass()
    //need to update user progress here
    this.removeModalClasses()
  }

  componentWillUnmount() {
    this.removeModalClasses()
  }


  closeModal(name = 'toggleSplitPanel') {
    return () => {
      this.props[name](false)
    }
  }

  addModalClass() {
    window.scrollTo(0, 0)
    window.setTimeout(() => {
      document.body.classList.add('modal-open')
    }, 500)
  }

  removeModalClasses() {
    const { onboarding } = this.props

    if (!onboarding.stepsCompleted && onboarding.progres) {
      document.body.classList.remove('modal-open')
      const backdrop = document.getElementsByClassName('modal-backdrop')

      backdrop.length && backdrop[0].classList.remove('modal-backdrop')
    }
  }

  userProgress() {
    const { onboarding: { progress, stepsCompleted }, toggleLearnMore, toggleSplitPanel, initialAlert } = this.props
    if (initialAlert) {
      if (!stepsCompleted || !progress) {
        return toggleLearnMore(true)
      } else if (!stepsCompleted && progress) {
        return toggleSplitPanel(true)
      }
    }
    this.props.toggleLearnMore(false)
  }

  render() {
    const { updateSteps, onboarding: { currentStep, learnMore, splitPanel } } = this.props

    const learnMoreContent = (
      <div>
        <div className="text-right">
          <span className="close-icon" alt="close-icon" onClick={this.closeModal('toggleLearnMore')}>&#215;</span>
        </div>
        <img src="/images/eth-tokens.svg" alt="eth-tokens" />
        <p className="title">Get Started Selling on Origin!</p>
        <p className="content">Learn how to sell on our DApp today.</p>

        <div className="col-auto">
          <button className="btn btn-primary btn-lg" onClick={() => this.props.toggleSplitPanel(true)}>Learn more</button>
        </div>
      </div>
    )

    return (
      <div className="onboarding">
        {learnMore && (
          <Modal
            className={'getting-started'}
            isOpen={learnMore}
            children={learnMoreContent}
            backdrop={'noop'}
          />
        )}
        {splitPanel && (
          <Fragment>
            <SplitPanel
              isOpen={splitPanel}
              currentStep={currentStep}
              steps={steps}
              updateSteps={updateSteps}
              closeModal={this.closeModal('toggleSplitPanel')}
            />
            <div
              className={'modal-backdrop fade show'}
              role="presentation"
            />
          </Fragment>
        )}
      </div>
    )
  }
}

const mapStateToProps = ({ onboarding }) => ({ onboarding })

const mapDispatchToProps = dispatch => ({
  updateSteps: ({ incompleteStep, stepsCompleted }) => dispatch(updateSteps({ incompleteStep, stepsCompleted })),
  fetchSteps: () => dispatch(fetchSteps()),
  toggleSplitPanel: (show) => dispatch(toggleSplitPanel(show)),
  toggleLearnMore: (show) => dispatch(toggleLearnMore(show))
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(OnboardingModal)
)
