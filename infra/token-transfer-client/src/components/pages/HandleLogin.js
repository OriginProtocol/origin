import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'

import { apiUrl } from '@/constants'
import { getNextOnboardingPage } from '@/utils'
import agent from '@/utils/agent'

const HandleLogin = props => {
  const [redirectTo, setRedirectTo] = useState(null)

  useEffect(() => {
    if (props.match.params.token) {
      handleLoginToken(props.match.params.token)
    } else {
      // Redirect to login if no token present in URL
      setRedirectTo('/login')
    }
  }, [])

  const handleLoginToken = async token => {
    let response
    try {
      response = await agent
        .post(`${apiUrl}/api/verify_email_token`)
        .set('Authorization', `Bearer ${token}`)
    } catch (error) {
      if (error.response) {
        setRedirectTo('/login?error=expired')
      } else {
        setRedirectTo('/login?error=server')
      }
      return
    }

    const nextOnboardingPage = getNextOnboardingPage(response.body)

    let redirectTo
    if (nextOnboardingPage === '/terms') {
      // Assume no onboarding done, send user to welcome page
      redirectTo = '/welcome'
    } else if (nextOnboardingPage) {
      // If there is still onboarding to do, send them to the relevant page
      redirectTo = nextOnboardingPage
    } else {
      // No more onboarding, login via 2fa
      redirectTo = '/otp'
    }
    setRedirectTo(redirectTo)
  }

  if (redirectTo) {
    return <Redirect to={redirectTo} />
  }

  return (
    <div className="action-card">
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export default HandleLogin
