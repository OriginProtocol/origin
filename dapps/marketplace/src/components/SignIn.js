import React, { useState } from 'react'
import { useApolloClient, useMutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'

import LoginMutation from 'mutations/Login'

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
    <div className={`${className ? className + ' ' : ''}signin-content`}>
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

export default withWallet(SignInContent)

require('react-styl')(`
  .signin-content
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
    .modal-content .signin-content
      display: flex
      flex: 1
      flex-direction: column
      text-align: center
      padding: 1.25rem
      .btn
        margin-top: auto
        max-width: 100%
        padding: 0.75rem 2rem
`)
