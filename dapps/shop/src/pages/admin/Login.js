import React, { useState, useRef, useEffect } from 'react'

import { useStateValue } from 'data/state'
import useConfig from 'utils/useConfig'

const Login = () => {
  const { config } = useConfig()
  const inputEl = useRef(null)
  const [state, setState] = useState({ email: '', password: '', error: '' })
  const [, dispatch] = useStateValue()
  useEffect(() => {
    if (inputEl.current) {
      inputEl.current.focus()
    }
  }, [inputEl])

  return (
    <form
      className="admin login"
      onSubmit={e => {
        e.preventDefault()
        const body = JSON.stringify({
          email: state.email,
          password: state.password
        })
        console.log('Performing login...', `${config.backend}/auth/login`)
        const myRequest = new Request(`${config.backend}/auth/login`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          credentials: 'include',
          body
        })
        fetch(myRequest)
          .then(res => {
            if (res.ok) {
              setState({ ...state, error: '' })
              dispatch({ type: 'setAuth', auth: state.email })
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
          ref={inputEl}
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
      <div className="form-group">
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </div>
    </form>
  )
}

export default Login

require('react-styl')(`
  .admin.login
    margin: 0
    height: 100vh
    display: flex
    align-items: center
    justify-content: center
    flex-direction: column
    text-align: center
    input
      text-align: center
`)
