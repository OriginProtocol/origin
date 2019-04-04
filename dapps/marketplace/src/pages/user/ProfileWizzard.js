import React, { Component, Fragment } from 'react'
import { fbt } from 'fbt-runtime'

import Enum from 'utils/enum'
import { profileEmpty } from 'utils/profileTools'
import DeployIdentity from 'pages/identity/mutations/DeployIdentity'
import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'

const WizzardStep = new Enum(
  'Publish',
  'RewardsEnroll',
  'SetOriginProfile'
)

class ProfileWizzard extends Component {
	constructor(props) {
    super(props)
    this.state = {
      uiStep: WizzardStep.Publish,
      publishChanges: false,
      skipRewardsEnroll: false
    }

    this.EnrollButton = withEnrolmentModal('button')
  }

  componentDidUpdate(prevProps) {
    const {
      publishedProfile,
      currentProfile,
      unpublishedStrength,
      publishedStrength
    } = this.props

    const {
      skipRewardsEnroll
    } = this.state

    if (profileEmpty(publishedProfile) && profileEmpty(currentProfile) && !skipRewardsEnroll) {
      this.updateUiStepIfNecessary(WizzardStep.RewardsEnroll)
    } else if (profileEmpty(publishedProfile) && profileEmpty(currentProfile)) {
      this.updateUiStepIfNecessary(WizzardStep.SetOriginProfile)
    } else {
      this.updateUiStepIfNecessary(WizzardStep.Publish)
    }

    if (unpublishedStrength !== publishedStrength && !this.state.publishChanges) {
      this.setState({
        publishChanges: true
      })
    }
    if (unpublishedStrength === publishedStrength && this.state.publishChanges) {
      this.setState({
        publishChanges: false
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
            Next Step: Upload a photo and provide a name and description
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

export default ProfileWizzard

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


`)