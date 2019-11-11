import React, { useState } from 'react'
import { useMutation, useApolloClient } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import Dropdown from 'components/Dropdown'

import withWallet from 'hoc/withWallet'
import withIsMobile from 'hoc/withIsMobile'

import LoginMutation from 'mutations/Login'

const SignInDropdown = ({ wallet, onClose }) => {
  const [login] = useMutation(LoginMutation, {
    variables: {
      wallet
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const client = useApolloClient()

  return (
    <>
      <div className="dropdown-menu-bg" onClick={onClose} />
      <div className="dropdown-menu dropdown-menu-right show signin">
        <a
          className="d-sm-none close-icon"
          href="#close"
          onClick={e => {
            e.preventDefault()
            onClose()
          }}
        >
          Close
        </a>
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
    </>
  )
}

const SignIn = ({ wallet, isMobile }) => {
  const [open, setOpen] = useState(false)

  return (
    <Dropdown
      el="li"
      className="nav-item signin"
      open={open}
      onClose={() => open && setOpen(false)}
      animateOnExit={isMobile}
      content={
        <SignInDropdown
          wallet={wallet}
          onClose={() => open && setOpen(false)}
        />
      }
    >
      <a
        className="nav-link signin-nav-link"
        href="#"
        onClick={e => {
          e.preventDefault()
          setOpen(!open)
        }}
      >
        {isMobile ? null : <fbt desc="Auth.SignIn">Sign In</fbt>}
      </a>
    </Dropdown>
  )
}

export default withWallet(withIsMobile(SignIn))

require('react-styl')(`
  .btn-outline-primary.btn-bordered
    background-color: var(--white)
    border: 1px solid var(--clear-blue)
    color: var(--clear-blue)
    border-radius: 10rem
  .navbar .nav-item .dropdown-menu.signin
    padding: 3rem 1.5rem
    text-align: center
    width: 300px
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
      max-width: 80%
      margin: 0 auto
  
  @media (max-width: 767.98px)
    .signin-nav-link:before
      display: inline-block
      min-width: 28px
      min-height: 28px
      background-image: url('images/nav/login-button.svg')
      background-size: contain
      background-position: center
      content: ''
      background-repeat: no-repeat

`)
