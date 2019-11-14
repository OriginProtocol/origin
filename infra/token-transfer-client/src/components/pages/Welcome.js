import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import { getNextOnboardingPage } from '@/utils'

const Welcome = ({ isLoading, user }) => {
  const [redirectTo, setRedirectTo] = useState(null)

  if (redirectTo) {
    return <Redirect to={redirectTo} />
  } else if (isLoading) {
    return (
      <div className="action-card">
        <div className="spinner-grow" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  const nextOnboardingStep = getNextOnboardingPage(user)

  return (
    <>
      <div className="action-card">
        <h1>
          Welcome to the
          <br />
          Origin Investor Portal
        </h1>
        <p className="my-4">
          The wait is finally over! You can now start using this portal to
          manage your OGN investment.
        </p>
        <hr className="mx-5" />
        <div className="form-group">
          <label className="mt-0">Investor</label>
          <br />
          {user.name}
        </div>
        <div className="form-group">
          <label className="mt-0">Email Address</label>
          <br />
          {user.email}
        </div>
        <hr className="mx-5" />
        <button
          className="btn btn-secondary btn-lg"
          onClick={() => setRedirectTo(nextOnboardingStep)}
        >
          Continue
        </button>
      </div>
    </>
  )
}

export default Welcome
