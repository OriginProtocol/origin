import React, { useState } from 'react'

import { DshopLogo } from 'components/icons/Admin'

import useConfig from 'utils/useConfig'

const Login = ({ next }) => {
  const { config } = useConfig()
  const [state, setState] = useState({
    email: '',
    password: '',
    error: ''
  })

  return (
    <div className="container admin-first-time">
      <DshopLogo />
      <div className="mb-4">Welcome to Dshop! Sign in to continue.</div>
      <form
        className="sign-up"
        onSubmit={e => {
          e.preventDefault()

          const { email, password } = state
          fetch(`${config.backend}/superuser/login`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
          })
            .then(async res => {
              console.log({ ok: res.ok })
              if (res.ok) {
                setState({ ...state, error: '' })
                // const auth = await res.json()
                next()
              } else {
                setState({ ...state, error: 'Unauthorized' })
              }
            })
            .catch(err => {
              console.error('Error signing in', err)
              setState({ ...state, error: 'Unauthorized' })
            })
        }}
      >
        <div className="form-group">
          <input
            className="form-control"
            placeholder="E-mail"
            value={state.email}
            onChange={e => setState({ ...state, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <input
            value={state.password}
            onChange={e => setState({ ...state, password: e.target.value })}
            type="password"
            className="form-control"
            placeholder="Password"
          />
          {!state.error ? null : (
            <small className="form-text text-danger mt-2">{state.error}</small>
          )}
        </div>
        <button type="submit" className="btn btn-primary mt-2 px-4">
          Login
        </button>
      </form>
    </div>
  )
}

export default Login
