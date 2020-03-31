import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import GoogleAuthenticatorIcon from '@/assets/google-authenticator.svg'

const OtpExplain = () => {
  const [redirectTo, setRedirectTo] = useState(null)

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  return (
    <div className="action-card">
      <h1>Set Up Google Authenticator</h1>
      <div className="mb-4 mx-auto" style={{ maxWidth: '150px' }}>
        <GoogleAuthenticatorIcon width="100%" height="100%" />
      </div>
      <p className="mb-3">
        Google Authenticator will generate a unique, time-sensitive security
        code you can use to secure your account.
      </p>
      <p>
        To get started, click continue once you have the{' '}
        <a
          href="https://support.google.com/accounts/answer/1066447"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Authenticator
        </a>{' '}
        app installed.
      </p>
      <button
        className="btn btn-primary btn-lg mt-5"
        onClick={() => setRedirectTo('/otp/setup')}
      >
        <span>Continue</span>
      </button>
    </div>
  )
}

export default OtpExplain
