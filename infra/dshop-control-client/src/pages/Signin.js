import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import axios from 'axios'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [backend, setBackend] = useState('')
  const [redirectTo, setRedirectTo] = useState(false)

  const handleSubmit = () => {
    const response = axios.post(backend, {
      email,
      password
    })
    if (response) {
      setRedirectTo('/manage')
    }
  }

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  return (
    <div className="row">
      <div className="col-4 mx-auto mt-5">
        <form className="mt-3" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              className="form-control input-lg"
              onChange={e => setEmail(e.target.value)}
              value={email}
              placeholder="Email address"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
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
              value={backend}
              placeholder="https://backend.ogn.app"
            />
          </div>
          <div className="mt-5">
            <button type="submit" className="btn btn-lg btn-primary">
              Sign In
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
