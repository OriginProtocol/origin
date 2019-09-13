import React, { Component } from 'react'

import withIsMobile from 'hoc/withIsMobile'
import withWallet from 'hoc/withWallet'
import MobileModal from 'components/MobileModal'
import WithEnrolmentModal from 'pages/growth/WithEnrolmentModal'
import Redirect from 'components/Redirect'
import { fbt } from 'fbt-runtime'
import HelpOriginWallet from 'components/DownloadApp'
import ListingPreview from './_ListingPreview'
import HelpProfile from './_HelpProfile'

import LoadingSpinner from 'components/LoadingSpinner'

import Store from 'utils/store'

const localStore = Store('localStorage')

class OnboardRewardsSignUp extends Component {
  constructor(props) {
    super(props)

    this.EnrollButton = WithEnrolmentModal('button')

    this.state = {
      finished: false,
      confirmSkipModal: false,
      shouldCloseConfirmSkipModal: false
    }
  }

  render() {
    const {
      finished,
      confirmSkipModal,
      shouldCloseConfirmSkipModal
    } = this.state

    const { linkPrefix, skip, onSkip, wallet, walletLoading } = this.props

    if (walletLoading) {
      return <LoadingSpinner />
    }

    const onboardCompleted = localStore.get(`${wallet}-onboarding-completed`)

    if (onboardCompleted) {
      // Back to where you came from.
      return <Redirect to={`${linkPrefix}/onboard/back`} />
    }

    if (finished || skip) {
      localStore.set(`${wallet}-onboarding-completed`, true)
      return <Redirect to={`${linkPrefix}/onboard/finished`} />
    }

    return (
      <>
        {this.renderContent()}
        {confirmSkipModal && (
          <MobileModal
            closeOnEsc={false}
            shouldClose={shouldCloseConfirmSkipModal}
            className="user-activation confirm-skip-modal onboarding"
            fullscreen={false}
            onClose={() => {
              this.setState({
                confirmSkipModal: false
              })
            }}
            headerImageUrl="images/onboard/tout-header-image@3x.png"
          >
            {this.renderSkipConfirmModal({ onSkip })}
          </MobileModal>
        )}
      </>
    )
  }

  renderSkipConfirmModal({ onSkip }) {
    return (
      <div className="text-center">
        <h2>
          <fbt desc="UserActivation.confirmDontWantRewards">
            Are you sure you don’t want Origin Rewards?
          </fbt>
        </h2>
        <p>
          <fbt desc="UserActivation.verifyProfileWithoutEarning">
            You will not be able to earn OGN on Origin, but you can still verify
            your profile.
          </fbt>
        </p>
        <div className="actions">
          <button
            className="btn btn-primary btn-rounded mt-4"
            onClick={() => onSkip()}
          >
            <fbt desc="UserActivation.imSure">I&apos;m sure</fbt>
          </button>
          <button
            className="btn btn-outline btn-link"
            onClick={() => this.setState({ shouldCloseConfirmSkipModal: true })}
          >
            <fbt desc="UserActivation.noWait">No, wait</fbt>
          </button>
        </div>
      </div>
    )
  }

  renderRewardsSignUp() {
    const EnrollButton = this.EnrollButton
    return (
      <>
        <div className="my-5 text-center">
          <img
            src="images/onboard/rewards-logo.svg"
            className="onboard-rewards-logo"
          />
        </div>
        <div className="help desc mt-3 mb-3 text-center">
          <fbt desc="UserActivation.rewardsDesc">
            Earn Origin Tokens (OGN) by strengthening your profile and
            completing tasks in the Origin Marketplace.
          </fbt>
        </div>
        <div className="actions">
          <EnrollButton
            type="button"
            className="btn btn-primary btn-rounded my-3"
            children={fbt('Yes! Sign me up', 'UserActivation.signMeUp')}
            onCompleted={() => this.onCompleted()}
            onAccountBlocked={this.props.onAccountBlocked}
          />
          <button
            type="button"
            className="btn btn-outline btn-link mb-5"
            children={fbt('No, thanks', 'UserActivation.noThanks')}
            onClick={() =>
              this.setState({
                confirmSkipModal: true,
                shouldCloseConfirmSkipModal: false
              })
            }
          />
        </div>
      </>
    )
  }

  renderContent() {
    if (this.props.isMobile) {
      return (
        <>
          <MobileModal
            title={fbt('Get Rewards', 'UserActivation.getRewards')}
            onBack={() => this.onCompleted()}
            headerImageUrl={'images/onboard/ogn-image@3x.png'}
            className="rewards-signup"
          >
            {this.renderRewardsSignUp()}
          </MobileModal>
        </>
      )
    }

    const { listing, hideOriginWallet } = this.props

    return (
      <>
        <h1 className="mb-1">
          <fbt desc="onboard.Profile.createAccount">Create an Account</fbt>
        </h1>
        <p className="description mb-5">
          <fbt desc="onboard.Profile.description">
            Create a basic profile so others will know who you are in the Origin
            Marketplace.
          </fbt>
        </p>
        <div className="row">
          <div className="col-md-8">
            <div className="onboard-box profile-rewards">
              <img
                src="images/onboard/ogn-image@3x.png"
                className="rewards-signup-header-image"
              />
              <div className="pt-3">{this.renderRewardsSignUp()}</div>
            </div>
          </div>
          <div className="col-md-4">
            <ListingPreview listing={listing} />
            {hideOriginWallet ? null : <HelpOriginWallet />}
            <HelpProfile />
          </div>
        </div>
      </>
    )
  }

  onCompleted() {
    if (this.props.onCompleted) {
      this.props.onCompleted()
    }

    this.setState({
      finished: true
    })
  }
}

export default withIsMobile(withWallet(OnboardRewardsSignUp))

require('react-styl')(`
  .rewards-signup
    &.modal-header
      height: 200px
      .modal-title
        color: white
    &.modal-content
      padding: 1rem
      > .actions
        margin-top: auto
        > button
          width: 100%
  .onboard .onboard-box.profile-rewards
    padding: 0
    > img
      width: 100%
      height: 250px
      object-fit: cover
    .actions
      display: flex
      flex-direction: column
      margin: 0 auto
      max-width: 300px
`)
