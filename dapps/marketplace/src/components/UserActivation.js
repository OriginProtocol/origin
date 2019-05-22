import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import pick from 'lodash/pick'

import withConfig from 'hoc/withConfig'
import withWallet from 'hoc/withWallet'

import Steps from './Steps'
import ImageCropper from './ImageCropper'
import Avatar from './Avatar'
import DeployIdentity from 'pages/identity/mutations/DeployIdentity'
import UserProfileCreated from './_UserProfileCreated'
import MobileModal from './MobileModal'

import GenerateEmailCodeMutation from 'mutations/GenerateEmailCode'
import VerifyEmailCodeMutation from 'mutations/VerifyEmailCode'

import DeployProxy from 'pages/identity/mutations/DeployProxy'

import { uploadImages } from 'utils/uploadImages'

class UserActivation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stage: 'PublishDetail', // TEMP: 'AddEmail',
      step: 1,
      loading: false,
      error: null,
      email: '',
      code: '',
      firstName: '',
      lastName: '',
      firstNameError: null
    }
  }

  render() {
    const {
      stage,
      step,
      personalDataModal,
      shouldClosePersonalDataModal
    } = this.state
    const { renderMobileVersion, hideHeader } = this.props

    let stepHeader

    if (!hideHeader) {
      stepHeader =
        stage === 'ProfileCreated' ? null : (
          <>
            <h2 className="step-title">
              {stage !== 'PublishDetail' && (
                <fbt desc="UserActivation.addYourEmail">Add your email</fbt>
              )}
              {stage === 'PublishDetail' && (
                <fbt desc="UserActivation.addYourEmail">Add name and photo</fbt>
              )}
            </h2>
            <Steps steps={2} step={step} />
          </>
        )
    }

    return (
      <div
        className={`user-activation${
          renderMobileVersion ? ' mobile' : ' desktop'
        }`}
      >
        {stepHeader}
        <div>{this[`render${stage}`]()}</div>
        {personalDataModal && (
          <MobileModal
            closeOnEsc={false}
            shouldClose={shouldClosePersonalDataModal}
            className="user-activation personal-data-modal"
            fullscreen={false}
            onClose={() =>
              this.setState({
                personalDataModal: false,
                shouldClosePersonalDataModal: false
              })
            }
          >
            {this.renderPersonalDataModal()}
          </MobileModal>
        )}
        {/* { txModal && (
          <MobileModal
           shouldClose={shouldCloseTxModal}
           className="user-activation"
           fullscreen={false}>
           {this.renderTransactionModal()}
          </MobileModal>
        )} */}
      </div>
    )
  }

  renderAddEmail() {
    const { renderMobileVersion } = this.props

    const headerText = renderMobileVersion ? (
      <fbt desc="UserActivation.enterValidEmail">
        Enter a valid email address
      </fbt>
    ) : (
      <fbt desc="UserActivation.whatsYourEmail">What’s your email address?</fbt>
    )

    return (
      <Mutation
        mutation={GenerateEmailCodeMutation}
        onCompleted={({ generateEmailCode: result }) => {
          if (result.success) {
            this.setState({
              stage: 'VerifyEmail',
              loading: false
            })
          } else {
            this.setState({
              error: result.reason,
              loading: false
            })
          }
        }}
        onError={errorData => {
          console.error('Error', errorData)
          this.setState({ error: 'Check console', loading: false })
        }}
      >
        {generateCode => (
          <form
            onSubmit={e => {
              e.preventDefault()
              if (this.state.loading) return
              this.setState({ error: null, loading: true })

              const emailRegex = /^[a-z0-9-._+]+@[a-z0-9-]+\.([a-z]{2,4})(\.[a-z]{2,4})?$/i
              if (!emailRegex.test(this.state.email)) {
                this.setState({
                  error: 'This is not a valid email address',
                  loading: false
                })
                return
              }

              generateCode({
                variables: {
                  email: this.state.email
                }
              })
            }}
          >
            <div className="boxed-container">
              <h3>{headerText}</h3>
              <div className="mt-3">
                <input
                  type="email"
                  className="form-control form-control-lg text-center"
                  placeholder="username@email.com"
                  value={this.state.email}
                  onChange={e => this.setState({ email: e.target.value })}
                />
              </div>
              {this.state.error && (
                <div className="alert alert-danger mt-3">
                  {this.state.error}
                </div>
              )}
              <div className="help mt-3">
                <fbt desc="UserActivation.emailHelp ">
                  We use your email to send you important notifications when you
                  buy or sell.
                </fbt>
              </div>
            </div>
            <div className="info">
              <span className="title">
                <fbt desc="UserActivation.visibleOnBlockchain">
                  What will be visible on the blockchain?
                </fbt>
              </span>
              <fbt desc="UserActivation.verifiedButNotEmail">
                That you have a verified email, but NOT your actual email
                address
              </fbt>
            </div>
            <div className="actions">
              <button
                type="submit"
                className="btn btn-primary mt-3 mb-3"
                children={
                  this.state.loading
                    ? fbt('Loading...', 'Loading...')
                    : fbt('Continue', 'Continue')
                }
              />
            </div>
          </form>
        )}
      </Mutation>
    )
  }

  renderVerifyEmail() {
    const { email, code } = this.state
    const { renderMobileVersion } = this.props

    const headerText = renderMobileVersion ? (
      <fbt desc="UserActivation.codeSentToEmail">We emailed you a code</fbt>
    ) : (
      <fbt desc="UserActivation.checkYourEmail">Please check your email</fbt>
    )

    const placeholderText = renderMobileVersion
      ? fbt('Enter verification code', 'UserActivation.enterVerificationCode')
      : fbt('Enter code', 'UserActivation.enterCode')

    return (
      <Mutation
        mutation={VerifyEmailCodeMutation}
        onCompleted={({ verifyEmailCode: result }) => {
          if (result.success) {
            this.setState({
              stage: 'PublishDetail',
              loading: false,
              step: 2,
              data: result.data
            })
          } else {
            this.setState({
              error: result.reason,
              loading: false
            })
          }
        }}
        onError={errorData => {
          console.error('Error', errorData)
          this.setState({ error: 'Check console', loading: false })
        }}
      >
        {verifyCode => (
          <form
            onSubmit={e => {
              e.preventDefault()
              if (this.state.loading) return
              this.setState({ error: false, loading: true })

              const trimmedCode = this.state.code.trim()

              if (trimmedCode.length !== 6 || isNaN(trimmedCode)) {
                this.setState({
                  error: 'Verification code should be a 6 digit number',
                  loading: false
                })
                return
              }

              verifyCode({
                variables: { identity: this.props.wallet, email, code }
              })
            }}
          >
            <div className="boxed-container">
              <h3>{headerText}</h3>
              <div className="mt-3">
                <input
                  type="tel"
                  maxLength="6"
                  className="form-control form-control-lg"
                  placeholder={placeholderText}
                  value={this.state.code}
                  onChange={e => this.setState({ code: e.target.value })}
                />
              </div>
              {this.state.error && (
                <div className="alert alert-danger mt-3">
                  {this.state.error}
                </div>
              )}
              <div className="help mt-3">
                <fbt desc="UserActivation.emailHelp ">
                  We sent a code to the email address you provided. Please enter
                  it above.
                </fbt>
              </div>
            </div>
            <div className="info">
              <span className="title">
                <fbt desc="UserActivation.visibleOnBlockchain">
                  What will be visible on the blockchain?
                </fbt>
              </span>
              <fbt desc="UserActivation.verifiedButNotEmail">
                That you have a verified email, but NOT your actual email
                address
              </fbt>
            </div>
            <div className="actions">
              <button
                type="submit"
                className="btn btn-primary mt-3 mb-3"
                disabled={this.state.code.length !== 6}
                children={
                  this.state.loading
                    ? fbt('Loading...', 'Loading...')
                    : fbt('Verify', 'Verify')
                }
              />
            </div>
          </form>
        )}
      </Mutation>
    )
  }

  renderPublishDetail() {
    const { renderMobileVersion } = this.props
    const attestations = [] // TEMP: [this.state.data]

    const headerText = renderMobileVersion ? null : (
      <fbt desc="UserActivation.addNameAndPhoto">Add name and photo</fbt>
    )

    return (
      <form
        onSubmit={e => {
          e.preventDefault()
          this.validate()
          // if (this.validate()) {
          //   this.setState({
          //     txModal: true
          //   })
          // }
        }}
      >
        <h3>{headerText}</h3>
        <div className="boxed-container">
          <div className="avatar-wrap mt-3">
            <ImageCropper
              onChange={async avatar => {
                const { ipfsRPC } = this.props.config
                const uploadedImages = await uploadImages(ipfsRPC, [avatar])
                const avatarImg = uploadedImages[0]
                if (avatarImg) {
                  const avatarUrl = avatarImg.url
                  this.setState({ avatar, avatarUrl })
                }
              }}
            >
              <Avatar className="with-cam" avatarUrl={this.state.avatarUrl} />
            </ImageCropper>
          </div>
          <div className="mt-5">
            {renderMobileVersion && <fbt desc="firstName">First Name</fbt>}
            <input
              type="text"
              className="form-control form-control-lg"
              value={this.state.firstName}
              placeholder={
                renderMobileVersion ? '' : fbt('First Name', 'firstName')
              }
              onChange={e => this.setState({ firstName: e.target.value })}
            />
            {this.state.firstNameError && (
              <div className="alert alert-danger mt-3">
                {this.state.firstNameError}
              </div>
            )}
          </div>
          <div className="mt-3">
            {renderMobileVersion && <fbt desc="lastName">Last Name</fbt>}
            <input
              type="text"
              className="form-control form-control-lg"
              value={this.state.lastName}
              placeholder={
                renderMobileVersion ? '' : fbt('Last Name', 'lastName')
              }
              onChange={e => this.setState({ lastName: e.target.value })}
            />
          </div>
          {this.state.error && (
            <div className="alert alert-danger mt-3">{this.state.error}</div>
          )}
        </div>
        <div className="info yellow">
          <span className="title">
            <fbt desc="UserActivation.visibleOnBlockchain">
              What will be visible on the blockchain?
            </fbt>
          </span>
          <fbt desc="UserActivation.nameAndPhoto">Your name and photo.</fbt>
          <a
            href="#"
            onClick={e => {
              e.preventDefault()
              this.setState({
                personalDataModal: true
              })
            }}
          >
            <fbt desc="UserActivation.learnMore">Learn more</fbt>
          </a>
        </div>
        <div className="actions">
          {/* <button
            type="submit"
            className="btn btn-primary mt-3 mb-3"
            children={fbt('Publish', 'Publish')}
          /> */}
          <DeployIdentity
            className="btn btn-primary mt-3 mb-3"
            identity={this.props.wallet}
            profile={pick(this.state, [
              'firstName',
              'lastName',
              'avatar',
              'avatarUrl'
            ])}
            attestations={attestations}
            validate={() => this.validate()}
            children={fbt('Publish', 'Publish')}
            onComplete={() => {
              if (this.props.renderMobileVersion) {
                this.setState({
                  stage: 'ProfileCreated'
                })
              } else if (this.props.onCompleted) {
                this.props.onCompleted()
              }
            }}
          />
        </div>
      </form>
    )
  }

  // renderTransactionModal() {
  //   return (
  //     <div>
  //       <h2></h2>
  //     </div>
  //   )
  // }

  renderProfileCreated() {
    return <UserProfileCreated onCompleted={this.props.onCompleted} />
  }

  renderPersonalDataModal() {
    return (
      <>
        <div className="header-image">
          <img src="images/tout-header-image.png" alt="header-image" />
        </div>
        <div class="padded-content">
          <h2>
            <fbt desc="UserActivation.blockchainAndPersonalData">
              Blockchain &amp; Your Personal Data
            </fbt>
          </h2>
          <p>
            <fbt desc="UserActivation.personalDataInfo">
              By creating a profile, you are associating your name and photo with
              your Ethereum account. This means that others will be able to
              connect your blockchain transactions to your name and photo.
            </fbt>
          </p>
          <div className="actions">
            <button
              className="btn btn-primary"
              onClick={() =>
                this.setState({ shouldClosePersonalDataModal: true })
              }
            >
              Got it
            </button>
          </div>
        </div>
      </>
    )
  }

  validate() {
    let newState = {
      firstNameError: null,
      valid: true
    }

    if (!this.state.firstName) {
      newState = {
        ...newState,
        valid: false,
        firstNameError: fbt(
          'First Name is required',
          'UserActivation.firstNameRequired'
        )
      }
    }

    this.setState(newState)

    return newState.valid
  }
}

