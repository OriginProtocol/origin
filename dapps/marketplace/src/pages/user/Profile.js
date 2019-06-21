import React, { Component, Fragment } from 'react'
import pick from 'lodash/pick'
import pickBy from 'lodash/pickBy'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import { getProviderDisplayName } from 'utils/profileTools'

import {
  getAttestationReward,
  getMaxRewardPerUser,
  getTokensEarned
} from 'utils/growthTools'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'
import withGrowthCampaign from 'hoc/withGrowthCampaign'
import withAttestationProviders from 'hoc/withAttestationProviders'
import withIsMobile from 'hoc/withIsMobile'

import UserProfileCard from 'components/UserProfileCard'
import DocumentTitle from 'components/DocumentTitle'
import GrowthCampaignBox from 'components/GrowthCampaignBox'
import Earnings from 'components/Earning'
import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'
import AttestationBadges from 'components/AttestationBadges'
import UserActivationLink from 'components/UserActivationLink'

import PhoneAttestation from 'pages/identity/PhoneAttestation'
import EmailAttestation from 'pages/identity/EmailAttestation'
import AirbnbAttestation from 'pages/identity/AirbnbAttestation'
import WebsiteAttestation from 'pages/identity/WebsiteAttestation'
import OAuthAttestation from 'pages/identity/OAuthAttestation'

import EditProfile from './_EditModal'
import ToastNotification from './ToastNotification'
import VerifyProfileHelp from './_VerifyProfileHelp'
import DeployIdentity from 'pages/identity/mutations/DeployIdentity'

const withOAuthAttestationProvider = provider => {
  const WithOAuthAttestationProvider = props => {
    return <OAuthAttestation provider={provider} {...props} />
  }

  return WithOAuthAttestationProvider
}

const AttestationComponents = {
  phone: PhoneAttestation,
  email: EmailAttestation,
  facebook: withOAuthAttestationProvider('facebook'),
  twitter: withOAuthAttestationProvider('twitter'),
  airbnb: AirbnbAttestation,
  google: withOAuthAttestationProvider('google'),
  website: WebsiteAttestation,
  kakao: withOAuthAttestationProvider('kakao'),
  github: withOAuthAttestationProvider('github'),
  linkedin: withOAuthAttestationProvider('linkedin'),
  wechat: withOAuthAttestationProvider('wechat')
}

const ProfileFields = [
  'firstName',
  'lastName',
  'description',
  'avatarUrl',
  'strength',
  'attestations',
  'verifiedAttestations'
]

const resetAtts = Object.keys(AttestationComponents).reduce((m, o) => {
  m[`${o}Attestation`] = null
  return m
}, {})

function getState(profile) {
  return {
    firstName: '',
    lastName: '',
    description: '',
    avatarUrl: null,
    ...pickBy(pick(profile, ProfileFields), k => k)
  }
}

function profileDataUpdated(state, prevState) {
  return (
    state.firstName !== prevState.firstName ||
    state.lastName !== prevState.lastName ||
    state.description !== prevState.description ||
    state.avatarUrl !== prevState.avatarUrl
  )
}

class UserProfile extends Component {
  constructor(props) {
    super(props)
    const profile = get(props, 'identity')

    this.state = {
      ...resetAtts,
      ...getState(profile)
    }
    const activeAttestation = get(props, 'match.params.attestation')
    if (activeAttestation) {
      this.state[activeAttestation] = true
    }
  }

  componentDidUpdate(prevProps) {
    if (get(this.props, 'identity.id') !== get(prevProps, 'identity.id')) {
      this.setState(getState(get(this.props, 'identity')))
      if (!this.props.identity && !this.state.redirectToOnboarding) {
        this.setState({
          redirectToOnboarding: true
        })
      }
    }
    if (
      this.state.deployIdentity === 'profile' &&
      !profileDataUpdated(this.state, get(this.props, 'identity'))
    ) {
      this.setState({ deployIdentity: null })
    }
    if (
      !this.props.identityLoading &&
      prevProps.identityLoading &&
      !this.props.identity &&
      !this.state.redirectToOnboarding
    ) {
      // redirect to onboarding, if user doesn't have a deployed profile
      this.setState({ redirectToOnboarding: true })
    }
  }

  showDeploySuccessMessage() {
    let message = getProviderDisplayName(this.state.deployIdentity)

    if (message === this.state.deployIdentity) {
      // Not one of attestation changes
      message = fbt('Profile updated', 'profile.profileUpdated')
    } else {
      message = fbt(
        fbt.param('provider', message) + ' updated',
        'profile.attestationUpdated'
      )
    }

    this.handleShowNotification(message, 'blue')
  }

