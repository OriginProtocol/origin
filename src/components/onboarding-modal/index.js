import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'

import {
  updateSteps,
  fetchSteps,
  toggleSplitPanel,
  toggleLearnMore
} from 'actions/Onboarding'
import SplitPanel from './split-panel'
import Modal from 'components/modal'
import steps from './steps'

class OnboardingModal extends Component {
  constructor(props) {
    super(props)

    this.closeModal = this.closeModal.bind(this)
    this.state = { gettingStarted: true }
  }

  async componentWillMount() {
    const { fetchSteps } = this.props
    await fetchSteps()
  }

  componentDidUpdate() {
    const { wallet } = this.props

    if (wallet.initialized) {
      this.userProgress()
    }
  }

  componentWillUnmount() {
    this.removeModalClasses()
  }

  closeModal(name = 'toggleSplitPanel') {
    return () => {
      if (name === 'toggleSplitPanel') {
        document.body.classList.remove('modal-open')
      }
      this.setState({ gettingStarted: false })
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
    document.body.classList.remove('modal-open')

    const backdrop = document.getElementsByClassName('modal-backdrop')
    backdrop.length && backdrop[0].classList.remove('modal-backdrop')
  }

  userProgress() {
    const {
      onboarding: { progress, learnMore, stepsCompleted, splitPanel },
      toggleLearnMore,
      toggleSplitPanel,
      wallet
    } = this.props
    const { gettingStarted } = this.state

    const userHasWallet = wallet.address || stepsCompleted
    const userWithoutWallet = !progress && !learnMore && gettingStarted
    const userOnboardingInProgress = progress && gettingStarted

    if (userHasWallet) {
      if (!learnMore) return
      this.removeModalClasses()
      return toggleLearnMore(false)
    }

    if (userOnboardingInProgress) {
      this.addModalClass()
      if (!splitPanel) {
        toggleSplitPanel(true)
      }
    } else if (userWithoutWallet) {
      this.removeModalClasses()
      toggleLearnMore(true)
    } else {
      this.removeModalClasses()
    }
  }

  render() {
    const {
      updateSteps,
      onboarding: { currentStep, learnMore, splitPanel }
    } = this.props

    const learnMoreContent = (
      <div>
        <div className="text-right">
          <span
            className="close-icon"
            alt="close-icon"
            onClick={this.closeModal('toggleLearnMore')}
          >
            &#215;
          </span>
        </div>
        <img src="/images/eth-tokens.svg" alt="eth-tokens" />
        <p className="title">Get Started Selling on Origin!</p>
        <p className="content">Learn how to sell on our DApp today.</p>

        <div className="col-auto">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => this.props.toggleSplitPanel(true)}
          >
            Learn more
          </button>
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
            backdrop={false}
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
            <div className={'modal-backdrop fade show'} role="presentation" />
          </Fragment>
        )}
      </div>
    )
  }
}

const mapStateToProps = ({ onboarding, wallet }) => ({ onboarding, wallet })

const mapDispatchToProps = dispatch => ({
  updateSteps: ({ incompleteStep, stepsCompleted }) =>
    dispatch(updateSteps({ incompleteStep, stepsCompleted })),
  fetchSteps: () => dispatch(fetchSteps()),
  toggleSplitPanel: show => dispatch(toggleSplitPanel(show)),
  toggleLearnMore: show => dispatch(toggleLearnMore(show))
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(OnboardingModal)
)
