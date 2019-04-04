import React, { Component, Fragment } from 'react'
import { fbt } from 'fbt-runtime'
import { withApollo, Query } from 'react-apollo'
import get from 'lodash/get'

import Enum from 'utils/enum'
import { changesToPublishExist } from 'utils/profileTools'
import DeployIdentity from 'pages/identity/mutations/DeployIdentity'
import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'

import enrollmentStatusQuery from 'queries/EnrollmentStatus'
import profileQuery from 'queries/Profile'

const WizzardStep = new Enum(
  'Publish',
  'RewardsEnroll',
  'SetOriginProfile',
  'SetEmail',
  'SetPhoneNumber',
  'VerifyYourOtherProfiles'
)

class ProfileWizzard extends Component {
	constructor(props) {
    super(props)
    this.state = {
      uiStep: WizzardStep.Publish,
      publishChanges: false,
      skipRewardsEnroll: false,
      skipVerifyOtherProfiles: false,
      userEnroledIntoRewards: false
    }

    this.EnrollButton = withEnrolmentModal('button')
    this.componentIsMounted = false
    setTimeout(() => this.calculateUIStep(), 1)
  }

  async componentDidMount() {
    this.componentIsMounted = true
    const profileResult = await this.props.client.query({
      query: profileQuery
    })
    const accountId = get(profileResult, 'data.web3.primaryAccount.id')
    if (!accountId)
      return

    const enrolmentResult = await this.props.client.query({
      query: enrollmentStatusQuery,
      variables: {
        walletAddress: accountId
      }
    })

    const enrolmentStatus = get(enrolmentResult, 'data.enrollmentStatus')

    if (enrolmentStatus === 'Enrolled' && this.componentIsMounted) {
      this.setState({
        userEnroledIntoRewards: true
      })
    }
  }

  componentWillUnmount() {
    this.componentIsMounted = false
  }

  componentDidUpdate() {
    this.calculateUIStep()
  }

  calculateUIStep() {
    const {
      publishedProfile,
      currentProfile,
      changesToPublishExist,
      publishedStrength
    } = this.props

    const {
      skipRewardsEnroll,
      skipVerifyOtherProfiles,
      userEnroledIntoRewards
    } = this.state

    const meetsCritria = ({ originProfile=false, email=false, phone=false, allAttestations=false }) => {
      const isOriginProfile = (profile) => {
        return profile.firstName && profile.lastName && profile.description
      }
      const hasEmailAttestation = (profile) => {
        return profile.emailVerified || profile.emailAttestation
      }
      const hasPhoneAttestation = (profile) => {
        return profile.phoneVerified || profile.phoneAttestation
      }

      const hasAllAttestation = (profile) => {
        return 
          (profile.emailVerified || profile.emailAttestation) &&
          (profile.phoneVerified || profile.phoneAttestation) &&
          (profile.facebookVerified || profile.facebookAttestation) &&
          (profile.twitterVerified || profile.twitterAttestation) &&
          (profile.airbnbVerified || profile.airbnbAttestation)
      }

      if (originProfile && !(isOriginProfile(currentProfile) || isOriginProfile(publishedProfile))) {
        return false
      }

      if (email && !(hasEmailAttestation(currentProfile) || hasEmailAttestation(publishedProfile))) {
        return false
      }

      if (phone && !(hasPhoneAttestation(currentProfile) || hasPhoneAttestation(publishedProfile))) {
        return false
      }

      if (allAttestations && !(hasAllAttestation(currentProfile) || hasAllAttestation(publishedProfile))) {
        return false
      }

      return true
    }

    if (meetsCritria({ originProfile: true, email: true, phone: true, allAttestations: true })) {
      this.updateUiStepIfNecessary(WizzardStep.Publish)
    } else if (meetsCritria({ originProfile: true, email: true, phone: true }) && skipVerifyOtherProfiles) {
      this.updateUiStepIfNecessary(WizzardStep.Publish)
    } else if (meetsCritria({ originProfile: true, email: true, phone: true })) {
      this.updateUiStepIfNecessary(WizzardStep.VerifyYourOtherProfiles)
    } else if (meetsCritria({ originProfile: true, email: true })) {
      this.updateUiStepIfNecessary(WizzardStep.SetPhoneNumber)
    } else if (meetsCritria({ originProfile: true })) {
      this.updateUiStepIfNecessary(WizzardStep.SetEmail)
    } else if (!skipRewardsEnroll && !userEnroledIntoRewards) {
      this.updateUiStepIfNecessary(WizzardStep.RewardsEnroll)
    } else {
      this.updateUiStepIfNecessary(WizzardStep.SetOriginProfile)
    }

    if (changesToPublishExist !== this.state.publishChanges) {
      this.setState({
        publishChanges: changesToPublishExist
      })
    }
  }

