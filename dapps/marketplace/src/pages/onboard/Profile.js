import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import pick from 'lodash/pick'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'
import withIsMobile from 'hoc/withIsMobile'
import MobileModal from 'components/MobileModal'
import EditProfile from 'pages/user/_EditProfile'

import DeployIdentity from 'pages/identity/mutations/DeployIdentity'

import Redirect from 'components/Redirect'
import HelpOriginWallet from './_HelpOriginWallet'
import ListingPreview from './_ListingPreview'
import HelpProfile from './_HelpProfile'

import { getVerifiedAccounts, clearVerifiedAccounts } from 'utils/profileTools'

class OnboardProfile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      finished: false,
      back: false
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.identity) {
      this.setState({
        finished: true
      })
    } else if (this.props.walletProxy !== prevProps.walletProxy) {
      const storedAccounts = getVerifiedAccounts({
        wallet: this.props.walletProxy
      })
      if (storedAccounts && storedAccounts.emailAttestation) {
        this.setState({
          attestations: [storedAccounts.emailAttestation]
        })
      } else {
        this.setState({
          back: true
        })
      }
    }
  }

  render() {
    const { linkPrefix } = this.props
    const { finished, back, signTxModal } = this.state

    if (finished) {
      return <Redirect to={`${linkPrefix}/onboard/rewards`} />
    } else if (back) {
      return <Redirect to={`${linkPrefix}/onboard/email`} />
    }

    return (
      <>
        {signTxModal && this.renderSignTxModal()}
        {this.renderContent()}
      </>
    )
  }

  renderContent() {
    const { isMobile, listing, hideOriginWallet } = this.props
    const content = (
      <EditProfile
        onChange={data => this.onChange(data)}
        onAvatarChange={data => this.onAvatarChange(data)}
        onClose={() => this.onCompleted()}
        onboarding={true}
      />
    )

    if (isMobile) {
      return (
        <MobileModal
          title={fbt('Add name & photo', 'onboard.Profile.addNameAndPhoto')}
          onBack={() => this.onBack()}
          className="profile-bio"
        >
          {content}
        </MobileModal>
      )
    }

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
            <div className="onboard-box profile-bio">
              <div className="pt-3">{content}</div>
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

  renderSignTxModal() {
    const { walletType } = this.props
    const { shouldCloseSignTxModal, attestations } = this.state

    return (
      <MobileModal
        headerImageUrl="images/onboard/tout-header-image@3x.png"
        closeOnEsc={false}
        shouldClose={shouldCloseSignTxModal}
        className="user-activation sign-tx-modal onboarding text-center"
        fullscreen={false}
        onClose={() =>
          this.setState({
            signTxModal: false
          })
        }
      >
        <div className="padded-content">
          <h2>
            <fbt desc="UserActivation.signToPublish">Sign to Publish</fbt>
          </h2>
          <p>
            {fbt(
              fbt.param('walletType', walletType) +
                ' will now ask you to sign your profile creation data.',
              'UserActivation.signToCreateWallet'
            )}
          </p>
          <div className="actions">
            <DeployIdentity
              className="btn btn-primary btn-rounded mt-3 mb-3"
              identity={this.props.wallet}
              profile={pick(this.state, ['firstName', 'lastName', 'avatarUrl'])}
              attestations={attestations}
              children={fbt('Got it', 'Got it')}
              skipSuccessScreen={true}
              onComplete={() => {
                clearVerifiedAccounts()
                this.setState({
                  finished: true
                })
              }}
              onClose={() => {
                this.setState({
                  shouldCloseSignTxModal: true
                })
              }}
            />
          </div>
        </div>
      </MobileModal>
    )
  }

  onChange(data) {
    if (data) {
      this.setState({
        firstName: data.firstName,
        lastName: data.lastName
      })
    }
  }

  onAvatarChange(avatarUrl) {
    this.setState({
      avatarUrl
    })
  }

  onBack() {
    clearVerifiedAccounts()
    this.setState({
      back: true
    })
  }

  onCompleted() {
    this.setState({
      signTxModal: true
    })
  }
}

export default withIsMobile(withWallet(withIdentity(OnboardProfile)))

require('react-styl')(`
  .onboard .onboard-box.profile-bio
    padding: 2rem 1rem
    .onboarding
      max-width: 400px
  .modal-content.profile-bio .onboarding
    .form-group, input
      text-align: center

  @media (max-width: 767.98px)
    .onboard .onboard-box.profile-bio
      > form .image-cropper
        max-width: 6rem
`)