  renderPage() {
    const verifiedAttestations = this.state.verifiedAttestations || []
    const providers = verifiedAttestations.map(att => ({
      id: att.id,
      disabled: false,
      soon: false
    }))

    return (
      <div className="profile-page">
        <div className="container">
          <div className="row">
            <div className="col-md-8 profile-content">
              <UserProfileCard
                avatarUrl={this.state.avatarUrl}
                firstName={this.state.firstName}
                lastName={this.state.lastName}
                description={this.state.description}
                profileStrength={this.state.strength}
                tokensEarned={getTokensEarned({
                  verifiedServices: verifiedAttestations.map(att => att.id),
                  growthCampaigns: this.props.growthCampaigns,
                  tokenDecimals: this.props.tokenDecimals || 18
                })}
                maxEarnable={getMaxRewardPerUser({
                  growthCampaigns: this.props.growthCampaigns,
                  tokenDecimals: this.props.tokenDecimals || 18
                })}
                onEdit={() => this.setState({ editProfile: true })}
              />
              <div className="attestations-container text-center">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-rounded"
                  onClick={() => this.setState({ verifyModal: true })}
                >
                  <fbt desc="Profile.addVerifications">Add Verifications</fbt>
                </button>
                <AttestationBadges
                  providers={providers}
                  minCount={this.props.isMobile ? 8 : 10}
                  fillToNearest={this.props.isMobile ? 4 : 5}
                />
              </div>
            </div>
            <div className="col-md-3 profile-sidebar">
              <GrowthCampaignBox />
              <VerifyProfileHelp />
            </div>
          </div>
        </div>
      </div>
    )
  }

  capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  renderVerifyModal() {
    if (!this.state.verifyModal) {
      return null
    }

    const isMobile = this.props.isMobile

    const ModalComp = isMobile ? MobileModal : Modal

    const headerContent = fbt('Add Verifications', 'Profile.addVerifications')

    const header = isMobile ? null : <h2>{headerContent}</h2>

    const growthEnrolled = this.props.growthEnrollmentStatus === 'Enrolled'

    const verifiedAttestationsIds = (this.state.verifiedAttestations || []).map(
      att => att.id
    )

    const myEarnings =
      !isMobile || !growthEnrolled ? null : (
        <div className="total-earnings-container">
          <Earnings
            title={fbt('Total Earnings', 'Profile.TotalEarnings')}
            total={getMaxRewardPerUser({
              growthCampaigns: this.props.growthCampaigns,
              tokenDecimals: this.props.tokenDecimals || 18
            })}
            earned={getTokensEarned({
              verifiedServices: verifiedAttestationsIds,
              growthCampaigns: this.props.growthCampaigns,
              tokenDecimals: this.props.tokenDecimals || 18
            })}
          />
        </div>
      )

    const providers = this.props.attestationProviders
      .map(providerName => {
        const verified = verifiedAttestationsIds.includes(providerName)
        const reward = verified
          ? null
          : getAttestationReward({
              growthCampaigns: this.props.growthCampaigns,
              attestation: this.capitalizeString(providerName),
              tokenDecimals: this.props.tokenDecimals || 18
            })

        return {
          id: providerName,
          verified,
          reward
        }
      })
      .filter(p => (p.id === 'website' && this.props.isMobile ? false : true))

    return (
      <ModalComp
        title={headerContent}
        className="profile-verifications-modal"
        shouldClose={this.state.shouldCloseVerifyModal}
        onClose={() =>
          this.setState({ shouldCloseVerifyModal: false, verifyModal: false })
        }
      >
        {header}
        {myEarnings}
        <div className="sub-header">
          <fbt desc="Profile.tapToStart">
            Tap an icon below to verify and earn OGN.
          </fbt>
        </div>
        <AttestationBadges
          providers={providers}
          minCount={6}
          fillToNearest={3}
          onClick={providerName => {
            this.setState({
              [providerName]: true,
              shouldCloseVerifyModal: true
            })
          }}
        />
        {isMobile ? null : (
          <div className="actions">
            <button
              className="btn btn-link mb-0"
              onClick={() => {
                this.setState({
                  shouldCloseVerifyModal: true
                })
              }}
            >
              <fbt desc="Cancel">Cancel</fbt>
            </button>
          </div>
        )}
      </ModalComp>
    )
  }

  renderAttestationComponents() {
    return this.props.attestationProviders.map(providerName => {
      const AttestationComponent = AttestationComponents[providerName]

      if (!AttestationComponent) {
        return null
      }

      return (
        <AttestationComponent
          key={providerName}
          wallet={this.props.walletProxy}
          open={this.state[providerName]}
          onClose={completed => {
            const newState = {
              [providerName]: false
            }
            if (!completed) {
              newState.verifyModal = true
            }

            this.setState(newState)
          }}
          onComplete={newAttestation => {
            const attestations = get(this.state, 'attestations', [])
            attestations.push(newAttestation)

            this.setState({
              deployIdentity: providerName,
              attestations
            })
          }}
        />
      )
    })
  }

