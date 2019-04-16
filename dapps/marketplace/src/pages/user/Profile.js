import React, { Component, Fragment } from 'react'
import pick from 'lodash/pick'
import pickBy from 'lodash/pickBy'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'
import { Switch, Route } from 'react-router-dom'
import validator from '@origin/validator'

import Store from 'utils/store'
import { unpublishedStrength, changesToPublishExist } from 'utils/profileTools'
import { getAttestationReward } from 'utils/growthTools'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'
import withGrowthCampaign from 'hoc/withGrowthCampaign'

import ProfileStrength from 'components/ProfileStrength'
import Avatar from 'components/Avatar'
import Wallet from 'components/Wallet'
import DocumentTitle from 'components/DocumentTitle'
import GrowthCampaignBox from 'components/GrowthCampaignBox'

import PhoneAttestation from 'pages/identity/PhoneAttestation'
import EmailAttestation from 'pages/identity/EmailAttestation'
import FacebookAttestation from 'pages/identity/FacebookAttestation'
import GoogleAttestation from 'pages/identity/GoogleAttestation'
import TwitterAttestation from 'pages/identity/TwitterAttestation'
import AirbnbAttestation from 'pages/identity/AirbnbAttestation'
import ProfileWizard from 'pages/user/ProfileWizard'
import Onboard from 'pages/onboard/Onboard'

import EditProfile from './_EditModal'
import ToastNotification from './ToastNotification'

const store = Store('sessionStorage')

const AttestationComponents = {
  phone: PhoneAttestation,
  email: EmailAttestation,
  facebook: FacebookAttestation,
  twitter: TwitterAttestation,
  airbnb: AirbnbAttestation,
  google: GoogleAttestation
}

const ProfileFields = [
  'firstName',
  'lastName',
  'description',
  'avatar',
  'strength',
  'attestations',
  'facebookVerified',
  'twitterVerified',
  'airbnbVerified',
  'phoneVerified',
  'emailVerified',
  'googleVerified'
]

function getState(profile) {
  return {
    firstName: '',
    lastName: '',
    description: '',
    avatar: '',
    ...pickBy(pick(profile, ProfileFields), k => k)
  }
}

class UserProfile extends Component {
  constructor(props) {
    super(props)
    const profile = get(props, 'identity')
    const attestations = store.get(`attestations-${props.wallet}`, {})
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
    this.state = {
      ...getState(profile),
      ...storedAttestations
    }
    this.accountsSwitched = false
  }

