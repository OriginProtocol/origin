import React, { Component, Fragment } from 'react'
import pick from 'lodash/pick'
import pickBy from 'lodash/pickBy'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'
import { Switch, Route } from 'react-router-dom'

import Store from 'utils/store'
import unpublishedProfileStrength from 'utils/unpublishedProfileStrength'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'

import ProfileStrength from 'components/ProfileStrength'
import Avatar from 'components/Avatar'
import Wallet from 'components/Wallet'
import PageTitle from 'components/PageTitle'
import ImageCropper from 'components/ImageCropper'
import GrowthCampaignBox from 'components/GrowthCampaignBox'

import PhoneAttestation from 'pages/identity/PhoneAttestation'
import EmailAttestation from 'pages/identity/EmailAttestation'
import FacebookAttestation from 'pages/identity/FacebookAttestation'
import TwitterAttestation from 'pages/identity/TwitterAttestation'
import AirbnbAttestation from 'pages/identity/AirbnbAttestation'
import DeployIdentity from 'pages/identity/mutations/DeployIdentity'
import Onboard from 'pages/onboard/Onboard'

import EditProfile from './_EditModal'

const store = Store('sessionStorage')

const AttestationComponents = {
  phone: PhoneAttestation,
  email: EmailAttestation,
  facebook: FacebookAttestation,
  twitter: TwitterAttestation,
  airbnb: AirbnbAttestation
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
  'emailVerified'
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
    const storedAttestations = store.get(`attestations-${props.wallet}`, {})
    this.state = { ...getState(profile), ...storedAttestations }
  }

  componentDidUpdate(prevProps) {
    if (get(this.props, 'identity.id') !== get(prevProps, 'identity.id')) {
      this.setState(getState(get(this.props, 'identity')))
    }
  }

  render() {
    return (
      <Fragment>
        <PageTitle>
          <fbt desc="Profile.welcome">Welcome to Origin Protocol</fbt>
        </PageTitle>
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
        <PageTitle>
          <fbt desc="Profile.edit">Edit your profile</fbt>
        </PageTitle>
        <div className="row">
          <div className="col-md-8">
            <div className="profile d-flex">
              <div className="avatar-wrap">
                <ImageCropper onChange={avatar => this.setState({ avatar })}>
                  <Avatar className="with-cam" avatar={this.state.avatar} />
                </ImageCropper>
              </div>
              <div className="info">
                <a
                  className="edit"
                  href="#"
                  onClick={e => {
                    e.preventDefault()
                    this.setState({ editProfile: true })
                  }}
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
              <fbt desc="Profile.verifyYourselfHeading">
                Verify yourself on Origin
              </fbt>
            </h3>
            <div className="gray-box">
              <label className="mb-3">
                <fbt desc="_Services.pleaseConnectAccounts">
                  Please connect your accounts below to strengthen your identity
                  on Origin.
                </fbt>
              </label>
              <div className="profile-attestations">
                {this.renderAtt(
                  'phone',
                  fbt('Phone Number', '_ProvisionedChanges.phoneNumber')
                )}
                {this.renderAtt(
                  'email',
                  fbt('Email', '_ProvisionedChanges.email')
                )}
                {this.renderAtt(
                  'airbnb',
                  fbt('Airbnb', '_ProvisionedChanges.airbnb')
                )}
                {this.renderAtt(
                  'facebook',
                  fbt('Facebook', '_ProvisionedChanges.facebook')
                )}
                {this.renderAtt(
                  'twitter',
                  fbt('Twitter', '_ProvisionedChanges.twitter')
                )}
                {this.renderAtt('google', 'Google', true)}
              </div>
            </div>

            <ProfileStrength
              large={true}
              published={get(this.props, 'identity.strength') || 0}
              unpublished={unpublishedProfileStrength(this)}
            />

            <div className="actions">
              <DeployIdentity
                className={`btn btn-primary btn-rounded btn-lg`}
                identity={get(this.props, 'identity.id')}
                refetch={this.props.identityRefetch}
                profile={pick(this.state, [
                  'firstName',
                  'lastName',
                  'description',
                  'avatar'
                ])}
                attestations={[
                  ...(this.state.attestations || []),
                  ...attestations
                ]}
                validate={() => this.validate()}
                onComplete={() =>
                  store.set(`attestations-${this.props.wallet}`, undefined)
                }
                children={fbt('Publish Now', 'Profile.publishNow')}
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
              'avatar'
            ])}
            onClose={() => this.setState({ editProfile: false })}
            onChange={newState =>
              this.setState(newState, () => this.validate())
            }
          />
        )}
      </div>
    )
  }

  renderAtt(type, text, soon) {
    const { wallet } = this.props
    const profile = get(this.props, 'identity') || {}

    let status = ''
    if (profile[`${type}Verified`]) {
      status = ' published'
    } else if (this.state[`${type}Attestation`]) {
      status = ' provisional'
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
          open={this.state[type]}
          onClose={() => this.setState({ [type]: false })}
          onComplete={att => {
            this.setState({ [`${type}Attestation`]: att }, () => {
              this.storeAttestations()
            })
          }}
        />
      )
    }

    return (
      <>
        <div
          className={`profile-attestation ${type}${status}`}
          onClick={() => this.setState({ [type]: true })}
        >
          <i />
          {text}
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

export default withWallet(withIdentity(UserProfile))

require('react-styl')(`
  .profile-edit
    margin-top: 3rem
    .gray-box
      border: 1px solid var(--light)
      border-radius: var(--default-radius)
      padding: 1rem
      margin-bottom: 2rem
    .avatar-wrap
      margin-right: 2rem
      width: 10rem
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
      font-size: 14px;
      background: url(images/identity/identity.svg) no-repeat center 1.5rem;
      background-size: 5rem;
      padding-top: 8rem;
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