export default withConfig(withWallet(UserActivation))

require('react-styl')(`
  .user-activation
    padding: 20px
    .step-title
      font-family: var(--heading-font)
      font-size: 28px
      font-weight: 300
      font-style: normal
      color: var(--dark)
      margin-bottom: 0.75rem
    .boxed-container
      border-radius: 5px
      border: solid 1px #c2cbd3
      background-color: var(--white)
      padding: 20px
      > h3
        background: url(images/identity/verification-shape-grey.svg) no-repeat center
        background-size: 7rem
        padding-top: 9rem
        background-position: center top
        position: relative
        text-align: center
        &::before
          content: ""
          position: absolute
          top: 0
          left: 0
          height: 7.5rem
          right: 0
          background-repeat: no-repeat
          background-image: url(images/identity/email-icon-dark.svg)
          background-size: 3.5rem
          background-position: center
      input
        border-radius: 5px
        border: solid 1px #c2cbd3
        background-color: #f1f6f9
        text-align: center
      .help
        text-align: center
        font-family: Lato
        font-size: 14px
        color: var(--bluey-grey)
    .info
      text-align: center
      border-radius: 5px
      border: solid 1px var(--bluey-grey)
      background-color: rgba(152, 167, 180, 0.1)
      font-family: Lato
      font-size: 14px
      color: black
      padding: 10px
      margin-top: 1rem
      .title
        display: block
        font-weight: bold
        margin-bottom: 3px
        & ~ a
          margin-left: 5px
      &.yellow
        border: solid 1px var(--golden-rod)
        background-color: rgba(244, 193, 16, 0.1)
      &.white
        border: solid 1px #c2cbd3
        background-color: white
        display: flex
        text-align: left
        .image
          flex: auto 0 0
          img
            margin-right: 1rem
        .content
          flex: auto 1 1
    .actions
      .btn
        width: 100%
        border-radius: 50px
        padding: 0.5rem 1rem
    .avatar
      border-radius: 50%
      width: 150px
      padding-top: 150px
      margin: 0 auto
    &.desktop
      padding: 20px
      .boxed-container
        border: 0
        > h3
          &::before
            background-image: url(images/identity/email-icon-light.svg)
      .actions
        .btn
          width: auto
      
      .avatar
        border-radius: 50%
    &.personal-data-modal
      padding: 0
      text-align: center
      .header-image, img
        width: 100%
      > .padded-content
        padding: 20px
        h2
          font-family: Poppins
          font-weight: 300
          color: var(--dark)
          letter-spacing: -0.3px
          line-height: 1.43
          margin-bottom: 1.5rem
        p
          font-family: Lato
          font-size: 1rem
          line-height: 1.43
          color: var(--dark)
          margin-bottom: 2.25rem
`)
