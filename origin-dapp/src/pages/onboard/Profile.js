import React, { Component } from 'react'
import pick from 'lodash/pick'
import get from 'lodash/get'

import ImageCropper from 'components/ImageCropper'
import Steps from 'components/Steps'
import Link from 'components/Link'

import { formInput, formFeedback } from 'utils/formHelpers'
import unpublishedProfileStrength from 'utils/unpublishedProfileStrength'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'
import withEthBalance from 'hoc/withEthBalance'

import ProfileStrength from 'components/ProfileStrength'
import Avatar from 'components/Avatar'

import PhoneAttestation from 'pages/identity/PhoneAttestation'
import EmailAttestation from 'pages/identity/EmailAttestation'
import FacebookAttestation from 'pages/identity/FacebookAttestation'
import TwitterAttestation from 'pages/identity/TwitterAttestation'
import DeployIdentity from 'pages/identity/mutations/DeployIdentity'

import ListingPreview from './_ListingPreview'
import HelpProfile from './_HelpProfile'

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
    const profile = get(this.props, 'identity')
    if (!prevProps.identity && profile) {
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
    const { listing } = this.props
    const { avatar } = this.state

    const linkPrefix = listing ? `/listing/${listing.id}` : ''

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    const attestations = Object.keys(AttestationComponents).reduce((m, key) => {
      if (this.state[`${key}Attestation`])
        m.push(this.state[`${key}Attestation`])
      return m
    }, [])

    const hasBalance = Number(this.props.ethBalance || 0) > 0

    return (
      <>
        <div className="step">Step 4</div>
        <h3>Enter Your Profile Information</h3>
        <div className="row">
          <div className="col-md-8">
            <Steps steps={4} step={4} />
            <div className="onboard-box profile pt-3">
              <form
                onSubmit={e => {
                  e.preventDefault()
                  this.validate()
                }}
              >
                <div className={hasBalance ? null : 'mask'}>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="avatar-wrap">
                        <ImageCropper
                          onChange={a => this.setState({ avatar: a })}
                        >
                          <Avatar className="with-cam" avatar={avatar} />
                        </ImageCropper>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="row">
                        <div className="form-group col-md-6">
                          <label>First Name</label>
                          <input
                            type="text"
                            className="form-control"
                            {...input('firstName')}
                          />
                          {Feedback('firstName')}
                        </div>
                        <div className="form-group col-md-6">
                          <label>Last Name</label>
                          <input
                            type="text"
                            className="form-control"
                            {...input('lastName')}
                          />
                          {Feedback('lastName')}
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          className="form-control"
                          placeholder="Tell us a bit about yourself"
                          {...input('description')}
                        />
                        {Feedback('description')}
                      </div>
                    </div>
                  </div>

                  <label className="mt-3">Attestations</label>
                  <div className="profile-attestations with-checkmarks">
                    {this.renderAtt('email', 'Email')}
                  </div>

                  <ProfileStrength
                    published={get(this.props, 'identity.strength', 0)}
                    unpublished={unpublishedProfileStrength(this)}
                  />
                </div>

                {hasBalance ? null : (
                  <div className="no-funds">
                    <h5>You don&apos;t have funds</h5>
                    You need to have funds in your wallet to create an identity.
                    You can always do this later after you fund your wallet by
                    going to your settings.
                  </div>
                )}
              </form>
              {!hasBalance ? null : (
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
              )}
            </div>
            <div className="continue-btn">
              <Link
                to={`${linkPrefix}/onboard/back`}
                className={`btn btn-outline-primary`}
                children={hasBalance ? 'Done' : 'Skip for now'}
              />
            </div>
          </div>
          <div className="col-md-4">
            <ListingPreview listing={listing} />
            <HelpProfile />
          </div>
        </div>
      </>
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
          onClose={() => {
            this.setState({ [type]: false })
          }}
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

export default withWallet(withEthBalance(withIdentity(OnboardProfile)))

require('react-styl')(`
  .onboard .onboard-box.profile
    padding: 1rem
    .mask
      position: relative
      &::after
        content: ""
        position: absolute
        background: rgba(255,255,255,0.6)
        top: 0
        bottom: 0
        left: 0
        right: 0
    .no-funds
      background-color: rgba(244, 193, 16, 0.1)
      border: 1px solid var(--golden-rod)
      border-radius: var(--default-radius)
      padding: 1.6rem 2rem 2rem 5rem
      position: relative
      &::before
        content: ""
        background-color: var(--steel)
        border-radius: 2rem
        width: 3rem
        height: 3rem
        position: absolute
        left: 1rem
        top: 1rem
      h5
        font-family: var(--heading-font)
        font-size: 24px
        font-weight: 200
    .avatar
      border-radius: 1rem

    > form
      text-align: left
      width: 100%
      .image-cropper
        max-width: 10rem
        margin: 0 auto 1rem auto
      label
        font-weight: normal
        color: black
        font-size: 18px
      .form-control
        font-size: 18px
        background-color: var(--pale-grey-eight)
        border-color: var(--light)
        &::-webkit-input-placeholder
          color: var(--bluey-grey)
      input.form-control
        padding-top: 1.5rem
        padding-bottom: 1.5rem
      textarea
        min-height: 3rem
    .profile-attestations
      margin-bottom: 2rem
      display: block

  .profile-attestations
    display: grid
    grid-column-gap: 0.5rem
    grid-row-gap: 0.5rem
    grid-template-columns: repeat(auto-fill,minmax(220px, 1fr))
    .profile-attestation
      padding: 0.75rem 1rem
      border: 1px dashed var(--light)
      border-radius: var(--default-radius)
      display: flex
      position: relative
      font-size: 18px
      font-weight: normal
      color: var(--bluey-grey)
      background-color: var(--pale-grey-eight)
      align-items: center;
      overflow: hidden
      &.interactive
        cursor: pointer
        &:hover
          border-color: var(--clear-blue)
          border-style: solid
      > i
        display: block
        position: relative
        background: url(images/identity/verification-shape-grey.svg) no-repeat center;
        width: 2.5rem;
        height: 2.5rem;
        background-size: 95%;
        display: flex
        margin-right: 1rem
        &::before
          content: ""
          flex: 1
          background-repeat: no-repeat
          background-position: center

      &.phone > i::before
        background-image: url(images/identity/phone-icon-light.svg)
        background-size: 0.9rem
      &.email > i::before
        background-image: url(images/identity/email-icon-light.svg)
        background-size: 1.4rem
      &.airbnb > i::before
        background-image: url(images/identity/airbnb-icon-light.svg)
        background-size: 1.6rem
      &.facebook > i::before
        background-image: url(images/identity/facebook-icon-light.svg)
        background-size: 0.8rem
      &.twitter > i::before
        background-image: url(images/identity/twitter-icon-light.svg)
        background-size: 1.3rem
      &.google > i::before
        background-image: url(images/identity/google-icon.svg)
        background-size: 1.3rem

      &.published,&.provisional
        background-color: var(--pale-clear-blue)
        border-style: solid
        color: var(--dusk)
        > i
          background-image: url(images/identity/verification-shape-blue.svg)
      &.soon
        opacity: 0.5
        &::after
          content: "Coming Soon"
          background: var(--light)
          position: absolute;
          color: var(--pale-grey-five);
          font-size: 8px;
          font-weight: 900;
          right: -2.2rem;
          top: -1rem
          text-transform: uppercase;
          transform: rotate(45deg);
          padding: 2rem 2rem 0.5rem 2rem
          width: 6rem
          text-align: center
          line-height: 8px
      &.published
        background-color: var(--pale-greenblue)
        border-color: var(--greenblue)
        > i
          background-image: url(images/identity/verification-shape-green.svg)

  .profile-attestations.with-checkmarks
    .profile-attestation
      &.published::after,&.provisional::after
        content: "";
        background: var(--greenblue) url(images/checkmark-white.svg) no-repeat center;
        width: 2rem;
        height: 2rem;
        border-radius: 2rem;
        margin-left: auto;
        background-size: 59%;
`)
