import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import ImageCropper from 'components/ImageCropper'
import Link from 'components/Link'
import Steps from 'components/Steps'

import ProfileStrength from './_ProfileStrength'
import ListingPreview from './_ListingPreview'
import HelpProfile from './_HelpProfile'

const query = gql`
  query WalletStatus {
    web3 {
      metaMaskAccount {
        id
      }
    }
  }
`

const Attestation = ({ type, text, active, onClick, soon }) => {
  active = active ? ' active' : ''
  soon = soon ? ' soon' : ''
  return (
    <div
      className={`profile-attestation ${type}${active}${soon}`}
      onClick={onClick ? () => onClick() : null}
    >
      <i />
      {text}
    </div>
  )
}

class OnboardProfile extends Component {
  state = {}
  render() {
    const { listing } = this.props
    const { pic } = this.state

    return (
      <>
        <div className="step">Step 4</div>
        <h3>Enter Your Profile Information</h3>
        <div className="row">
          <div className="col-md-8">
            <Steps steps={4} step={4} />
            <Query query={query} notifyOnNetworkStatusChange={true}>
              {({ error, data, networkStatus }) => {
                if (networkStatus === 1) {
                  return <div>Loading...</div>
                } else if (error) {
                  return <p className="p-3">Error :(</p>
                } else if (!data || !data.web3) {
                  return <p className="p-3">No Web3</p>
                }

                const nextLink = `/listings/${listing.id}`

                return (
                  <div className="onboard-box pt-3">
                    <form className="profile">
                      <div className="row">
                        <div className="col-4">
                          <ImageCropper
                            onChange={pic => this.setState({ pic })}
                          >
                            <div
                              className={`profile-logo ${
                                pic ? 'custom' : 'default'
                              }`}
                              style={{
                                backgroundImage: pic ? `url(${pic})` : null
                              }}
                            />
                          </ImageCropper>
                        </div>
                        <div className="col-8">
                          <div className="row">
                            <div className="form-group col-6">
                              <label>First Name</label>
                              <input type="text" className="form-control" />
                            </div>
                            <div className="form-group col-6">
                              <label>Last Name</label>
                              <input type="text" className="form-control" />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Description</label>
                            <textarea
                              className="form-control"
                              placeholder="Tell us a bit about yourself"
                            />
                          </div>
                        </div>
                      </div>

                      <label className="mt-3">Attestations</label>
                      <div className="profile-attestations">
                        <Attestation
                          type="phone"
                          active
                          onClick={() => this.setState({ phone: true })}
                          text="Phone Number"
                        />
                        <Attestation type="email" text="Email" />
                        <Attestation type="airbnb" text="Airbnb" />
                        <Attestation type="facebook" text="Facebook" />
                        <Attestation type="twitter" text="Twitter" />
                        <Attestation type="google" text="Google" soon />
                      </div>
                      <ProfileStrength width="25%" />

                      <div className="no-funds">
                        <h5>You don&apos;t have funds</h5>
                        You need to have funds in your wallet to create an
                        identity. You can always do this later after you fund
                        your wallet by going to your settings.
                      </div>
                    </form>
                    <Link to={nextLink} className="btn btn-primary">
                      Publish
                    </Link>
                  </div>
                )
              }}
            </Query>
          </div>
          <div className="col-md-4">
            <ListingPreview listing={listing} />
            <HelpProfile />
          </div>
        </div>
      </>
    )
  }
}

export default OnboardProfile

require('react-styl')(`
  .onboard .onboard-box
    .no-funds
      background-color: rgba(244, 193, 16, 0.1)
      border: 1px solid var(--golden-rod)
      border-radius: 5px
      padding: 2rem 2rem 2rem 5rem
      position: relative
      &::before
        content: ""
        background-color: var(--steel);
        border-radius: 2rem;
        width: 3rem;
        height: 3rem;
        position: absolute;
        left: 1rem;
        top: 1rem;
      h5
        font-family: Poppins;
        font-size: 24px;
        font-weight: 200;
    .profile-logo
      border-radius: 1rem
      position: relative
      width: 100%
      padding-top: 100%
      &.default
        background: #233040 url(images/avatar-blue.svg) no-repeat center bottom
        background-size: 63%
      &.custom
        border: 1px solid var(--light)
        background-size: cover

      &::after
        content: ""
        width: 2.5rem
        height: 2.5rem
        background: url(images/camera-icon-circle.svg) no-repeat center
        background-size: 100%
        position: absolute
        bottom: 0.5rem
        right: 0.5rem

    form.profile
      text-align: left
      margin-top: 1rem
      width: 100%
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
      display: grid
      grid-column-gap: 0.5rem
      grid-row-gap: 0.5rem
      grid-template-columns: repeat(auto-fill,minmax(220px, 1fr))
      margin-bottom: 2rem
      .profile-attestation
        padding: 0.75rem 1rem
        border: 1px dashed var(--light)
        border-radius: 5px
        display: flex
        font-size: 18px
        font-weight: normal
        color: var(--bluey-grey)
        background-color: var(--pale-grey-eight)
        align-items: center;
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

        &.active
          background-color: white
          border-style: solid
          color: var(--dusk)
          > i
            background-image: url(images/identity/verification-shape-blue.svg)
          &::after
            content: "";
            background: var(--greenblue) url(images/checkmark-white.svg) no-repeat center;
            width: 2rem;
            height: 2rem;
            border-radius: 2rem;
            margin-left: auto;
            background-size: 59%;

`)
