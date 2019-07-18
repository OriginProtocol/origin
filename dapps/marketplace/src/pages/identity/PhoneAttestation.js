import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import pick from 'lodash/pick'
import { fbt } from 'fbt-runtime'

import withIsMobile from 'hoc/withIsMobile'
import withWallet from 'hoc/withWallet'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'
import PublishedInfoBox from 'components/_PublishedInfoBox'
import CountryDropdown from './_CountryDropdown'

import GeneratePhoneCodeMutation from 'mutations/GeneratePhoneCode'
import VerifyPhoneCodeMutation from 'mutations/VerifyPhoneCode'

class PhoneAttestation extends Component {
  state = {
    active: 'us',
    dropdown: true,
    stage: 'GenerateCode',
    phone: '',
    code: '',
    prefix: '1',
    method: 'sms'
  }

  componentDidUpdate(prevProps, prevState) {
    const didOpen = !prevProps.open && this.props.open,
      didChangeStage = prevState.stage !== this.state.stage
    if (this.inputRef && (didOpen || didChangeStage)) {
      this.inputRef.focus()
    }
  }

  render() {
    if (!this.props.open) {
      return null
    }

    const ModalComponent = this.props.isMobile ? MobileModal : Modal

    return (
      <ModalComponent
        title={fbt('Verify Phone Number', 'PhoneAttestation.verifyPhoneNumber')}
        className="attestation-modal phone"
        shouldClose={this.state.shouldClose}
        onClose={() => {
          const completed = this.state.completed

          if (completed) {
            this.props.onComplete(this.state.data)
          }

          this.setState({
            shouldClose: false,
            error: false,
            stage: 'GenerateCode',
            completed: false,
            data: null
          })

          this.props.onClose(completed)
        }}
        lightMode={true}
        skipAnimateOnExit={this.props.skipAnimateOnExit}
      >
        <div>{this[`render${this.state.stage}`]()}</div>
      </ModalComponent>
    )
  }

  renderGenerateCode() {
    const { isMobile } = this.props

    const header = isMobile ? null : (
      <fbt desc="PhoneAttestation.title">Verify your Phone Number</fbt>
    )

    const descEl = isMobile ? (
      <fbt desc="PhoneAttestation.mobile.description">
        Enter a valid 10-digit phone number
      </fbt>
    ) : (
      <fbt desc="PhoneAttestation.description">
        Enter your 10-digit phone number below
      </fbt>
    )

    const helpText = isMobile
      ? fbt(
          'By continuing, you give Origin permission to send you occasional messages such as notifications about your transactions.',
          'Attestatio.mobile.phonePublishClarification'
        )
      : fbt(
          'By verifying your phone number, you give Origin permission to send you occasional text messages such as notifications about your transactions.',
          'Attestation.phonePublishClarification'
        )

    return (
      <Mutation
        mutation={GeneratePhoneCodeMutation}
        onCompleted={res => {
          const result = res.generatePhoneCode
          if (result.success) {
            this.setState({ stage: 'VerifyCode', loading: false })
          } else {
            this.setState({ error: result.reason, loading: false })
          }
        }}
        onError={errorData => {
          console.error('Error', errorData)
          this.setState({ error: 'Check console' })
        }}
      >
        {generateCode => (
          <form
            onSubmit={e => {
              e.preventDefault()
              if (this.state.loading) return
              this.setState({ error: false, loading: true })
              generateCode({
                variables: pick(this.state, ['prefix', 'method', 'phone'])
              })
            }}
          >
            <h2>{header}</h2>
            <div className="instructions mb-3">{descEl}</div>
            <div className="d-flex my-3">
              <CountryDropdown
                onChange={({ code, prefix }) =>
                  this.setState({ active: code, prefix })
                }
                active={this.state.active}
              />
              <div className="form-control-wrap">
                <input
                  type="tel"
                  ref={ref => (this.inputRef = ref)}
                  className="form-control form-control-lg"
                  placeholder="Area code and phone number"
                  value={this.state.phone}
                  onChange={e => this.setState({ phone: e.target.value })}
                />
              </div>
            </div>
            {this.state.error && (
              <div className="alert alert-danger mt-3">{this.state.error}</div>
            )}
            <div className="help mt-3 mb-3">{helpText}</div>
            <PublishedInfoBox
              className="mt-3 mb-0"
              title={
                <fbt desc="PhoneAttestation.visibleOnBlockchain">
                  What will be visible on the blockchain?
                </fbt>
              }
              children={
                <fbt desc="PhoneAttestation.verifiedButNotNumber">
                  That you have a verified phone number, but NOT your actual
                  phone number
                </fbt>
              }
            />
            <div className="actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={this.state.loading}
                children={
                  this.state.loading
                    ? fbt('Loading...', 'Loading...')
                    : fbt('Continue', 'Continue')
                }
              />
              {!isMobile && (
                <button
                  className="btn btn-link"
                  type="button"
                  onClick={() => this.setState({ shouldClose: true })}
                  children={fbt('Cancel', 'Cancel')}
                />
              )}
            </div>
          </form>
        )}
      </Mutation>
    )
  }