  renderDeployIdentityMutation() {
    if (!this.state.deployIdentity) {
      return null
    }

    if (
      this.state.deployIdentity === 'profile' &&
      !profileDataUpdated(this.state, get(this.props, 'identity'))
    ) {
      // Skip deploy if no change
      return null
    }

    return (
      <DeployIdentity
        identity={get(this.props, 'identity.id')}
        refetch={this.props.identityRefetch}
        autoDeploy={true}
        skipSuccessScreen={true}
        onComplete={() => {
          this.showDeploySuccessMessage()
          this.props.identityRefetch()
          this.setState({
            deployIdentity: null
          })
        }}
        profile={pick(this.state, [
          'firstName',
          'lastName',
          'description',
          'avatarUrl'
        ])}
        attestations={this.state.attestations || []}
      />
    )
  }

  renderEditProfile() {
    if (!this.state.editProfile) {
      return null
    }

    return (
      <EditProfile
        {...pick(this.state, [
          'firstName',
          'lastName',
          'description',
          'avatarUrl'
        ])}
        avatarUrl={this.state.avatarUrl}
        onClose={() =>
          this.setState({ editProfile: false, deployIdentity: 'profile' })
        }
        onChange={newState => this.setState(newState, () => this.validate())}
        onAvatarChange={avatarUrl => this.setState({ avatarUrl })}
        lightMode={true}
      />
    )
  }

  render() {
    if (this.state.redirectToOnboarding) {
      return (
        <UserActivationLink location={{ pathname: '/' }} forceRedirect={true} />
      )
    }
    return (
      <Fragment>
        <ToastNotification
          setShowHandler={handler => (this.handleShowNotification = handler)}
        />
        <DocumentTitle
          pageTitle={<fbt desc="Profile.title">Welcome to Origin Protocol</fbt>}
        />
        {this.renderPage()}
        {this.renderVerifyModal()}
        {this.renderAttestationComponents()}
        {this.renderDeployIdentityMutation()}
        {this.renderEditProfile()}
      </Fragment>
    )
  }

  validate() {
    const newState = {}
    if (!this.state.firstName) {
      newState.firstNameError = 'First Name is required'
    }
    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    this.setState(newState)
    return newState.valid
  }
}

export default withIsMobile(
  withAttestationProviders(
    withWallet(withIdentity(withGrowthCampaign(UserProfile)))
  )
)

require('react-styl')(`
  .profile-page
    background-color: var(--pale-grey-four)
    > .container
      padding-top: 2rem
      margin-bottom: -4rem
      padding-bottom: 4rem
    .profile-content
      .attestations-container
        margin: 0 1rem
        border-radius: 5px
        border: solid 1px #c2cbd3
        background-color: var(--white)
        padding: 3rem
    .profile-sidebar
      margin-left: 8.33333%
  .profile-verifications-modal
    background-color: white !important
    color: var(--dark) !important
    h2
      font-weight: 500
      font-size: 1.75rem
      font-family: Poppins
      font-style: normal
      font-stretch: normal
      line-height: 1.43
      letter-spacing: normal
      text-align: center
      color: #000000
    .sub-header
      height: 22px
      font-family: Lato
      font-size: 1rem
      font-weight: normal
      font-style: normal
      font-stretch: normal
      line-height: normal
      letter-spacing: normal
      text-align: center
      color: #000000
    .actions
      .btn-link
        font-family: Lato
        font-size: 0.9rem
        font-weight: 900
        font-style: normal
        font-stretch: normal
        line-height: normal
        letter-spacing: normal
        color: var(--clear-blue)
        text-decoration: none
    .attestation-badges .attestation-badge
      margin: 1rem
    .total-earnings-container
      padding: 12px 20px
      .title
        padding: 0

  @media (max-width: 767.98px)
    .profile-page
      > .container
        padding-top: 0
      .profile-sidebar
        margin-left: 0
      .profile-content
        padding: 0
        .attestations-container
          margin: 2rem 0 0 0
          border: none
          background-color: transparent
          padding: 0
    .profile-verifications-modal
      .sub-header
        font-family: Lato
        font-size: 0.9rem
        font-weight: normal
        font-style: italic
        font-stretch: normal
        line-height: normal
        letter-spacing: normal
        color: #455d75
      .attestation-badges .attestation-badge
        width: 93px
        height: 93px
        margin: 0.5rem
`)
