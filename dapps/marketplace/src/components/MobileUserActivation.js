import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import pick from 'lodash/pick'

import withConfig from 'hoc/withConfig'
import withWallet from 'hoc/withWallet'

import MobileModal from './MobileModal'
import Steps from './Steps'
import ImageCropper from './ImageCropper'
import Avatar from './Avatar'
import DeployIdentity from 'pages/identity/mutations/DeployIdentity'

import GenerateEmailCodeMutation from 'mutations/GenerateEmailCode'
import VerifyEmailCodeMutation from 'mutations/VerifyEmailCode'

import { uploadImages } from 'utils/uploadImages'

class MobileUserActivation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stage: 'AddEmail',
      modal: true,
      step: 1,
      loading: false,
      error: null,
      shouldClose: false,
      email: '',
      code: '',
      firstName: '',
      lastName: '',
      firstNameError: null
    }
  }

  render() {
    const { stage, modal, step, shouldClose } = this.state

    if (!modal) {
      return null
    }

    return (
      <>
        <MobileModal
          onClose={() => this.onClose()}
          shouldClose={shouldClose}
          title={
            <fbt desc="MobileUserActivation.createProfile">
              Create a Profile
            </fbt>
          }
          className="mobile-user-activation"
        >
          <h2 className="step-title">
            {stage !== 'PublishDetail' && (
              <fbt desc="MobileUserActivation.addYourEmail">Add your email</fbt>
            )}
            {stage === 'PublishDetail' && (
              <fbt desc="MobileUserActivation.addYourEmail">
                Add name and photo
              </fbt>
            )}
          </h2>
          <Steps steps={2} step={step} />
          <div>{this[`render${stage}`]()}</div>
        </MobileModal>
        {/* { txModal && (
          <MobileModal
           shouldClose={shouldCloseTxModal}
           className="mobile-user-activation"
           fullscreen={false}>
           {this.renderTransactionModal()}
          </MobileModal>
        )} */}
      </>
    )
  }

  onClose() {
    this.setState({
      modal: false
    })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  renderAddEmail() {
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
              <h3>
                <fbt desc="MobileUserActivation.enterValidEmail">
                  Enter a valid email address
                </fbt>
              </h3>
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
                <fbt desc="MobileUserActivation.emailHelp ">
                  We use your email to send you important notifications when you
                  buy or sell.
                </fbt>
              </div>
            </div>
            <div className="info">
              <span className="title">
                <fbt desc="MobileUserActivation.visibleOnBlockchain">
                  What will be visible on the blockchain?
                </fbt>
              </span>
              <fbt desc="MobileUserActivation.verifiedButNotEmail">
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
              <h3>
                <fbt desc="MobileUserActivation.codeSentToEmail">
                  We emailed you a code
                </fbt>
              </h3>
              <div className="mt-3">
                <input
                  type="tel"
                  maxLength="6"
                  className="form-control form-control-lg"
                  placeholder={fbt(
                    'Enter verification code',
                    'MobileUserActivation.enterCode'
                  )}
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
                <fbt desc="MobileUserActivation.emailHelp ">
                  We sent a code to the email address you provided. Please enter
                  it above.
                </fbt>
              </div>
            </div>
            <div className="info">
              <span className="title">
                <fbt desc="MobileUserActivation.visibleOnBlockchain">
                  What will be visible on the blockchain?
                </fbt>
              </span>
              <fbt desc="MobileUserActivation.verifiedButNotEmail">
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
    const attestations = [this.state.data]

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
          <div className="mt-3">
            <fbt desc="firstName">First Name</fbt>
            <input
              type="text"
              className="form-control form-control-lg"
              value={this.state.firstName}
              onChange={e => this.setState({ firstName: e.target.value })}
            />
            {this.state.firstNameError && (
              <div className="alert alert-danger mt-3">
                {this.state.firstNameError}
              </div>
            )}
          </div>
          <div className="mt-3">
            <fbt desc="lastName">Last Name</fbt>
            <input
              type="text"
              className="form-control form-control-lg"
              value={this.state.lastName}
              onChange={e => this.setState({ lastName: e.target.value })}
            />
          </div>
          {this.state.error && (
            <div className="alert alert-danger mt-3">{this.state.error}</div>
          )}
        </div>
        <div className="info">
          <span className="title">
            <fbt desc="MobileUserActivation.visibleOnBlockchain">
              What will be visible on the blockchain?
            </fbt>
          </span>
          <fbt desc="MobileUserActivation.nameAndPhoto">
            Your name and photo.
          </fbt>
          <a href="#">
            <fbt desc="MobileUserActivation.learnMore">Learn more</fbt>
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
              this.setState({
                shouldClose: true
              })
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
          'MobileUserActivation.firstNameRequired'
        )
      }
    }

    this.setState(newState)

    return newState.valid
  }
}

export default withConfig(withWallet(MobileUserActivation))

require('react-styl')(`
  .mobile-user-activation
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
    .actions
      .btn
        width: 100%
    .avatar
      border-radius: 50%
      width: 150px
      padding-top: 150px
      margin: 0 auto
`)