  renderVerifyCode() {
    const { isMobile } = this.props

    const header = isMobile ? null : (
      <fbt desc="PhoneAttestation.title">Verify your Phone Number</fbt>
    )

    const instructions = isMobile ? (
      <fbt desc="PhoneAttestation.mobile.enterCode">
        Enter the code we sent you below
      </fbt>
    ) : (
      <fbt desc="PhoneAttestation.enterCode">
        We’ve sent you a verification code via SMS. Please enter it below
      </fbt>
    )

    return (
      <Mutation
        mutation={VerifyPhoneCodeMutation}
        onCompleted={res => {
          const result = res.verifyPhoneCode

          if (!result.success) {
            this.setState({ error: result.reason, loading: false, data: null })
            return
          }

          this.setState({
            data: result.data,
            loading: false,
            completed: true,
            shouldClose: true
          })
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

              if (trimmedCode.length === 0) {
                this.setState({
                  error: 'Verification code is required',
                  loading: false
                })
                return
              }

              if (trimmedCode.length !== 6 || isNaN(trimmedCode)) {
                this.setState({
                  error: 'Verification code should be a 6 digit number',
                  loading: false
                })
                return
              }

              verifyCode({
                variables: {
                  identity: this.props.wallet,
                  prefix: this.state.prefix,
                  phone: this.state.phone,
                  code: this.state.code
                }
              })
            }}
          >
            <h2>{header}</h2>
            <div className="instructions">{instructions}</div>
            <div className="my-3 verification-code">
              <input
                type="tel"
                maxLength="6"
                ref={ref => (this.inputRef = ref)}
                className="form-control form-control-lg"
                placeholder="Verification code"
                value={this.state.code}
                onChange={e => this.setState({ code: e.target.value })}
              />
            </div>
            {this.state.error && (
              <div className="alert alert-danger my-3">{this.state.error}</div>
            )}
            <PublishedInfoBox
              className="mt-3 mb-0"
              title={
                <fbt desc="PhoneAttestation.visibleOnBlockchain">
                  What will be visible on the blockchain?
                </fbt>
              }
              children={
                <fbt desc="PhoneAttestation.verifiedButNotNumber">
                  That you have a verified phone number, but NOT your actual
                  phone number
                </fbt>
              }
            />
            <div className="actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={this.state.loading}
                children={
                  this.state.loading
                    ? fbt('Loading...', 'Loading...')
                    : fbt('Continue', 'Continue')
                }
              />
              {!isMobile && (
                <button
                  className="btn btn-link"
                  type="button"
                  onClick={() => this.setState({ shouldClose: true })}
                  children={fbt('Cancel', 'Cancel')}
                />
              )}
            </div>
          </form>
        )}
      </Mutation>
    )
  }
}

