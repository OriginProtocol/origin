import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import GoogleAuthenticatorIcon from '@/assets/google-authenticator-icon@3x.jpg'

const OtpExplain = () => {
  const [redirectTo, setRedirectTo] = useState(null)

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  return (
    <div className="action-card">
      <h1>Install Google Authenticator</h1>
      <img src={GoogleAuthenticatorIcon} />
      <p className="mb-3">
        Google Authenticator will generate a unique, time-sensitive security
        code you can use to secure your account.
      </p>
      <p>
        To get started, click continue once you have the Google Authenticator
        app installed.
      </p>
      <button
        className="btn btn-secondary btn-lg mt-5"
        onClick={() => setRedirectTo('/otp/setup')}
      >
        <span>Continue</span>
      </button>
    </div>
  )
}

export default OtpExplain
