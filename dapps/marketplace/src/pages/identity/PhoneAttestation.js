import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import pick from 'lodash/pick'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'
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

    return (
      <Modal
        className={`attestation-modal phone${
          this.state.stage === 'VerifiedOK' ? ' success' : ''
        }`}
        shouldClose={this.state.shouldClose}
        onClose={() => {
          this.setState({
            shouldClose: false,
            error: false,
            stage: 'GenerateCode'
          })
          this.props.onClose()
        }}
      >
        <div>{this[`render${this.state.stage}`]()}</div>
      </Modal>
    )
  }

  renderGenerateCode() {
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
            <h2>
              <fbt desc="PhoneAttestation.title">Verify your Phone Number</fbt>
            </h2>
            <div className="instructions">
              <fbt desc="PhoneAttestation.description">
                Enter your phone number below and OriginID will send you a
                verification code via SMS.
              </fbt>
            </div>
            <div className="d-flex mt-3">
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
            <div className="help">
              <fbt desc="Attestation.phonePublishClarification">
                By verifying your phone number, you give Origin permission to
                send you occasional emails such as notifications about your
                transactions.
              </fbt>
            </div>
            <div className="actions">
              <button
                type="submit"
                className="btn btn-outline-light"
                children={
                  this.state.loading
                    ? fbt('Loading...', 'Loading...')
                    : fbt('Continue', 'Continue')
                }
              />
              <button
                className="btn btn-link"
                type="button"
                onClick={() => this.setState({ shouldClose: true })}
                children={fbt('Cancel', 'Cancel')}
              />
            </div>
          </form>
        )}
      </Mutation>
    )
  }

  renderVerifyCode() {
    return (
      <Mutation
        mutation={VerifyPhoneCodeMutation}
        onCompleted={res => {
          const result = res.verifyPhoneCode
          if (result.success) {
            this.setState({
              stage: 'VerifiedOK',
              data: result.data,
              loading: false
            })
          } else {
            this.setState({ error: result.reason, loading: false })
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
            <h2>
              <fbt desc="PhoneAttestation.title">Verify your Phone Number</fbt>
            </h2>
            <div className="instructions">
              <fbt desc="PhoneAttestation.enterCode">
                Enter the code we sent you below
              </fbt>
            </div>
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
              {this.state.error && (
                <div className="alert alert-danger mt-3">
                  {this.state.error}
                </div>
              )}
            </div>
            <div className="actions">
              <button
                type="submit"
                className="btn btn-outline-light"
                children={
                  this.state.loading
                    ? fbt('Loading...', 'Loading...')
                    : fbt('Continue', 'Continue')
                }
              />
              <button
                className="btn btn-link"
                onClick={() => this.setState({ shouldClose: true })}
                children={fbt('Cancel', 'Cancel')}
              />
            </div>
          </form>
        )}
      </Mutation>
    )
  }

  renderVerifiedOK() {
    return (
      <>
        <h2>
          <fbt desc="PhoneAttestation.verified">Phone number verified!</fbt>
        </h2>
        <div className="instructions">
          <fbt desc="Attestation.DontForget">
            Don&apos;t forget to publish your changes.
          </fbt>
        </div>
        <div className="help">
          <fbt desc="Attestation.publishingBlockchain">
            Publishing to the blockchain lets other users know that you have a
            verified profile.
          </fbt>
        </div>
        <div className="actions">
          <button
            className="btn btn-outline-light"
            onClick={() => {
              this.props.onComplete(this.state.data)
              this.setState({ shouldClose: true })
            }}
            children={fbt('Continue', 'Continue')}
          />
        </div>
      </>
    )
  }
}

export default PhoneAttestation

require('react-styl')(`
  .attestation-modal
    overflow: visible !important
    padding-bottom: 1.5rem !important
    > div
      h2
        background: url(images/identity/verification-shape-grey.svg) no-repeat center;
        background-size: 7rem;
        padding-top: 9rem;
        background-position: center top;
        position: relative
        &::before
          content: ""
          position: absolute;
          top: 0;
          left: 0;
          height: 7.5rem;
          right: 0;
          background-repeat: no-repeat;
          background-position: center;
      font-size: 18px
      .form-control-wrap
        flex: 1
      .form-control
        background-color: var(--dark-two)
        border: 0
        color: var(--white)
        &::-webkit-input-placeholder
          color: var(--dusk)
      .help
        font-size: 14px
        margin-top: 1rem
      .verification-code
        display: flex;
        flex-direction: column;
        align-items: center;
        .form-control
          max-width: 15rem
          text-align: center
      .actions
        display: flex
        flex-direction: column !important
        align-items: center
        margin-top: 1.5rem
        .btn-link
          text-decoration: none

    &.phone > div h2::before
      background-image: url(images/identity/phone-icon-dark.svg);
      background-size: 2rem;
    &.email > div h2::before
      background-image: url(images/identity/email-icon-dark.svg);
      background-size: 3.5rem
    &.facebook > div h2::before
      background-image: url(images/identity/facebook-icon-dark.svg);
      background-size: 2rem
    &.twitter > div h2::before
      background-image: url(images/identity/twitter-icon-dark.svg);
      background-size: 3.5rem
    &.airbnb > div h2::before
      background-image: url(images/identity/airbnb-icon-dark.svg);
      background-size: 4rem

    &.success
      > div
        h2
          color: var(--greenblue)
          background-image: url(images/circular-check-button.svg)
          background-size: 3.5rem;
          padding-top: 5rem;
          &::before
            background-image: none
        .actions
          margin-bottom: 1.5rem
`)
