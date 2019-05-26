import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import { withApollo } from 'react-apollo'

import Enum from 'utils/enum'
import DeployIdentity from 'pages/identity/mutations/DeployIdentity'
import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'
import { getAttestationReward } from 'utils/growthTools'
// import { rewardsOnMobileEnabled } from 'constants/SystemInfo'
import withGrowthCampaign from 'hoc/withGrowthCampaign'
import withTokenBalance from 'hoc/withTokenBalance'

const WizardStep = new Enum('Publish', 'VerifyPhone', 'VerifyYourOtherProfiles')

class ProfileWizard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      uiStep: WizardStep.VerifyPhone,
      publishChanges: false
    }

    this.EnrollButton = withEnrolmentModal('button')
  }

  componentDidUpdate(prevProps) {
    if (
      !this.hasPhoneAttestation(prevProps.currentProfile) &&
      this.hasPhoneAttestation(this.props.currentProfile)
    ) {
      this.setState({
        uiStep: WizardStep.VerifyYourOtherProfiles,
        publishChanges: true
      })
    } else if (this.props.changesToPublishExist !== this.state.publishChanges) {
      this.setState({
        publishChanges: this.props.changesToPublishExist
      })
    }
  }

  hasPhoneAttestation(profile) {
    return profile.phoneVerified || profile.phoneAttestation
  }

  renderVerifyYourOtherProfiles() {
    return (
      <>
        <div className="title">
          <fbt desc="ProfileWizard.VerifyOtherProfiles">
            Verify your other profiles
          </fbt>
        </div>
        <div className="sub-title">
          <fbt desc="ProfileWizard.EarnEvenMoreOgnOtherProfiles">
            Earn even more OGN when you verify your Facebook, Twitter, and
            Airbnb profiles.
          </fbt>
        </div>
        {this.attestationRewardsAvailable() && (
          <div className="d-flex rewards justify-content-center mt-2">
            <div>
              <fbt desc="ProfileWizard.earnUpTo">Earn up to</fbt>
            </div>
            <div className="d-flex align-items-center">
              <div className="icon" />
              <div className="ogn-coin">
                {(
                  getAttestationReward({
                    growthCampaigns: this.props.growthCampaigns,
                    attestation: 'Airbnb',
                    tokenDecimals: this.props.tokenDecimals || 18
                  }) +
                  getAttestationReward({
                    growthCampaigns: this.props.growthCampaigns,
                    attestation: 'Facebook',
                    tokenDecimals: this.props.tokenDecimals || 18
                  }) +
                  getAttestationReward({
                    growthCampaigns: this.props.growthCampaigns,
                    attestation: 'Twitter',
                    tokenDecimals: this.props.tokenDecimals || 18
                  })
                ).toString()}
                &nbsp;
                <span>OGN</span>
              </div>
            </div>
          </div>
        )}
        <div className="d-flex mr-auto ml-auto mt-3">
          <button
            className="btn btn-primary btn-rounded pl-5 pr-5 pt-2 pb-2"
            onClick={e => {
              e.preventDefault()
              this.setState({
                uiStep: WizardStep.Publish
              })
            }}
          >
            <fbt desc="ProfileWizard.gotIt!">Got it!</fbt>
          </button>
        </div>
      </>
    )
  }

  renderPublishChanges(buttonTextOption) {
    const props = this.props.deployIdentityProps
    if (buttonTextOption) {
      props.children = buttonTextOption
    }

    return (
      <div className="mr-auto ml-auto">
        <DeployIdentity {...props} disabled={!this.state.publishChanges} />
      </div>
    )
  }

  renderPublish() {
    return this.renderPublishChanges(
      fbt('Publish Changes', 'ProfileWizard.PublishChanges')
    )
  }

  renderVerifyPhone() {
    const continueButton =
      this.props.growthEnrollmentStatus === 'Enrolled' ? (
        <button
          className="btn btn-primary btn-rounded mr-auto ml-auto mt-3 pl-5 pr-5 pt-2 pb-2"
          onClick={this.props.onEnrolled}
        >
          <fbt desc="ProfileWizard.EnrollNow">Continue</fbt>
        </button>
      ) : (
        <this.EnrollButton
          className="btn btn-primary btn-rounded mr-auto ml-auto mt-3 pl-5 pr-5 pt-2 pb-2"
          skipjoincampaign="true"
          onCompleted={this.props.onEnrolled}
        >
          <fbt desc="ProfileWizard.EnrollNow">Continue</fbt>
        </this.EnrollButton>
      )
    return (
      <>
        <div className="title">
          <fbt desc="ProfileWizard.VerifyPhoneToEarn">
            Verify your phone number &amp; earn OGN
          </fbt>
        </div>
        <div className="sub-title">
          <fbt desc="ProfileWizard.strengthenProfile">
            Strengthen your profile even further by verifying a valid 10-digit
            phone number.
          </fbt>
        </div>
        <div className="reward-text">
          <fbt desc="ProfileWizard.verifyToWarn">
            Verify to earn <span className="reward-amount">10 OGN</span>
          </fbt>
        </div>
        {continueButton}
      </>
    )
  }

  attestationRewardsAvailable() {
    return (
      this.props.growthEnrollmentStatus === 'Enrolled' &&
      this.props.growthCampaigns
    )
  }

  render() {
    const { uiStep, publishChanges } = this.state
    const { growthEnrollmentStatus, currentProfile } = this.props

    if (
      (growthEnrollmentStatus === 'Enrolled' &&
        this.hasPhoneAttestation(currentProfile)) ||
      localStorage.useWeb3Identity
    )
      return this.renderPublish()

    return (
      <div className="profile-wizard-box d-flex flex-column justify-content-center pl-4 pr-4 pt-4">
        {this[`render${uiStep}`]()}
        <div className="status-bar d-flex justify-content-end">
          {publishChanges && (
            <div className="publish-changes d-flex align-items-center mr-auto ml-3">
              <div className="indicator mr-2" />
              <fbt desc="ProfileWizard.unpublishedChanges">
                You have unpublished changes
              </fbt>
            </div>
          )}
          <div className="origin-id d-flex align-items-center">
            <fbt desc="ProfileWizard.poweredBy">Powered by</fbt>
            <img className="ml-2 mr-3" src="images/origin-id-logo.svg" />
          </div>
        </div>
      </div>
    )
  }
}

