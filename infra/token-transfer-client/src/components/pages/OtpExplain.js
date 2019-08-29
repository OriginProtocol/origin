import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import GoogleAuthenticatorIcon from '@/assets/google-authenticator-icon@3x.jpg'

class OtpExplain extends Component {
  state = {
    redirectTo: false
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    }

    return (
      <div className="action-card">
        <h1>Install Google Authenticator</h1>
        <img src={GoogleAuthenticatorIcon} />
        <p className="mb-3">
          Google Authenticator will generate a unique time-sensitive security
          code you can use to secure your account.
        </p>
        <p>
          To get started, install Google Authenticator on your mobile device, if
          you haven&apos;t already, then click continue
        </p>
        <button
          className="btn btn-secondary btn-lg mt-5"
          onClick={() => this.setState({ redirectTo: '/otp/setup' })}
        >
          <span>Continue</span>
        </button>
      </div>
    )
  }
}

export default OtpExplain
