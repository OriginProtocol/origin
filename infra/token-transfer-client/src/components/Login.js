import React, { Component } from 'react'
import { Dialog, Intent, Toaster } from '@blueprintjs/core'
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
    console.log("SENDING CODE TO", this.state.email)
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
      console.log('Code sent')
      this.setState({ loginStep: 'enterEmailCode' })
      // TODO:change state to render a form that shows box to input code.
    } else {
      this.handleError('Failure to send email code. Try again in a moment.')
    }
  }

  handleVerifyEmailCode = async () => {
    console.log("VERIFYING CODE", this.state.emailCode)
    const body = new Blob(
      [JSON.stringify({ email: this.state.email, code: this.state.emailCode }, null, 2)],
      { type: 'application/json' }
    )
    const opts = {
      method: 'POST',
      body
    }
    const serverResponse = await fetch('/api/verify_email_code', opts)
    if (!serverResponse.ok) {
      console.log('INVALID CODE')
      this.handleError('Invalid email code.')
      return
    }

    console.log('Code verified successfully')
    const response = await serverResponse.json()
    console.log('Json reponse=', response)
    if (response.otpReady) {
      // User already setup OTP. Ask them to enter their code.
      console.log('OTP already setup')
      this.setState({ loginStep: 'enterOtpCode' })
    } else {
      // User has not setup OTP yet. Call the server to get the OTP setup key.
      console.log('OTP not setup')
      return this.handleOtpSetup()
    }
  }

  handleOtpSetup = async () => {
    const opts = {
      method: 'POST',
    }
    const serverReponse = await fetch('/api/setup_totp', opts)
    if (!serverReponse.ok) {
      console.log('TOTP setup failed')
      this.handleError('OTP setup failure.')
      return
    }

    const response = await serverReponse.json()
    console.log('Successfull called setup_totp, Json response=', response)

    if (!response || !response.otpQrUrl || !response.otpKey) {
      this.handleError('OTP setup failure.')
      return
    }
    this.setState({ loginStep: 'setupOTP', otpQrUrl: response.otpQrUrl, otpKey: response.otpKey })
  }


  handleOtpSetupDone = async () => {
    console.log('OTP setup done')
    this.setState({ loginStep: 'enterOtpCode' })
  }

  handleVerifyOtpCode = async () => {
    console.log("VERIFYING OTP", this.state.otpCode)
    const body = new Blob(
      [JSON.stringify({ email: this.state.email, code: this.state.otpCode }, null, 2)],
      { type: 'application/json' }
    )
    const opts = {
      method: 'POST',
      body
    }
    fetch('/api/verify_totp', opts)
      .then(response => {
        if (response.ok) {
          console.log('Code verified successfully')
          this.props.setSessionEmail(this.state.email)
        } else {
          console.log('INVALID CODE')
          this.handleError('Invalid OTP code.')
        }
      })
  }

  render() {
    console.log('Login.render called')
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
            <p>
              Please enter your email address to login.
            </p>
          </div>

          <div className="bp3-dialog-footer" id="loginEmailFooter">
            <form>
              <div>
                <input
                  type="text"
                  ref={ref => (this.inputRef = ref)}
                  placeholder="foo@bar.com"
                  value={this.state.email}
                  onChange={e => this.setState({ email: e.target.value })}
                />
              </div>
              <div>
                <button type="button" onClick={this.handleSendEmailCode}>Send code</button>
              </div>
            </form>
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
            <p>
              Please check your email and enter the code we sent you.
            </p>
          </div>

          <div className="bp3-dialog-footer" id="loginCodeFooter">
            <form>
              <div>
                <input
                  type="text"
                  ref={ref => (this.inputRef = ref)}
                  placeholder="123456"
                  value={this.state.code}
                  onChange={e => this.setState({ emailCode: e.target.value })}
                />
              </div>
              <div>
                <button type="button" onClick={this.handleVerifyEmailCode}>Verify code</button>
              </div>
            </form>
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
              <img src={this.state.otpQrUrl} alt="Google Authenticator QR code" />
            </div>
            <div>
              Key: {this.state.otpKey}
            </div>
            <form>
              <button type="button" onClick={this.handleOtpSetupDone}>Done</button>
            </form>
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
            <p>
              Open Google Authenticator and enter OriginProtocol code.
            </p>
          </div>

          <div className="bp3-dialog-footer" id="loginCodeFooter">
            <form>
              <div>
                <input
                  type="text"
                  ref={ref => (this.inputRef = ref)}
                  placeholder="Abc123D78E"
                  value={this.state.otpCode}
                  onChange={e => this.setState({ otpCode: e.target.value })}
                />
              </div>
              <div>
                <button type="button" onClick={this.handleVerifyOtpCode}>Submit</button>
              </div>
            </form>
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
