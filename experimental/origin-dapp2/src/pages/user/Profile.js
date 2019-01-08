import React, { Component } from 'react'
import pick from 'lodash/pick'
import get from 'lodash/get'

import unpublishedProfileStrength from 'utils/unpublishedProfileStrength'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'

import ProfileStrength from 'components/ProfileStrength'

import PhoneAttestation from 'pages/identity/PhoneAttestation'
import EmailAttestation from 'pages/identity/EmailAttestation'
import FacebookAttestation from 'pages/identity/FacebookAttestation'
import TwitterAttestation from 'pages/identity/TwitterAttestation'
import DeployIdentity from 'pages/identity/mutations/DeployIdentity'

import EditProfile from './_EditModal'

const AttestationComponents = {
  phone: PhoneAttestation,
  email: EmailAttestation,
  facebook: FacebookAttestation,
  twitter: TwitterAttestation
}

class OnboardProfile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      firstName: '',
      lastName: '',
      description: ''
    }
  }

  componentDidUpdate(prevProps) {
    const profile = get(this.props, 'identity.profile')
    if (profile && !prevProps.identity) {
      this.setState(
        pick(profile, [
          'firstName',
          'lastName',
          'description',
          'avatar',
          'facebookVerified',
          'twitterVerified',
          'airbnbVerified',
          'phoneVerified',
          'emailVerified'
        ])
      )
    }
  }

  render() {
    const attestations = Object.keys(AttestationComponents).reduce((m, key) => {
      if (this.state[`${key}Attestation`])
        m.push(this.state[`${key}Attestation`])
      return m
    }, [])

    const name = []
    if (this.state.firstName) name.push(this.state.firstName)
    if (this.state.lastName) name.push(this.state.lastName)

    return (
      <div className="container profile-edit">
        <div className="row">
          <div className="col-md-8">
            <div className="profile">
              <div className="avatar" />
              <div className="info">
                <h1>{name.length ? name.join(' ') : 'Unnamed User'}</h1>
                <div className="description">
                  {this.state.description ||
                    'An Origin user without a description'}
                </div>
              </div>
              <a
                className="edit"
                href="#"
                onClick={e => {
                  e.preventDefault()
                  this.setState({ editProfile: true })
                }}
              />
            </div>
            <h3>Verify yourself on Origin</h3>
            <div className="gray-box">
              <label className="mt-3">
                Please connect your accounts below to strengthen your identity
                on Origin.
              </label>
              <div className="profile-attestations">
                {this.renderAtt('phone', 'Phone Number')}
                {this.renderAtt('email', 'Email')}
                {this.renderAtt('airbnb', 'Airbnb')}
                {this.renderAtt('facebook', 'Facebook')}
                {this.renderAtt('twitter', 'Twitter')}
                {this.renderAtt('google', 'Google', true)}
              </div>
            </div>

            <ProfileStrength
              published={get(this.props, 'identity.profile.strength', 0)}
              unpublished={unpublishedProfileStrength(this)}
            />

            <DeployIdentity
              className="btn btn-primary"
              identity={get(this.props, 'identity.id')}
              profile={pick(this.state, [
                'firstName',
                'lastName',
                'description',
                'avatar'
              ])}
              attestations={attestations}
              validate={() => this.validate()}
              children="Publish"
            />
          </div>
          <div className="col-md-4" />
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
            onChange={newState => this.setState(newState)}
          />
        )}
      </div>
    )
  }

  renderAtt(type, text, soon) {
    const { wallet } = this.props
    const profile = get(this.props, 'identity.profile', {})

    let status = ''
    if (profile[`${type}Verified`]) {
      status = ' published'
    } else if (this.state[`${type}Attestation`]) {
      status = ' provisional'
    } else if (soon) {
      status = ' soon'
    }

    let AttestationComponent = AttestationComponents[type]
    if (AttestationComponent) {
      AttestationComponent = (
        <AttestationComponent
          wallet={wallet}
          open={this.state[type]}
          onClose={() => this.setState({ [type]: false })}
          onComplete={att => this.setState({ [`${type}Attestation`]: att })}
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

    if (!this.state.firstName) {
      newState.firstNameError = 'First Name is required'
    }

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    if (!newState.valid) {
      window.scrollTo(0, 0)
    }
    this.setState(newState)
    return newState.valid
  }
}

export default withWallet(withIdentity(OnboardProfile))

require('react-styl')(`
  .profile-edit
    .gray-box
      border: 1px solid var(--light)
      border-radius: 5px
      padding: 0 2rem
      margin-bottom: 2rem
    .profile
      position: relative
      h1
        margin: 0
      margin: 3rem 0 2rem 0
      a.edit
        background: url(images/edit-icon.svg) no-repeat center
        background-size: cover
        width: 2rem
        height: 2rem
        display: block
        position: absolute
        top: 0
        right: 0

`)
