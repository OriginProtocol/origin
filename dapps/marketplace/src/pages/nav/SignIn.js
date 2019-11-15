import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import Dropdown from 'components/Dropdown'
import SignInContent from 'components/SignIn'

import withWallet from 'hoc/withWallet'
import withIsMobile from 'hoc/withIsMobile'

const SignInDropdown = ({ onClose }) => {
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
        <SignInContent />
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