  changesPublishedToBlockchain(props, prevProps) {
    const profile = get(props, 'identity') || {}
    const prevProfile = get(prevProps, 'identity') || {}

    return (
      (profile.firstName !== prevProfile.firstName ||
        profile.lastName !== prevProfile.lastName ||
        profile.description !== prevProfile.description ||
        profile.avatar !== prevProfile.avatar ||
        profile.emailVerified !== prevProfile.emailVerified ||
        profile.phoneVerified !== prevProfile.phoneVerified ||
        profile.facebookVerified !== prevProfile.facebookVerified ||
        profile.twitterVerified !== prevProfile.twitterVerified ||
        profile.airbnbVerified !== prevProfile.airbnbVerified) &&
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
        state.avatar !== prevState.avatar) &&
      !this.accountsSwitched
    )
  }

  attestationUpdated(state, prevState, attestation) {
    return (
      state[attestation] !== prevState[attestation] && !this.accountsSwitched
    )
  }

  componentDidUpdate(prevProps, prevState) {
    if (get(this.props, 'identity.id') !== get(prevProps, 'identity.id')) {
      this.setState(getState(get(this.props, 'identity')))
      this.accountsSwitched = true
      /* Semi ugly hack - can not find a better solution to the problem.
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
      setTimeout(() => {
        this.accountsSwitched = false
      }, 3000)
    }

    if (this.changesPublishedToBlockchain(this.props, prevProps)) {
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
        attestation: 'twitterAttestation',
        message: fbt('Twitter updated', 'profile.twitterUpdated')
      },
      {
        attestation: 'airbnbAttestation',
        message: fbt('Airbnb updated', 'profile.airbnbUpdated')
      }
    ]

    attestationNotificationConf.forEach(({ attestation, message }) => {
      if (this.attestationUpdated(this.state, prevState, attestation)) {
        this.handleShowNotification(message, 'blue')
      }
    })
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
        <Switch>
          <Route
            path="/profile/onboard"
            render={() => (
              <Onboard
                showoriginwallet={false}
                linkprefix="/profile"
                redirectTo="/profile/continue"
              />
            )}
          />
          <Route
            path="/profile/continue"
            render={() => this.renderProfile(true)}
          />
          <Route render={() => this.renderProfile(false)} />
        </Switch>
      </Fragment>
    )
  }

  openEditProfile(e) {
    e.preventDefault()
    this.setState({ editProfile: true })
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

    return (
      <div className="container profile-edit">
        <DocumentTitle>
          <fbt desc="Profile.edit">Edit your profile</fbt>
        </DocumentTitle>
        <div className="row">
          <div className="col-md-8">
            <div className="profile d-flex">
              <div className="avatar-wrap">
                <Avatar avatar={this.state.avatar} />
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
                {this.renderAtt(
                  'email',
                  fbt('Email', '_ProvisionedChanges.email')
                )}
                {this.renderAtt(
                  'phone',
                  fbt('Phone', '_ProvisionedChanges.phone')
                )}
                {this.renderAtt(
                  'facebook',
                  fbt('Facebook', '_ProvisionedChanges.facebook')
                )}
                {this.renderAtt(
                  'twitter',
                  fbt('Twitter', '_ProvisionedChanges.twitter')
                )}
                {this.renderAtt(
                  'airbnb',
                  fbt('Airbnb', '_ProvisionedChanges.airbnb')
                )}
                {this.renderAtt(
                  'google',
                  fbt('Google', '_ProvisionedChanges.google'),
                  process.env.ENABLE_GOOGLE_ATTESTATION !== 'true'
                )}
              </div>
            </div>

            <ProfileStrength
              large={true}
              published={get(this.props, 'identity.strength') || 0}
              unpublished={unpublishedStrength(this)}
            />

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
                    'avatar'
                  ]),
                  attestations: [
                    ...(this.state.attestations || []),
                    ...attestations
                  ],
                  validate: () => this.validate(),
                  onComplete: () =>
                    store.set(`attestations-${this.props.wallet}`, undefined),
                  children: fbt('Publish Now', 'Profile.publishNow')
                }}
                publishedProfile={this.props.identity || {}}
                currentProfile={this.state}
                changesToPublishExist={changesToPublishExist(this)}
                publishedStrength={get(this.props, 'identity.strength') || 0}
                openEditProfile={e => this.openEditProfile(e)}
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
                <b>Verifying your profile</b> allows other users to know that you
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
              'avatar'
            ])}
            avatar={this.state.avatar}
            onClose={() => this.setState({ editProfile: false })}
            onChange={newState =>
              this.setState(newState, () => this.validate())
            }
            onAvatarChange={avatar => this.setState({ avatar })}
          />
        )}
      </div>
    )
  }

  renderAtt(type, text, soon) {
    const { wallet } = this.props
    const profile = get(this.props, 'identity') || {}
    let attestationPublished = false
    let attestationProvisional = false

    let status = ''
    if (profile[`${type}Verified`]) {
      status = ' published'
      attestationPublished = true
    } else if (this.state[`${type}Attestation`]) {
      status = ' provisional'
      attestationProvisional = true
    }
    if (soon) {
      status = ' soon'
    } else {
      status += ' interactive'
    }

    let AttestationComponent = AttestationComponents[type]
    if (AttestationComponent) {
      AttestationComponent = (
        <AttestationComponent
          wallet={wallet}
          open={!soon && this.state[type]}
          onClose={() => this.setState({ [type]: false })}
          onComplete={att => {
            this.setState({ [`${type}Attestation`]: att }, () => {
              this.storeAttestations()
            })
          }}
        />
      )
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
      <>
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
      </>
    )
  }

  validate() {
    const newState = {}
    // if (!this.state.firstName) {
    //   newState.firstNameError = 'First Name is required'
    // }
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
    store.set(`attestations-${this.props.wallet}`, attestations)
  }
}

export default withWallet(withIdentity(withGrowthCampaign(UserProfile)))

require('react-styl')(`
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
