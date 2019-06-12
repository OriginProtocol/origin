import React, { Component, Fragment } from 'react'
import pick from 'lodash/pick'
import pickBy from 'lodash/pickBy'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'
import { Switch, Route } from 'react-router-dom'
import validator from '@origin/validator'

import Store from 'utils/store'
import {
  unpublishedStrength,
  changesToPublishExist,
  updateVerifiedAccounts,
  clearVerifiedAccounts,
  getVerifiedAccounts,
  getProviderDisplayName
} from 'utils/profileTools'

import {
  getAttestationReward,
  getMaxRewardPerUser,
  getTokensEarned
} from 'utils/growthTools'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'
import withGrowthCampaign from 'hoc/withGrowthCampaign'
import withAttestationProviders from 'hoc/withAttestationProviders'

import ProfileStrength from 'components/ProfileStrength'
import Avatar from 'components/Avatar'
import Wallet from 'components/Wallet'
import DocumentTitle from 'components/DocumentTitle'
import GrowthCampaignBox from 'components/GrowthCampaignBox'
import Earnings from 'components/Earning'

import PhoneAttestation from 'pages/identity/PhoneAttestation'
import EmailAttestation from 'pages/identity/EmailAttestation'
import AirbnbAttestation from 'pages/identity/AirbnbAttestation'
import WebsiteAttestation from 'pages/identity/WebsiteAttestation'
import OAuthAttestation from 'pages/identity/OAuthAttestation'
import ProfileWizard from 'pages/user/ProfileWizard'
import Onboard from 'pages/onboard/Onboard'

import EditProfile from './_EditModal'
import ToastNotification from './ToastNotification'

const store = Store('sessionStorage')

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
    ...pickBy(pick(profile, ProfileFields), k => k)
  }
}

class UserProfile extends Component {
  constructor(props) {
    super(props)
    const profile = get(props, 'identity')

    const storedAttestations = this.getStoredAttestions()

    this.state = {
      ...resetAtts,
      ...getState(profile),
      ...storedAttestations
    }
    const activeAttestation = get(props, 'match.params.attestation')
    if (activeAttestation) {
      this.state[activeAttestation] = true
    }
    this.toasterTimeout()
  }

  componentDidMount() {
    document.body.style.backgroundColor = 'var(--pale-grey-four)'
  }

  componentWillUnmount() {
    /* unfortunately this needs to be hardcoded and can not be read from document.body.style.backgroundColor
     * since it initially returns an empty string
     */
    document.body.style.backgroundColor = 'white'
    clearTimeout(this.timeout)
  }

  changesPublishedToBlockchain(props, prevProps, state, prevState) {
    const profile = get(props, 'identity') || {}
    const prevProfile = get(prevProps, 'identity') || {}

    const verifiedAttestations = (state.verifiedAttestations || []).map(
      att => att.id
    )
    const prevVerifiedAttestations = (prevState.verifiedAttestations || []).map(
      att => att.id
    )

    if (verifiedAttestations.length !== prevVerifiedAttestations.length) {
      // short-circuit
      return false
    }

    const newlyAdded = verifiedAttestations.filter(
      att => !prevVerifiedAttestations.includes(att)
    )
    if (newlyAdded.length > 0) {
      // short-circuit
      return false
    }

    const removedAttestations = prevVerifiedAttestations.filter(
      att => !verifiedAttestations.includes(att)
    )
    if (removedAttestations.length > 0) {
      // short-circuit
      return false
    }

    return (
      (profile.firstName !== prevProfile.firstName ||
        profile.lastName !== prevProfile.lastName ||
        profile.description !== prevProfile.description ||
        profile.avatarUrl !== prevProfile.avatarUrl) &&
      profile.id === prevProfile.id &&
      // initial profile data population
      prevProfile.id !== undefined
    )
  }

  profileDataUpdated(state, prevState) {
    return (
      (state.firstName !== prevState.firstName ||
        state.lastName !== prevState.lastName ||
        state.description !== prevState.description ||
        state.avatarUrl !== prevState.avatarUrl) &&
      !this.accountsSwitched
    )
  }

  attestationUpdated(state, prevState, attestation) {
    return (
      state[attestation] !== prevState[attestation] && !this.accountsSwitched
    )
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.walletProxy !== prevProps.walletProxy) {
      const storedAttestations = this.getStoredAttestions()
      this.setState({ ...resetAtts, ...storedAttestations })
    }

