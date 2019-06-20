import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Redirect from 'components/Redirect'
import UserActivation from 'components/DesktopUserActivation'
import HelpOriginWallet from 'components/DownloadApp'
import ListingPreview from './_ListingPreview'
import HelpProfile from './_HelpProfile'
import { withRouter } from 'react-router-dom'

class OnboardProfile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      finished: false
    }
  }

  render() {
    const { listing, linkPrefix, hideOriginWallet } = this.props
    const { finished } = this.state

    if (finished) {
      return <Redirect to={`${linkPrefix}/onboard/finished`} />
    }

    const nextLink = `${linkPrefix}/onboard/rewards`

    return (
      <>
        <h1 className="mb-1">
          <fbt desc="onboard.Profile.createAccount">Create an Account</fbt>
        </h1>
        <p className="description mb-5">
          <fbt desc="onboard.Profile.description">
            Create a basic profile so others will know who you are in the Origin
            Marketplace.
          </fbt>
        </p>
        <div className="row">
          <div className="col-md-8">
            <div
              className={`onboard-box profile${
                this.props.rewards ? ' rewards' : ''
              }`}
            >
              {this.props.rewards && (
                <img
                  src="images/onboard/ogn-image@3x.png"
                  className="rewards-signup-header-image"
                />
              )}
              <div className="pt-3">
                <UserActivation
                  stage={this.props.rewards ? 'RewardsSignUp' : null}
                  onStageChanged={newStage => {
                    if (newStage === 'RewardsSignUp' && !this.props.rewards) {
                      this.props.history.push(nextLink)
                    }
                  }}
                  onCompleted={() => {
                    this.setState({
                      finished: true
                    })
                  }}
                />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <ListingPreview listing={listing} />
            {hideOriginWallet ? null : <HelpOriginWallet />}
            <HelpProfile />
          </div>
        </div>
      </>
    )
  }
}

export default withRouter(OnboardProfile)

require('react-styl')(`
  .onboard .onboard-box.profile
    padding: 1rem
    &.rewards
      padding: 0
      > img
        width: 100%
        height: 250px
        object-fit: cover
    > .user-activation
      max-width: 475px
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
    .indicator
      position: absolute
      width: 0.62rem
      height: 0.62rem
      border-radius: 0.62rem
      background-color: var(--golden-rod)
      right: 0.27rem
      top: 0.27rem
    .profile-attestation
      padding: 0.65rem 1rem
      border: 1px dashed var(--light)
      border-radius: var(--default-radius)
      display: flex
      position: relative
      font-size: 18px
      font-weight: normal
      color: var(--bluey-grey)
      background-color: var(--pale-grey-eight)
      align-items: center
      overflow: hidden
      &.interactive
        cursor: pointer
        color: black
        &:hover
          border-color: var(--clear-blue)
          border-style: solid
      > i
        display: block
        position: relative
        background: url(images/identity/verification-shape-grey.svg) no-repeat center
        width: 2rem
        height: 2rem
        background-size: 95%
        display: flex
        margin-right: 1rem
        &::before
          content: ""
          flex: 1
          background-repeat: no-repeat
          background-position: center
      &.phone > i::before
        background-image: url(images/identity/phone-icon-light.svg)
        background-size: 0.67rem
      &.email > i::before
        background-image: url(images/identity/email-icon-light.svg)
        background-size: 1.05rem
      &.airbnb > i::before
        background-image: url(images/identity/airbnb-icon-light.svg)
        background-size: 1.2rem
        margin-left: 0.1rem
      &.facebook > i::before
        background-image: url(images/identity/facebook-icon-light.svg)
        background-size: 0.6rem
      &.twitter > i::before
        background-image: url(images/identity/twitter-icon-light.svg)
        background-size: 0.975rem
      &.google > i::before
        background-image: url(images/identity/google-icon.svg)
        background-size: 1.1rem
        margin-left: 0.1rem
      &.website > i::before
        background-image: url(images/identity/website-icon-light.svg)
        background-size: 1rem
      &.kakao > i::before
        background-image: url(images/identity/kakao-icon-large.svg)
        background-size: 1rem
      &.github > i::before
        background-image: url(images/identity/github-icon-large.svg)
        background-size: 1rem
      &.linkedin > i::before
        background-image: url(images/identity/linkedin-icon-large.svg)
        background-size: 1rem
      &.wechat > i::before
        background-image: url(images/identity/wechat-icon-large.svg)
        background-size: 1rem

      &.published,&.provisional
        background-color: var(--pale-clear-blue)
        border-style: solid
        color: var(--dusk)
        > i
          background-image: url(images/identity/verification-shape-blue.svg)
      &.disabled
        opacity: 0.5
      &.soon
        opacity: 0.5
        &::after
          content: "Coming Soon"
          background: var(--light)
          position: absolute
          color: var(--pale-grey-five)
          font-size: 8px
          font-weight: 900
          right: -2.4rem
          top: -1.1rem
          text-transform: uppercase
          transform: rotate(45deg)
          padding: 2rem 2rem 0.2rem 2rem
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
        content: ""
        background: var(--greenblue) url(images/checkmark-white.svg) no-repeat center
        width: 2rem
        height: 2rem
        border-radius: 2rem
        margin-left: auto
        background-size: 59%

  @media (max-width: 767.98px)
    .onboard .onboard-box.profile
      > form .image-cropper
        max-width: 6rem
    .profile-attestations
      grid-template-columns: repeat(auto-fill,minmax(170px, 1fr))

`)
