import React, { useState, useRef, useEffect } from 'react'

import { useStateValue } from 'data/state'

const AuthURL = `${process.env.BACKEND_URL}/auth`

const Login = () => {
  const inputEl = useRef(null)
  const [state, setState] = useState({ username: '', password: '', error: '' })
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
        const auth = `Basic ${btoa(`${state.username}:${state.password}`)}`
        const headers = new Headers({ authorization: auth })
        const myRequest = new Request(AuthURL, { headers })
        fetch(myRequest).then(res => {
          if (res.ok) {
            setState({ ...state, error: '' })
            dispatch({ type: 'setAuth', auth })
          } else {
            setState({ ...state, error: 'Unauthorized' })
          }
        })
      }}
    >
      <div className="form-group">
        <input
          ref={inputEl}
          className="form-control"
          placeholder="Username"
          value={state.username}
          onChange={e => setState({ ...state, username: e.target.value })}
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
