import React, { useState, useEffect } from 'react'
import { useApolloClient, useMutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'
import { useHistory } from 'react-router-dom'

import Redirect from 'components/Redirect'
import LoadingSpinner from 'components/LoadingSpinner'

import ListingPreview from './_ListingPreview'
import HelpWallet from './_HelpWallet'

import withIsMobile from 'hoc/withIsMobile'
import withWallet from 'hoc/withWallet'
import withAuthStatus from 'hoc/withAuthStatus'

import LoginMutation from 'mutations/Login'

import MobileModal from 'components/MobileModal'

const SignInContent = ({ wallet, className }) => {
  const client = useApolloClient()
  const [login] = useMutation(LoginMutation, {
    variables: {
      wallet
    }
  })

  const [loading, setLoading] = useState(loading)
  const [error, setError] = useState(null)

  return (
    <div className={`${className ? className + ' ' : ''}onboard-signin`}>
      <h3>
        <fbt desc="auth.notSignedIn">You&apos;re not signed in</fbt>
      </h3>
      <p>
        <fbt desc="auth.getAccess">
          Get secure access to your data by signing with your private key
        </fbt>
      </p>
      {error && <div className="alert alert-danger my-3">{error}</div>}
      <button
        className="btn btn-outline-primary btn-bordered btn-block"
        onClick={async e => {
          e.preventDefault()
          setLoading(true)
          setError(null)
          try {
            const resp = await login()

            if (resp.data.login.success) {
              await client.reFetchObservableQueries()
            } else {
              setError(resp.data.login.reason)
            }
          } catch (err) {
            console.error(err)
            setError('Failed to generate auth token')
          }

          setLoading(false)
        }}
        disabled={loading}
      >
        {loading ? (
          <fbt desc="Loading...">Loading...</fbt>
        ) : (
          <fbt desc="Auth.SignIn">Sign In</fbt>
        )}
      </button>
    </div>
  )
}

const OnboardSignIn = ({
  listing,
  linkPrefix,
  wallet,
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
    <SignInContent wallet={wallet} className={isMobile ? '' : 'onboard-box'} />
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

require('react-styl')(`
  .onboard-signin
    h3
      margin-top: 1rem
      font-size: 1.125rem
      color: var(--black)
      &:before
        height: 5rem
        display: inline-block
        background-image: url('images/nav/login-button.svg')
        background-size: contain
        background-position: center
        content: ''
        width: 100%
        margin-bottom: 1rem
        background-repeat: no-repeat
    p
      font-size: 0.875rem
      color: #6f8294
    .btn
      max-width: 250px
      margin: 2rem auto 0 auto

  @media (max-width: 767.98px)
    .modal-content.onboard-signin-modal .onboard-signin
      display: flex
      flex: 1
      flex-direction: column
      text-align: center
      padding: 1.25rem
      .btn
        margin-top: auto

`)