  updateUiStepIfNecessary(wizzardStep) {
    if (this.state.uiStep !== wizzardStep) {
      this.setState({
        uiStep: wizzardStep
      })
    }
  }

  renderVerifyYourOtherProfiles() {
    return "lala1"
  }

  renderSetPhoneNumber() {
    return "lala2"
  }

  renderSetEmail() {
    return "lala3"
  }

  renderPublishChanges(buttonTextOption) {
  	const props = this.props.deployIdentityProps
  	if (buttonTextOption) {
  		props.children = buttonTextOption
  	}

  	return (<div className="mr-auto ml-auto">
      <DeployIdentity {...props} />    
    </div>)
  }

  renderPublish() {
    return this.renderPublishChanges(
      fbt('Publish Changes', 'ProfileWizzard.PublishChanges')
    )
  }

  renderRewardsEnroll() {
    return (
      <Fragment>
        <div className="title">
          <fbt desc="ProfileWizzard.EnrollToEarn">
            Enroll to earn Origin cryptocurrency tokens (OGN)
          </fbt>
        </div>
        <div className="sub-title">
          <fbt desc="ProfileWizzard.EarnByCompletingYourProfile">
            Earn tokens by completing your profile.
          </fbt>
        </div>
        <this.EnrollButton
          className="btn btn-primary btn-rounded mr-auto ml-auto mt-3 pl-5 pr-5 pt-2 pb-2"
          skipjoincampaign="false"
        >
          <fbt desc="ProfileWizzard.EnrollNow">
            Enroll Now
          </fbt>
        </this.EnrollButton>
        <button
          className="skip ml-auto mr-auto p-2"
          onClick={() =>
            this.setState({ skipRewardsEnroll: true })
          }
        >
          <fbt desc="ProfileWizzard.skip">
            Skip
          </fbt>
        </button>
      </Fragment>
    )
  }

  renderSetOriginProfile() {
    return (
      <Fragment>
        <div className="title">
          <fbt desc="ProfileWizzard.OriginProfileStep">
            Upload a photo and provide a name and description
          </fbt>
        </div>
        <button
          className="btn btn-primary btn-rounded mr-auto ml-auto mt-3 pl-5 pr-5 pt-2 pb-2"
          onClick={(e) => this.props.openEditProfile(e)}
        >
          <fbt desc="ProfileWizzard.getStarted">
            Get Started
          </fbt>
        </button>
      </Fragment>
    )
  }

  render() {
    const {
      uiStep,
      publishChanges
    } = this.state

    return (
      <Fragment>
        {uiStep === WizzardStep.Publish && this.renderPublish()}
        {uiStep !== WizzardStep.Publish &&  <div className="profile-wizzard-box d-flex flex-column justify-content-center pl-4 pr-4 pt-4">
          {this[`render${uiStep}`]()}
          <div className="status-bar d-flex justify-content-end">
            {publishChanges && <div className="publish-changes d-flex align-items-center mr-auto ml-3">
              <div className="indicator mr-2"/>
              <fbt desc="ProfileWizzard.unpublishedChanges">
                You have unpublished changes
              </fbt>
            </div>}
            <div className="origin-id d-flex align-items-center">
              <fbt desc="ProfileWizzard.poweredBy">
                Powered by
              </fbt>
              <img className="ml-2 mr-3" src="images/origin-id-logo.svg" />
            </div>
          </div>
        </div>}
      </Fragment>
    )
  }
}

export default withApollo(ProfileWizzard)

require('react-styl')(`
	.profile-wizzard-box
    background-color: white
    border-radius: 5px
    border: 1px solid var(--light)
    min-height: 190px
    position: relative
    padding-bottom: 35px
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


`)