    if (get(this.props, 'identity.id') !== get(prevProps, 'identity.id')) {
      this.setState(getState(get(this.props, 'identity')))
      this.toasterTimeout()
    }

    if (
      this.changesPublishedToBlockchain(
        this.props,
        prevProps,
        this.state,
        prevState
      )
    ) {
      this.handleShowNotification(
        fbt(
          'Changes published to blockchain',
          'profile.changesPublishedToBlockchain'
        ),
        'green'
      )
    }

    if (this.profileDataUpdated(this.state, prevState)) {
      this.handleShowNotification(
        fbt('Profile updated', 'profile.profileUpdated'),
        'blue'
      )
    }

    const attestationNotificationConf = [
      {
        attestation: 'emailAttestation',
        message: fbt('Email updated', 'profile.emailUpdated')
      },
      {
        attestation: 'phoneAttestation',
        message: fbt('Phone number updated', 'profile.phoneUpdated')
      },
      {
        attestation: 'facebookAttestation',
        message: fbt('Facebook updated', 'profile.facebookUpdated')
      },
      {
        attestation: 'googleAttestation',
        message: fbt('Google updated', 'profile.googleUpdated')
      },
      {
        attestation: 'twitterAttestation',
        message: fbt('Twitter updated', 'profile.twitterUpdated')
      },
      {
        attestation: 'airbnbAttestation',
        message: fbt('Airbnb updated', 'profile.airbnbUpdated')
      },
      {
        attestation: 'websiteAttestation',
        message: fbt('Website updated', 'profile.websiteUpdated')
      },
      {
        attestation: 'kakaoAttestation',
        message: fbt('KaKao updated', 'profile.kakaoUpdated')
      },
      {
        attestation: 'githubAttestation',
        message: fbt('GitHub updated', 'profile.githubUpdated')
      },
      {
        attestation: 'linkedinAttestation',
        message: fbt('LinkedIn updated', 'profile.linkedinUpdated')
      },
      {
        attestation: 'wechatAttestation',
        message: fbt('WeChat updated', 'profile.wechatUpdated')
      }
    ]

