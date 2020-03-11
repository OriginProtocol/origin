import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import axios from 'utils/axiosWithCredentials'
import store from '@/store'

const SignIn = props => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [backend, setBackend] = useState('https://localhost')
  const [redirect, setRedirect] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async event => {
    setLoading(true)

    event.preventDefault()

    try {
      await axios.post(`${backend}/auth/login`, {
        email,
        password
      })
    } catch (error) {
      if (error.response && error.response.status) {
        setError('Invalid email or password')
      } else {
        console.error(error)
        setError('An error occurred')
      }
      setLoading(false)
      return
    }

    store.update(s => {
      s.backend = {
        email,
        password,
        url: backend
      }
      if (!error) s.hasAuthenticated = true
    })

    setRedirect(props.redirectTo || '/manage')
  }

  if (redirect) {
    console.log('redirecting to...', redirect)
    return <Redirect push to={redirect} />
  }

  return (
    <div className="row">
      <div className="col-4 mx-auto mt-5">
        {props.text ? <p>{props.text}</p> : null}
        <form className="mt-3" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control input-lg"
              onChange={e => setEmail(e.target.value)}
              value={email}
              placeholder="Email address"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control input-lg"
              onChange={e => setPassword(e.target.value)}
              value={password}
              placeholder="Password"
            />
          </div>
          <div className="form-group">
            <label>Backend</label>
            <input
              className="form-control input-lg"
              onChange={e => setBackend(e.target.value)}
              value={backend || 'https://api.ogn.app'}
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mt-5">
            <button
              type="submit"
              className="btn btn-lg btn-primary"
              disabled={email.length === 0 || password.length === 0 || loading}
            >
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignIn

require('react-styl')(`
.signin-form
  background-color: #111d28
`)