export default withWallet(withIsMobile(PhoneAttestation))

require('react-styl')(`
  .attestation-modal
    padding-bottom: 1.5rem !important
    > div
      h2
        background: url(images/growth/profile-icon.svg) no-repeat center
        background-size: 7rem
        padding-top: 9rem
        background-position: center top
        position: relative
        font-family: Poppins
        font-size: 1.5rem
        font-weight: 500
        font-style: normal
        font-stretch: normal
        line-height: 1.67
        letter-spacing: normal
        color: #000000
        margin-bottom: 0.75rem
      font-size: 18px
      .form-control-wrap
        flex: 1
      .form-control
        border: 0
        border-bottom: solid 1px #c2cbd3
        border-radius: 0
        background-color: var(--white)
        color: black
        &:focus
          border-color: #80bdff
          box-shadow: unset
        &::-webkit-input-placeholder
          color: var(--light)
      .help
        margin-top: 1rem
        font-family: Lato
        font-size: 0.9rem
        font-weight: normal
        font-style: normal
        font-stretch: normal
        line-height: normal
        letter-spacing: normal
        text-align: center
        color: #6f8294
      .verification-code
        display: flex
        flex-direction: column
        border: 0
        align-items: center
        width: 80%
        .form-control
          text-align: center
      .actions
        display: flex
        flex-direction: column !important
        align-items: center
        margin-top: 1.5rem
        .btn-link
          text-decoration: none
      form
        display: flex
        flex: auto
        flex-direction: column
    &.phone > div h2
      background-image: url(images/growth/phone-icon.svg)
    &.email > div h2
      background-image: url(images/growth/email-icon.svg)
    &.facebook > div h2
      background-image: url(images/growth/facebook-icon.svg)
    &.twitter > div h2
      background-image: url(images/growth/twitter-icon.svg)
    &.airbnb > div h2
      background-image: url(images/growth/airbnb-icon.svg)
    &.google > div h2
      background-image: url(images/growth/google-icon.svg)
    &.website > div h2
      background-image: url(images/growth/website-icon.svg)
    &.kakao > div h2
      background-image: url(images/growth/kakao-icon.svg)
    &.github > div h2
      background-image: url(images/growth/github-icon.svg)
    &.linkedin > div h2
      background-image: url(images/growth/linkedin-icon.svg)
    &.wechat > div h2
      background-image: url(images/growth/wechat-icon.svg)

  .mobile-modal-light .attestation-modal
    padding: 20px
    text-align: center
    h2
      padding-top: 7.5rem
    .btn
      width: 100%
      border-radius: 2rem
      padding: 0.75rem
    .verification-code .form-control
      display: inline-block
    &.phone > div h2::before
      background-image: url(images/identity/phone-icon-light.svg)
    &.email > div h2::before
      background-image: url(images/identity/email-icon-light.svg)
    &.facebook > div h2::before
      background-image: url(images/identity/facebook-icon-light.svg)
    &.twitter > div h2::before
      background-image: url(images/identity/twitter-icon-light.svg)
    &.airbnb > div h2::before
      background-image: url(images/identity/airbnb-icon-light.svg)
    &.google > div h2::before
      background-image: url(images/identity/google-icon.svg)
    &.website > div h2::before
      background-image: url(images/identity/website-icon-light.svg)
    &.kakao > div h2::before
      background-image: url(images/identity/kakao-icon-large.svg)
    &.github > div h2::before
      background-image: url(images/identity/github-icon-large.svg)
    &.linkedin > div h2::before
      background-image: url(images/identity/linkedin-icon-large.svg)
    &.wechat > div h2::before
      background-image: url(images/identity/wechat-icon-large.svg)

    > div
      flex: auto
      display: flex
      flex-direction: column

    &.success > div h2::before
      background-image: none
`)