    attestationNotificationConf.forEach(({ attestation, message }) => {
      if (this.attestationUpdated(this.state, prevState, attestation)) {
        this.handleShowNotification(message, 'blue')
      }
    })
  }

  /**
   * Semi ugly hack - can not find a better solution to the problem.
   *
   * The problem: To show toast notification when a user changes profile or attestation
   * data we are observing this component's state. False positive notifications
   * need to be prevented to not falsely fire when state is initially populated or when user
   * changes wallets.
   *
   * The biggest challenge is that wallet id prop changes immediately when the wallet
   * changes and bit later identity information prop is populated (which can also be empty). It
   * is hard to connect the wallet change to the identity change, to rule out profile switches.
   *
   * Current solution is just to disable any notifications firing 3 seconds after
   * account switch.
   */
  toasterTimeout() {
    this.accountsSwitched = true
    this.timeout = setTimeout(() => {
      this.accountsSwitched = false
    }, 3000)
  }

  renderPage() {
    const growthEnrolled = this.props.growthEnrollmentStatus === 'Enrolled'

    let verifiedAttestations = get(this.props, 'identity.verifiedAttestations', [])

    if (verifiedAttestations.length < 10) {
      // Show a minimum of 10 icons
      verifiedAttestations = verifiedAttestations.concat(new Array(10 - verifiedAttestations.length).fill(null))
    } else if (verifiedAttestations.length > 10 && (verifiedAttestations % 5 !== zero)) {
      // Show icons in multiples of 5
      const lengthToAppend = (5 - (verifiedAttestations.length % 5))
      verifiedAttestations = verifiedAttestations.concat(new Array(lengthToAppend).fill(null))
    }

    return (
      <div className="container profile-page">
        <div className="row">
          <div className="col-md-8 profile-content">
            <div className="profile-info-container">
              <div className="avatar-container">
                <Avatar className="with-edit-icon" avatarUrl={this.state.avatarUrl} />
              </div>
              <div className="user-bio-container">
                <h2>
                  {`${this.state.firstName} ${this.state.lastName}`}
                </h2>
                <div className="description">
                  My name is Aure and I like chickens. It’s been a lifelong obsession and I don’t think it’ll ever go away so I hope you’re not turned off by it or anything.
                </div>
              </div>
            </div>
            <div className="user-progress-container">
              <div className="profile-strength-container">
                <ProfileStrength
                  published={get(this.props, 'identity.strength') || 0}
                  unpublished={unpublishedStrength(this)}
                />
              </div>
              {growthEnrolled && (
                <div className="user-earnings-container">
                  <Earnings
                    total={getMaxRewardPerUser({
                      growthCampaigns: this.props.growthCampaigns,
                      tokenDecimals: this.props.tokenDecimals || 18
                    })}
                    earned={getTokensEarned({
                      verifiedServices: (
                        this.state.verifiedAttestations || []
                      ).map(att => att.id),
                      growthCampaigns: this.props.growthCampaigns,
                      tokenDecimals: this.props.tokenDecimals || 18
                    })}
                  />
                </div>
              )}
            </div>
            <div className="attestations-container text-center">
              <button type="button" className="btn btn-outline-primary btn-rounded">
                <fbt desc="Profile.addVerifications">Add Verifications</fbt>
              </button>
              <div className="attestation-badges">
                {verifiedAttestations.map((att, index) => {
                  if (!att) {
                    return <div key={index} className="attestation-badge"></div>
                  }

                  return (
                    <div key={att.id} className={`attestation-badge verified ${att.id}`}></div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="col-md-3 profile-sidebar"></div>
        </div>
      </div>
    )
  }

  render() {
    return (
      <Fragment>
        <ToastNotification
          setShowHandler={handler => (this.handleShowNotification = handler)}
        />
        <DocumentTitle
          pageTitle={<fbt desc="Profile.title">Welcome to Origin Protocol</fbt>}
        />
        {this.renderPage()}
      </Fragment>
    )
    // return (
    //   <Fragment>
    //     <ToastNotification
    //       setShowHandler={handler => (this.handleShowNotification = handler)}
    //     />
    //     <DocumentTitle
    //       pageTitle={<fbt desc="Profile.title">Welcome to Origin Protocol</fbt>}
    //     />
    //     <Switch>
    //       {/* Accessed only when onboarding started by clicking on Growth Enroll Box in profile view.
    //        * For that reason Origin wallet is disabled.
    //        */}
    //       <Route
    //         path="/profile/onboard"
    //         render={() => (
    //           <Onboard
    //             hideOriginWallet={true}
    //             linkprefix="/profile"
    //             redirectTo="/profile/continue"
    //           />
    //         )}
    //       />
    //       <Route
    //         path="/profile/continue"
    //         render={() => this.renderProfile(true)}
    //       />
    //       <Route render={() => this.renderProfile(false)} />
    //     </Switch>
    //   </Fragment>
    // )
  }

  openEditProfile(e) {
    e.preventDefault()
    this.setState({ editProfile: true })
  }

  hasPhoneAttestation() {
    if (this.state.phoneAttestation) {
      return true
    }

    return !!(this.state.verifiedAttestations || []).find(
      attestation => attestation.id === 'phone'
    )
  }

  renderProfile(arrivedFromOnboarding) {
    const attestations = Object.keys(AttestationComponents).reduce((m, key) => {
      if (this.state[`${key}Attestation`]) {
        m.push(this.state[`${key}Attestation`])
      }
      return m
    }, [])

    const name = []
    if (this.state.firstName) name.push(this.state.firstName)
    if (this.state.lastName) name.push(this.state.lastName)
    const enableGrowth = process.env.ENABLE_GROWTH === 'true'

    const profileCreated =
      this.props.growthEnrollmentStatus === 'Enrolled' &&
      this.hasPhoneAttestation()

    return (
      <div className="container profile-edit">
        <DocumentTitle>
          <fbt desc="Profile.edit">Edit your profile</fbt>
        </DocumentTitle>
        <div className="row">
          <div className="col-md-8">
            <div className="profile d-flex">
              <div className="avatar-wrap">
                <Avatar avatarUrl={this.props.identity.avatarUrl} />
              </div>
              <div className="info">
                <a
                  className="edit"
                  href="#"
                  onClick={e => this.openEditProfile(e)}
                />
                <h1>{name.length ? name.join(' ') : 'Unnamed User'}</h1>
                <div className="description">
                  {this.state.description ||
                    fbt(
                      'An Origin user without a description',
                      'Profile.noDescriptionUser'
                    )}
                </div>
              </div>
            </div>
            <h3>
              <fbt desc="Profile.originVerifications">Origin Verifications</fbt>
            </h3>
            <div className="attestation-container">
              <label className="mb-4">
                <fbt desc="_Services.pleaseConnectAccounts">
                  Please connect your accounts below to strengthen your identity
                  on Origin.
                </fbt>
              </label>
              <div className="profile-attestations">
                {
                  this.props.attestationProviders.map(provider => {
                    return this.renderAtt(
                      provider,
                      getProviderDisplayName(provider)
                    )
                  })
                }
              </div>
            </div>

            <div className="profile-progress">
              <div>
                <ProfileStrength
                  large={true}
                  published={get(this.props, 'identity.strength') || 0}
                  unpublished={unpublishedStrength(this)}
                />
              </div>
              {profileCreated && (
                <div>
                  <Earnings
                    large={true}
                    total={getMaxRewardPerUser({
                      growthCampaigns: this.props.growthCampaigns,
                      tokenDecimals: this.props.tokenDecimals || 18
                    })}
                    earned={getTokensEarned({
                      verifiedServices: (
                        this.state.verifiedAttestations || []
                      ).map(att => att.id),
                      growthCampaigns: this.props.growthCampaigns,
                      tokenDecimals: this.props.tokenDecimals || 18
                    })}
                  />
                </div>
              )}
            </div>

            <div className="actions">
              <ProfileWizard
                deployIdentityProps={{
                  className: `btn btn-primary btn-rounded btn-lg`,
                  identity: get(this.props, 'identity.id'),
                  refetch: this.props.identityRefetch,
                  profile: pick(this.state, [
                    'firstName',
                    'lastName',
                    'description',
                    'avatarUrl'
                  ]),
                  attestations: [
                    ...(this.state.attestations || []),
                    ...attestations
                  ],
                  validate: () => this.validate(),
                  onComplete: () => {
                    store.set(
                      `attestations-${this.props.walletProxy}`,
                      undefined
                    )
                    clearVerifiedAccounts()
                  },
                  children: fbt('Publish Now', 'Profile.publishNow')
                }}
                publishedProfile={this.props.identity || {}}
                currentProfile={this.state}
                changesToPublishExist={changesToPublishExist(this)}
                publishedStrength={get(this.props, 'identity.strength') || 0}
                openEditProfile={e => this.openEditProfile(e)}
                onEnrolled={() => {
                  // Open phone attestation once enrollment is complete
                  this.setState({
                    phone: true
                  })
                }}
              />
            </div>
          </div>
          <div className="col-md-4">
            <Wallet />
            {enableGrowth && (
              <GrowthCampaignBox openmodalonstart={arrivedFromOnboarding} />
            )}
            <div className="gray-box profile-help">
              <fbt desc="onboarding-steps.stepTwoContent">
                <b>Verifying your profile</b> allows other users to know that
                you are a real person and increases the chances of successful
                transactions on Origin.
              </fbt>
            </div>
          </div>
        </div>

        {!this.state.editProfile ? null : (
          <EditProfile
            {...pick(this.state, [
              'firstName',
              'lastName',
              'description',
              'avatarUrl'
            ])}
            avatarUrl={this.state.avatarUrl}
            onClose={() => this.setState({ editProfile: false })}
            onChange={newState =>
              this.setState(newState, () => this.validate())
            }
            onAvatarChange={avatarUrl => this.setState({ avatarUrl })}
          />
        )}
      </div>
    )
  }

  renderAtt(type, text, attProps = {}) {
    const { soon, disabled, hidden } = attProps
    const { walletProxy } = this.props

    if (hidden) {
      return null
    }

    // const profile = get(this.props, 'identity') || {}
    let attestationPublished = false
    let attestationProvisional = false

    let status = ''
    if (
      this.state.verifiedAttestations &&
      this.state.verifiedAttestations.find(att => att.id === type)
    ) {
      status = ' published'
      attestationPublished = true
    } else if (this.state[`${type}Attestation`]) {
      status = ' provisional'
      attestationProvisional = true
    }

    if (soon) {
      status = ' soon'
    } else if (disabled) {
      status = ' disabled'
    } else {
      status += ' interactive'
    }

    let AttestationComponent = AttestationComponents[type]
    if (AttestationComponent && !soon && !disabled) {
      AttestationComponent = (
        <AttestationComponent
          wallet={walletProxy}
          open={!soon && this.state[type]}
          onClose={() => this.setState({ [type]: false })}
          onComplete={att => {
            this.setState({ [`${type}Attestation`]: att }, () => {
              this.storeAttestations()
            })
          }}
        />
      )
    } else {
      AttestationComponent = <AttestationComponent wallet={walletProxy} />
    }

    let attestationReward = 0
    if (
      this.props.growthCampaigns &&
      this.props.growthEnrollmentStatus === 'Enrolled'
    ) {
      const capitalize = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
      }

      attestationReward = getAttestationReward({
        growthCampaigns: this.props.growthCampaigns,
        attestation: capitalize(type),
        tokenDecimals: this.props.tokenDecimals || 18
      })
    }

    return (
      <Fragment key={type}>
        <div
          id={`attestation-component-${type}`}
          className={`profile-attestation ${type}${status}`}
          onClick={() => this.setState({ [type]: true })}
        >
          <i />
          {text}
          {attestationPublished && (
            <img className="ml-auto" src="images/identity/completed-tick.svg" />
          )}
          {attestationProvisional && <div className="indicator" />}
          {!attestationPublished && attestationReward !== 0 && (
            <div
              className={`growth-reward ml-auto d-flex justify-content-center ${
                attestationProvisional ? 'provisional' : ''
              }`}
            >
              {attestationReward.toString()}
            </div>
          )}
        </div>
        {AttestationComponent}
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

  storeAttestations() {
    const attestations = Object.keys(AttestationComponents).reduce((m, key) => {
      if (this.state[`${key}Attestation`]) {
        m[`${key}Attestation`] = this.state[`${key}Attestation`]
      }
      return m
    }, {})
    store.set(`attestations-${this.props.walletProxy}`, attestations)
    updateVerifiedAccounts({
      wallet: this.props.walletProxy,
      data: attestations
    })
  }

  getAttestations() {
    const wallet = this.props.walletProxy
    const defaultValue = store.get(`attestations-${wallet}`, {})
    return getVerifiedAccounts({ wallet }, defaultValue)
  }

  getStoredAttestions() {
    const attestations = this.getAttestations()
    const storedAttestations = {}

    Object.keys(attestations).forEach(key => {
      try {
        validator('https://schema.originprotocol.com/attestation_1.0.0.json', {
          ...JSON.parse(attestations[key]),
          schemaId: 'https://schema.originprotocol.com/attestation_1.0.0.json'
        })
        storedAttestations[key] = attestations[key]
      } catch (e) {
        // Invalid attestation
        console.log('Invalid attestation', attestations[key])
      }
    })

    return storedAttestations
  }
}

export default withAttestationProviders(
  withWallet(withIdentity(withGrowthCampaign(UserProfile)))
)

require('react-styl')(`
  .profile-page
    margin-top: 2rem
    .profile-content
      .profile-info-container
        display: flex
        direction: row
        padding: 1rem
        .avatar-container
          flex: auto 0 0
          padding: 0.5rem 0
          .avatar
            width: 110px
            height: 110px
        .user-bio-container
          flex: auto 1 1
          padding: 0 2rem
          h2
            font-family: Poppins
            font-size: 2.25rem
            font-weight: 500
            color: var(--dark)
            margin-bottom: 0.5rem
          .description
            font-family: Lato
            font-size: 1rem
            font-weight: 300
            line-height: 1.56
            color: var(--dark)
      .user-progress-container
        margin-top: 1rem
        display: flex
        flex-direction: row
        .profile-strength-container, .user-earnings-container
          flex: 50% 1 1
          padding: 1rem
      .attestations-container
        margin: 0 1rem
        border-radius: 5px
        border: solid 1px #c2cbd3
        background-color: var(--white)
        padding: 3rem
        .attestation-badges
          margin-top: 1.5rem
          .attestation-badge
            display: inline-block
            width: 6rem
            height: 6rem
            border-radius: 50%
            border: dashed 1px #c2cbd3
            flex: auto 1 1
            margin: 0.5rem
            background-repeat: no-repeat
            background-position: center
            &.verified
              border: solid 6px #c2cbd3
            &.disabled
              background-color: #dfe6ea
              border-color: #dfe6ea
            &.email
              background-image: url('images/identity/mail-icon-small.svg')
              &.verified
                border-color: #1ec68e
                background-color: #27d198
            &.phone
              background-image: url('images/identity/mail-icon-small.svg')
              &.verified
                border-color: #e8b506
                background-color: #f4c111
            &.facebook
              background-image: url('images/identity/mail-icon-small.svg')
              &.verified
                border-color: #2d4a89
                background-color: #3a5997
            &.twitter
              background-image: url('images/identity/mail-icon-small.svg')
              &.verified
                border-color: #169aeb
                background-color: #1fa1f1
            &.airbnb
              background-image: url('images/identity/mail-icon-small.svg')
              &.verified
                border-color: #ee4f54
                background-color: #ff5b60
            &.website
              background-image: url('images/identity/mail-icon-small.svg')
              &.verified
                border-color: #6331dd
                background-color: #6e3bea
            &.google
              background-image: url('images/identity/mail-icon-small.svg')
              &.verified
                border-color: #1ec68e
                background-color: #27d198
            &.wechat
              background-image: url('images/identity/mail-icon-small.svg')
              &.verified
                border-color: #00b500
                background-color: #02c602
            &.kakao
              background-image: url('images/identity/mail-icon-small.svg')
              &.verified
                border-color: #ebd500
                background-color: #ffe815
            &.github
              background-image: url('images/identity/mail-icon-small.svg')
              &.verified
                border-color: #1ec68e
                background-color: #27d198
            &.linkedin
              background-image: url('images/identity/mail-icon-small.svg')
              &.verified
                border-color: #1ec68e
                background-color: #27d198

    .profile-sidebar
      margin-left: 8.33333%
  .profile-edit
    margin-top: 3rem
    h3
      font-size: 24px
      font-weight: 300
      color: var(--dark)
    .attestation-container
      padding-bottom: 1rem
      margin-bottom: 2rem
      label
        font-family: Lato
        font-size: 16px
        font-weight: 300
        color: var(--dark-blue-grey)
    .gray-box
      border: 1px solid var(--light)
      border-radius: var(--default-radius)
      padding: 1rem
    .avatar-wrap
      margin-right: 2rem
      width: 7.5rem
      .avatar
        border-radius: 1rem
    .actions
      text-align: center
    .profile
      position: relative
      h1
        margin: 0
      margin-bottom: 2rem
      .info
        flex: 1
      a.edit
        float: right
        background: url(images/edit-icon.svg) no-repeat center
        background-size: cover
        width: 2rem
        height: 2rem
        display: block
        margin: 0.75rem 0 0 0.5rem
    .profile-help
      font-size: 14px
      background: url(images/identity/identity.svg) no-repeat center 1.5rem
      background-size: 5rem
      padding-top: 8rem
    .attestation-container
      .growth-reward
        font-family: Lato
        font-size: 16px
        font-weight: bold
        color: var(--pale-grey-two)
        img
          width: 15px
        &::before
          display: block
          position: relative
          content: ""
          background: url(images/ogn-icon-grayed-out.svg) no-repeat center
          background-size: 1rem
          width: 1rem
          height: 1rem
          margin-right: 0.25rem
          margin-top: 0.25rem
      .growth-reward.provisional
        color: var(--clear-blue)
        &::before
          background: url(images/ogn-icon.svg) no-repeat center
          background-size: 1rem
    .profile-progress
      display: flex
      > div
        flex: 50% 1 1
        padding: 1rem

  @media (max-width: 767.98px)
    .profile-edit
      margin-top: 1rem
      .avatar-wrap
        margin-right: 1rem
      .profile
        flex-direction: column
        margin-bottom: 1rem
        .avatar-wrap
          width: 8rem
          align-self: center
      .profile-strength
        margin-bottom: 1rem
      .actions
        margin-bottom: 2rem

`)
