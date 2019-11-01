import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import agent from '@/utils/agent'
import { apiUrl } from '@/constants'

class OtpSetup extends Component {
  state = {
    loading: true,
    otpQrUrl: null,
    otpKey: null,
    error: null,
    redirectToVerify: false
  }

  componentDidMount() {
    this.handleOtpSetup()
  }

  handleOtpSetup = async () => {
    let response
    try {
      response = await agent.post(`${apiUrl}/api/setup_totp`)
    } catch (error) {
      this.setState({ error: 'An error occurred configuring OTP.' })
      return
    }

    if (!response.body.otpQrUrl || !response.body.otpKey) {
      this.setState({ error: 'An error occurred configuring OTP.' })
      return
    }

    this.setState({
      otpQrUrl: response.body.otpQrUrl,
      otpKey: response.body.otpKey,
      loading: false
    })
  }

  render() {
    if (this.state.redirectToVerify) {
      return <Redirect push to="/otp" />
    }

    return (
      <div className="action-card">
        {this.state.error ? (
          <h1>{this.state.error}</h1>
        ) : this.state.loading ? (
          <div className="spinner-grow" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          <>
            <div className="d-md-none">
              <h1>Copy Secret Key</h1>
              <p>Open Google Authenticator, add using "Manual Entry", and paste in this key:</p>
            </div>
            <div className="d-none d-md-block">
              <h1>Scan QR Code</h1>
              <p>Open Google Authenticator and scan this image. You can also manually enter your key.</p>
              <img src={this.state.otpQrUrl} style={{ margin: '20px 0' }} />
            </div>
            <p>
              <strong>Secret Key</strong>
              <br />
              <small className="d-md-none text-muted">{this.state.otpKey}</small>
              <span className="d-none d-md-block">{this.state.otpKey}</span>
            </p>
            <div className="alert alert-warning mx-auto">
              Store this secret key somewhere safe and don&apos;t share it with
              anyone else.
            </div>
            <button
              className="btn btn-secondary btn-lg mt-5"
              onClick={() => this.setState({ redirectToVerify: true })}
            >
              Continue
            </button>
          </>
        )}
      </div>
    )
  }
}

export default OtpSetup
