import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import {
  updateSteps,
  fetchSteps,
  toggleSplitPanel,
  toggleLearnMore
} from 'actions/Onboarding'
import { getOgnBalance } from 'actions/Wallet'

import Modal from 'components/modal'

import { getListing } from 'utils/listing'

import SplitPanel from './split-panel'
import steps from './steps'

import origin from '../../services/origin'

class OnboardingModal extends Component {
  constructor(props) {
    super(props)

    this.closeModal = this.closeModal.bind(this)
    this.state = {
      dismissed: false,
      gettingStarted: true,
      listings: [],
      listingsDetected: false,
      stepsFetched: false
    }
  }

  async componentDidUpdate() {
    const { fetchSteps, wallet } = this.props

    // wait for wallet to be loaded
    if (!wallet.initialized) {
      return
    }

    // check for listings before doing anything else
    if (!this.state.listingsDetected) {
      const listings = await this.loadListings()

      return this.setState({
        listingsDetected: true,
        listings
      })
    }

    // only get the steps once
    if (!this.state.stepsFetched) {
      this.setState({ stepsFetched: true })

      await fetchSteps()

      return
    }

    this.userProgress()
  }

  componentWillUnmount() {
    this.removeModalClasses()
  }

  closeModal(name = 'toggleSplitPanel') {
    return () => {
      if (name === 'toggleSplitPanel') {
        document.body.classList.remove('modal-open')
      }
      this.setState({ dismissed: true, gettingStarted: false })
      this.props[name](false)
    }
  }

  addModalClass() {
    window.scrollTo(0, 0)
    window.setTimeout(() => {
      document.body.classList.add('modal-open')
    }, 500)
  }

  async loadListings() {
    try {
      const { address } = this.props.wallet

      if (!address) {
        return []
      }

      const ids = await origin.marketplace.getListings({
        idsOnly: true,
        listingsFor: address
      })
      const listings = await Promise.all(
        ids.map(id => {
          return getListing(id, true)
        })
      )

      return listings
    } catch (error) {
      console.error('Error fetching listing ids')
    }
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
      wallet: { ognBalance }
    } = this.props
    const { dismissed, gettingStarted, listings = [] } = this.state

    // show nothing if user has OGN, listings, or completed onboarding
    if (!!Number(ognBalance) || listings.length || stepsCompleted) {
      learnMore && toggleLearnMore(false)
      splitPanel && toggleSplitPanel(false)
      return this.removeModalClasses()
    }

    const onboardingInProgress = progress && gettingStarted

    if (onboardingInProgress) {
      this.addModalClass()

      !splitPanel && toggleSplitPanel(true)
    } else if (!progress && !dismissed) {
      !learnMore && toggleLearnMore(true)
    }
  }

  render() {
    const {
      updateSteps,
      onboarding: { blocked, currentStep, learnMore, splitPanel }
    } = this.props

    const learnMoreContent = (
      <Fragment>
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
        <p className="title">
          <FormattedMessage
            id={'getting-started.title'}
            defaultMessage={'Get started selling on Origin!'}
          />
        </p>
        <p className="content">
          <FormattedMessage
            id={'getting-started.content'}
            defaultMessage={'Learn how to sell on our DApp today.'}
          />
        </p>

        <div className="col-auto">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => this.props.toggleSplitPanel(true)}
          >
            <FormattedMessage
              id={'getting-started.button'}
              defaultMessage={'Learn More'}
            />
          </button>
        </div>
      </Fragment>
    )

    return blocked ? null : (
      <div className="onboarding">
        {learnMore && (
          <Modal
            className={'getting-started'}
            isOpen={true}
            children={learnMoreContent}
            backdrop={false}
          />
        )}
        {splitPanel && (
          <div className="split-container d-flex align-items-center justify-content-center">
            <SplitPanel
              isOpen={true}
              currentStep={currentStep}
              steps={steps}
              updateSteps={updateSteps}
              closeModal={this.closeModal('toggleSplitPanel')}
            />
            <div className="modal-backdrop fade show" role="presentation" />
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = ({ onboarding, wallet }) => ({ onboarding, wallet })

const mapDispatchToProps = dispatch => ({
  fetchSteps: () => dispatch(fetchSteps()),
  getOgnBalance: () => dispatch(getOgnBalance()),
  toggleSplitPanel: show => dispatch(toggleSplitPanel(show)),
  toggleLearnMore: show => dispatch(toggleLearnMore(show)),
  updateSteps: ({ incompleteStep, stepsCompleted }) =>
    dispatch(updateSteps({ incompleteStep, stepsCompleted }))
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(OnboardingModal)
)
