import React, { useState, useEffect } from 'react'
import { fbt } from 'fbt-runtime'
import { useHistory } from 'react-router-dom'

import Redirect from 'components/Redirect'
import LoadingSpinner from 'components/LoadingSpinner'

import ListingPreview from './_ListingPreview'
import HelpWallet from './_HelpWallet'

import withIsMobile from 'hoc/withIsMobile'
import withWallet from 'hoc/withWallet'
import withAuthStatus from 'hoc/withAuthStatus'

import MobileModal from 'components/MobileModal'
import SignInContent from 'components/SignIn'

const OnboardSignIn = ({
  listing,
  linkPrefix,
  isLoggedIn,
  isMobile,
  walletLoading
}) => {
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (isLoggedIn && !completed) {
      setCompleted(true)
    }
  }, [isLoggedIn, completed])

  const history = useHistory()

  if (completed) {
    return <Redirect to={`${linkPrefix}/onboard/email`} />
  }

  if (walletLoading) {
    return <LoadingSpinner />
  }

  const content = (
    <SignInContent
      className={`onboard-signin${isMobile ? '' : ' onboard-box'}`}
    />
  )

  if (isMobile) {
    return (
      <MobileModal
        title={<fbt desc="onboard.signIn.signIn">Sign In</fbt>}
        onBack={() => history.goBack()}
        className="onboard-signin-modal"
      >
        {content}
      </MobileModal>
    )
  }

  return (
    <>
      <h1 className="mb-1">
        <fbt desc="onboard.signIn.signIn">Sign In</fbt>
      </h1>
      <p className="description mb-5">
        <fbt desc="auth.getAccess">
          Get secure access to your data by signing with your private key
        </fbt>
      </p>
      <div className="row">
        <div className="col-md-7">{content}</div>
        <div className="col-md-4 offset-md-1">
          <ListingPreview listing={listing} />
          <HelpWallet />
        </div>
      </div>
    </>
  )
}

export default withIsMobile(withWallet(withAuthStatus(OnboardSignIn)))
