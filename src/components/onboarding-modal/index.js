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

  componentDidMount() {
    this.props.fetchSteps()
    this.removeModalClasses()
    this.userProgress()
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen) this.addModalClass()
    if (prevProps.onboarding.learnMore !== this.props.onboarding.learnMore) {
      // this.setState({ ...this.props.onboarding })
      this.userProgress()
    }

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
    if (!this.props.isOpen) {
      document.body.classList.remove('modal-open')
      const backdrop = document.getElementsByClassName('modal-backdrop')

      backdrop.length && backdrop[0].classList.remove('modal-backdrop')
    }
  }

  userProgress() {
    const { onboarding: { progress, completed }, toggleLearnMore, toggleSplitPanel, initialAlert } = this.props
    if (initialAlert) {
      if (!progress) {
        // this.addModalClass()
        return toggleLearnMore(true)
      } else if (!completed && progress) {
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
  updateSteps: (currentStep) => dispatch(updateSteps(currentStep)),
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