export default withApollo(withGrowthCampaign(withTokenBalance(ProfileWizard)))

require('react-styl')(`
	.profile-wizard-box
    background-color: white
    border-radius: 5px
    border: 1px solid var(--light)
    min-height: 190px
    position: relative
    padding-bottom: 35px
    .btn-light
      border: 1px solid var(--clear-blue)
      background-color: white
      color: var(--clear-blue)
    .status-bar
      position: absolute
      bottom: 10px
      left: 0px
      width: 100%
      .origin-id
        font-size: 12px
        font-weight: 300
        color: var(--bluey-grey)
        img
          width: 60px
      .publish-changes
        font-size: 12px
        font-weight: 300
        color: var(--dark-blue-grey)
        .indicator
          width: 10px
          height: 10px
          border-radius: 10px
          background-color: var(--golden-rod)
    .title
      font-size: 24px
      font-weight: normal
      text-align: center
      color: var(--dark-blue-grey)
    .sub-title
      font-size: 16px
      font-weight: 300
      text-align: center
      color: var(--dark-blue-grey)
    .skip
      border: 0px
      font-size: 14px
      text-decoration: underline
      color: var(--dark-blue-grey)
      background-color: white
    .rewards
      font-size: 16px
      color: var(--dark-blue-grey)
      font-weight: normal
    .icon
      width: 1rem
      height: 1rem
      background: url(images/ogn-icon.svg) no-repeat center
      background-size: cover
      margin-right: 0.2rem
      margin-left: 0.5rem
    .ogn-coin
      font-size: 16px
      font-weight: bold
      color: var(--clear-blue)
  .reward-text
    margin-top: 1rem
    color: black
    font-size: 0.8rem
    .reward-amount
      color: #007bff
      &::before
        content: ''
        display: inline-block
        width: 1rem
        height: 1rem
        background: url(images/ogn-icon.svg) no-repeat center
        background-size: cover
        margin-right: 0.3rem
        margin-left: 0.5rem
        vertical-align: middle
`)
