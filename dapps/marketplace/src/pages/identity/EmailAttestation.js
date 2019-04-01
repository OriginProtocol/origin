import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'

import GenerateEmailCodeMutation from 'mutations/GenerateEmailCode'
import VerifyEmailCodeMutation from 'mutations/VerifyEmailCode'

class EmailAttestation extends Component {
  state = {
    stage: 'GenerateCode',
    email: '',
    code: ''
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
        className={`attestation-modal email${
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
        mutation={GenerateEmailCodeMutation}
        onCompleted={res => {
          const result = res.generateEmailCode
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

              const emailRegex = /^[a-z0-9-._+]+@[a-z0-9-]+\.([a-z]{2,4})(\.[a-z]{2,4})?$/i
              if (!emailRegex.test(this.state.email)) {
                this.setState({
                  error: 'This is not a valid email address',
                  loading: false
                })
                return
              }

              generateCode({
                variables: { email: this.state.email }
              })
            }}
          >
            <h2>Verify your Email Address</h2>
            <div className="instructions">
              <fbt desc="Attestation.instructions">
                Enter your email address below and OriginID will send you a
                verification code
              </fbt>
            </div>
            <div className="mt-3">
              <input
                type="email"
                ref={ref => (this.inputRef = ref)}
                className="form-control form-control-lg text-center"
                placeholder={fbt(
                  'Verify email address',
                  'Attestation.verify-email-address'
                )}
                value={this.state.email}
                onChange={e => this.setState({ email: e.target.value })}
              />
            </div>
            {this.state.error && (
              <div className="alert alert-danger mt-3">{this.state.error}</div>
            )}
            <div className="help">
              <fbt desc="Attestation.emailPublishClarification">
                By verifying your email, you give Origin permission to send you
                occasional emails such as notifications about your transactions.
              </fbt>
            </div>
            <div className="actions">
              <button
                className="btn btn-outline-light"
                type="submit"
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

  renderVerifyCode() {
    const { email, code } = this.state
    return (
      <Mutation
        mutation={VerifyEmailCodeMutation}
        onCompleted={res => {
          const result = res.verifyEmailCode
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
                  error: 'Verification code is incorrect',
                  loading: false
                })
                return
              }

              verifyCode({
                variables: { identity: this.props.wallet, email, code }
              })
            }}
          >
            <h2>
              <fbt desc="EmailAttestation.title">Verify your Email Address</fbt>
            </h2>
            <div className="instructions">
              <fbt desc="EmailAttestation.enterCode">
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
          <fbt desc="EmailAttestation.verified">Email address verified!</fbt>
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

export default EmailAttestation

require('react-styl')(`
`)
