import React, { useState } from 'react'

import useConfig from 'utils/useConfig'

const SignUp = ({ next }) => {
  const { config } = useConfig()
  const [state, setState] = useState({
    name: '',
    email: '',
    password: '',
    error: ''
  })

  return (
    <>
      <div className="mb-4">
        Welcome to Dshop! Create an admin account to continue.
      </div>
      <form
        className="sign-up"
        onSubmit={e => {
          e.preventDefault()

          const body = JSON.stringify({
            name: state.name,
            email: state.email,
            password: state.password
          })

          fetch(`${config.backend}/auth/registration`, {
            method: 'POST',
            headers: {
              authorization: `bearer ${config.backendAuthToken}`,
              'content-type': 'application/json'
            },
            credentials: 'include',
            body
          })
            .then(async res => {
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
            placeholder="Name"
            value={state.name}
            onChange={e => setState({ ...state, name: e.target.value })}
          />
        </div>
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
        <button type="submit" className="btn btn-primary mt-2">
          Continue
        </button>
      </form>
    </>
  )
}

export default SignUp
