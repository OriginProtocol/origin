import React, { Component } from 'react'
import { Button, Dialog, InputGroup, Intent, Toaster } from '@blueprintjs/core'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import { setSessionEmail } from '../actions'

class Login extends Component {
  state = {
    email: '',
    emailCode: '',
    otpQrUrl: '',
    otpKey: '',
    otpCode: '',
    loginStep: 'enterEmail'
  }

  handleError = err => {
    const toaster = Toaster.create({
      intent: Intent.DANGER
    })
    toaster.show({ message: err })
  }

  handleSendEmailCode = async () => {
    const body = new Blob(
      [JSON.stringify({ email: this.state.email }, null, 2)],
      { type: 'application/json' }
    )
    const opts = {
      method: 'POST',
      body
    }
    const serverResponse = await fetch('/api/send_email_code', opts)
    if (serverResponse.ok) {
      this.setState({ loginStep: 'enterEmailCode' })
    } else {
      this.handleError('Failure to send email code. Try again in a moment.')
    }
  }

  handleVerifyEmailCode = async () => {
    const body = new Blob(
      [
        JSON.stringify(
          { email: this.state.email, code: this.state.emailCode },
          null,
          2
        )
      ],
      { type: 'application/json' }
    )
    const opts = {
      method: 'POST',
      body
    }
    const serverResponse = await fetch('/api/verify_email_code', opts)
    if (!serverResponse.ok) {
      this.handleError('Invalid email code.')
      return
    }

    const response = await serverResponse.json()
    if (response.otpReady) {
      // User already setup OTP. Ask them to enter their code.
      this.setState({ loginStep: 'enterOtpCode' })
    } else {
      // User has not setup OTP yet. Call the server to get the OTP setup key.
      return this.handleOtpSetup()
    }
  }

  handleOtpSetup = async () => {
    const opts = {
      method: 'POST'
    }
    const serverReponse = await fetch('/api/setup_totp', opts)
    if (!serverReponse.ok) {
      this.handleError('OTP setup failure.')
      return
    }

    const response = await serverReponse.json()

    if (!response || !response.otpQrUrl || !response.otpKey) {
      this.handleError('OTP setup failure.')
      return
    }
    this.setState({
      loginStep: 'setupOTP',
      otpQrUrl: response.otpQrUrl,
      otpKey: response.otpKey
    })
  }

  handleOtpSetupDone = async () => {
    this.setState({ loginStep: 'enterOtpCode' })
  }

  handleVerifyOtpCode = async () => {
    const body = new Blob(
      [
        JSON.stringify(
          { email: this.state.email, code: this.state.otpCode },
          null,
          2
        )
      ],
      { type: 'application/json' }
    )
    const opts = {
      method: 'POST',
      body
    }
    fetch('/api/verify_totp', opts).then(response => {
      if (response.ok) {
        this.props.setSessionEmail(this.state.email)
      } else {
        this.handleError('Invalid OTP code.')
      }
    })
  }

  render() {
    return (
      <div>
        {this.props.sessionEmail &&
          this.props.sessionEmail !== '(need to login)' && (
            <Redirect to="/grants" />
          )}
        {this.state.loginStep === 'enterEmail' && (
          <Dialog id="emailDialog" isOpen={true}>
            <div className="bp3-dialog-header">
              <span className="bp3-icon-large bp3-icon-arrow-right" />
              <h4 className="bp3-heading">Origin T3</h4>
            </div>

            <div className="bp3-dialog-body">
              <p>Please enter your email address to login.</p>
            </div>

            <div className="bp3-dialog-footer" id="loginEmailFooter">
              <InputGroup
                type="text"
                placeholder="foo@bar.com"
                value={this.state.email}
                onChange={e => this.setState({ email: e.target.value })}
              />
              <Button text="Send code" onClick={this.handleSendEmailCode} />
            </div>
          </Dialog>
        )}
        {this.state.loginStep === 'enterEmailCode' && (
          <Dialog id="emailCodeDialog" isOpen={true}>
            <div className="bp3-dialog-header">
              <span className="bp3-icon-large bp3-icon-arrow-right" />
              <h4 className="bp3-heading">Origin T3</h4>
            </div>

            <div className="bp3-dialog-body">
              <p>Please check your email and enter the code we sent you.</p>
            </div>

            <div className="bp3-dialog-footer" id="loginCodeFooter">
              <InputGroup
                type="text"
                placeholder="123456"
                value={this.state.emailCode}
                onChange={e => this.setState({ emailCode: e.target.value })}
              />
              <Button text="Verify code" onClick={this.handleVerifyEmailCode} />
            </div>
          </Dialog>
        )}
        {this.state.loginStep === 'setupOTP' && (
          <Dialog id="otpSetupDialog" isOpen={true}>
            <div className="bp3-dialog-header">
              <span className="bp3-icon-large bp3-icon-arrow-right" />
              <h4 className="bp3-heading">Origin T3</h4>
            </div>

            <div className="bp3-dialog-body">
              <p>
                Open Google Authenticator and scan the barcode or enter the key.
              </p>
            </div>

            <div className="bp3-dialog-footer" id="loginCodeFooter">
              <div>
                <img
                  src={this.state.otpQrUrl}
                  alt="Google Authenticator QR code"
                />
              </div>
              <div>Key: {this.state.otpKey}</div>
              <Button text="Done" onClick={this.handleOtpSetupDone} />
            </div>
          </Dialog>
        )}
        {this.state.loginStep === 'enterOtpCode' && (
          <Dialog id="otpCodeDialog" isOpen={true}>
            <div className="bp3-dialog-header">
              <span className="bp3-icon-large bp3-icon-arrow-right" />
              <h4 className="bp3-heading">Origin T3</h4>
            </div>

            <div className="bp3-dialog-body">
              <p>Open Google Authenticator and enter OriginProtocol code.</p>
            </div>

            <div className="bp3-dialog-footer" id="loginCodeFooter">
              <InputGroup
                type="text"
                placeholder="123456"
                value={this.state.otpCode}
                onChange={e => this.setState({ otpCode: e.target.value })}
              />
              <Button text="Verify code" onClick={this.handleVerifyOtpCode} />
            </div>
          </Dialog>
        )}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    sessionEmail: state.sessionEmail
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setSessionEmail: email => dispatch(setSessionEmail(email))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
