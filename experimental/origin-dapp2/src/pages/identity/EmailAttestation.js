import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

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
      <>
        <h2>Verify your Email Address</h2>
        <div className="instructions">
          Enter your email address below and OriginID will send you a
          verification code
        </div>
        <div className="mt-3">
          <input
            ref={ref => (this.inputRef = ref)}
            className="form-control form-control-lg text-center"
            placeholder="Verify email address"
            value={this.state.email}
            onChange={e => this.setState({ email: e.target.value })}
          />
        </div>
        {this.state.error && (
          <div className="alert alert-danger mt-3">{this.state.error}</div>
        )}
        <div className="help">
          Other users will know that you have a verified email address. Your
          actual email will not be published on the blockchain.
        </div>
        <div className="actions">
          {this.renderCodeButton()}
          <button
            className="btn btn-link"
            onClick={() => this.setState({ shouldClose: true })}
            children="Cancel"
          />
        </div>
      </>
    )
  }

  renderVerifyCode() {
    return (
      <>
        <h2>Verify your Email Address</h2>
        <div className="instructions">Enter the code we sent you below</div>
        <div className="my-3 verification-code">
          <input
            ref={ref => (this.inputRef = ref)}
            className="form-control form-control-lg"
            placeholder="Verification code"
            value={this.state.code}
            onChange={e => this.setState({ code: e.target.value })}
          />
          {this.state.error && (
            <div className="alert alert-danger mt-3">{this.state.error}</div>
          )}
        </div>
        <div className="actions">
          {this.renderVerifyButton()}
          <button
            className="btn btn-link"
            onClick={() => this.setState({ shouldClose: true })}
            children="Cancel"
          />
        </div>
      </>
    )
  }

  renderCodeButton() {
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
          console.log('Error', errorData)
          this.setState({ error: 'Check console' })
        }}
      >
        {generateCode => (
          <button
            className="btn btn-outline-light"
            onClick={() => {
              if (this.state.loading) return
              this.setState({ error: false, loading: true })
              generateCode({
                variables: { email: this.state.email }
              })
            }}
            children={this.state.loading ? 'Loading...' : 'Continue'}
          />
        )}
      </Mutation>
    )
  }

  renderVerifyButton() {
    return (
      <Mutation
        mutation={VerifyEmailCodeMutation}
        onCompleted={res => {
          const result = res.verifyEmailCode
          if (result.success) {
            this.setState({
              stage: 'VerifiedOK',
              topic: result.claimType,
              issuer: '0xf17f52151EbEF6C7334FAD080c5704D77216b732', //result.issuer,
              signature: result.signature,
              data: result.data,
              loading: false
            })
          } else {
            this.setState({ error: result.reason, loading: false })
          }
        }}
        onError={errorData => {
          console.log('Error', errorData)
          this.setState({ error: 'Check console', loading: false })
        }}
      >
        {verifyCode => (
          <button
            className="btn btn-outline-light"
            onClick={() => {
              if (this.state.loading) return
              this.setState({ error: false, loading: true })
              verifyCode({
                variables: {
                  identity: this.props.wallet,
                  email: this.state.email,
                  code: this.state.code
                }
              })
            }}
            children={this.state.loading ? 'Loading...' : 'Continue'}
          />
        )}
      </Mutation>
    )
  }

  renderVerifiedOK() {
    return (
      <>
        <h2>Email address verified!</h2>
        <div className="instructions">
          Don&apos;t forget to publish your changes.
        </div>
        <div className="help">
          Publishing to the blockchain lets other users know that you have a
          verified profile.
        </div>
        <div className="actions">
          <button
            className="btn btn-outline-light"
            onClick={() => {
              this.props.onComplete(this.state.data)
              this.setState({ shouldClose: true })
            }}
            children="Continue"
          />
        </div>
      </>
    )
  }
}

export default EmailAttestation

require('react-styl')(`
`)
