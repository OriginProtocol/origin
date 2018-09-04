import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'

import { updateSteps, fetchSteps } from 'actions/Onboarding'
import SplitPanel from './split-panel'
import Modal from 'components/modal'
import steps from './steps'

const hasKeys = (obj) => !!Object.keys(obj).length

class OnboardingModal extends Component {
  constructor(props) {
    super(props)

    this.state = { learnMore: false, isOpen: false }
  }

  componentDidMount() {
    this.props.fetchSteps()
    this.removeModalClasses()
    this.userProgress()
  }

  componentDidUpdate() {
    if (this.props.isOpen) this.addModalClass()

    this.removeModalClasses()
  }

  componentWillUnmount() {
    this.removeModalClasses()
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
    const { learnMore, onboarding: { currentStep } } = this.props

    if (learnMore) {
      if (hasKeys(currentStep)) {
        this.addModalClass()
        this.setState({ isOpen: true })
      } else {
        this.setState({ learnMore: true })
      }
    }
  }

  render() {
    const { closeModal, openOnBoardingModal, onboarding, updateSteps } = this.props
    const { learnMore, isOpen } = this.state
    const learnMoreContent = (
      <div>
        <div className="text-right">
          <span className="close-icon" alt="close-icon" onClick={closeModal('learnMore')}>&#215;</span>
        </div>
        <img src="/images/eth-tokens.svg" alt="eth-tokens" />
        <p className="title">Get Started Selling on Origin!</p>
        <p className="content">Learn how to sell on our DApp today.</p>

        <div className="col-auto">
          <button className="btn btn-primary btn-lg" onClick={() => openOnBoardingModal()}>Learn more</button>
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
        {isOpen && (
          <Fragment>
            <SplitPanel
              isOpen={isOpen}
              onboarding={onboarding}
              updateSteps={updateSteps}
              closeModal={closeModal('onBoardingModal')}
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

const mapStateToProps = state => ({
  onboarding: state.onboarding
})

const mapDispatchToProps = dispatch => ({
  updateSteps: (currentStep) => dispatch(updateSteps(currentStep)),
  fetchSteps: () => dispatch(fetchSteps())
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(OnboardingModal)
)
