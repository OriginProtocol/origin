import React, { useEffect, useState } from 'react'
import { useStoreState } from 'pullstate'
import axios from 'axios'

import store from '@/store'

const Password = () => {
  const [sellerExists, setSellerExists] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const [name, setName] = useState('')

  const settings = useStoreState(store, s => s.settings)
  const backend = useStoreState(store, s => s.backend)

  useEffect(() => {
    const checkSellerExists = async () => {
      try {
        await axios.get(`${settings.backend}/auth/${backend.email}`)
      } catch (error) {
        // 404 indicates seller doesn't exist
        if (error.response.status !== 404) {
          setError(
            'An error occurred. Our engineers are looking into it. Please try again later.'
          )
        }
        setFetching(false)
        return
      }
      setFetching(false)
      setSellerExists(true)
    }

    checkSellerExists()
  }, [])

  /* If a user already has an account on the backend, they will be logged in. If
   * a user does not have account one will be created and they will be logged in.
   */
  const handleSubmit = async () => {
    setLoading(true)

    if (!sellerExists) {
      // Seller doesn't exist, create
      try {
        await axios.post(`${settings.backend}/auth/registration`, {
          email: backend.email,
          password,
          name
        })
      } catch (error) {
        console.error(error)
        return
      }
    }

    try {
      // Seller either existed or was created, log seller in
      await axios.post(`${settings.backend}/auth/login`, {
        email: backend.email,
        password
      })
    } catch (error) {
      if (error.response.status === 401) {
        setPasswordError('Invalid password')
      } else {
        console.error(error)
      }
      setLoading(false)
      return
    }

    store.update(s => {
      s.backend = {
        ...s.backend,
        url: settings.backend,
        password
      }
    })
  }

  if (error) {
    return error
  }

  if (fetching) {
    return (
      <span
        className="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      ></span>
    )
  }

  return (
    <>
      <div className="my-5">
        {sellerExists ? (
          <p>It looks like you have an account, please enter your password.</p>
        ) : (
          <p>
            You don&apos;t have an account. We&apos;ll create one now for you.
            Please enter a password.
          </p>
        )}
      </div>

      <div className="row">
        <div className="col-12 col-md-6">
          <div className="card p-5">
            <form className="mt-3" onSubmit={handleSubmit}>
              {!sellerExists && (
                <div className="form-group">
                  <label>Name</label>
                  <input
                    className="form-control input-lg"
                    onChange={e => setName(e.target.value)}
                    value={name}
                    placeholder="Name"
                  />
                </div>
              )}
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className={`form-control input-lg ${
                    passwordError ? 'is-invalid' : ''
                  }`}
                  onChange={e => setPassword(e.target.value)}
                  value={password}
                  placeholder="Password"
                />
                {passwordError && (
                  <div className="invalid-feedback">{passwordError}</div>
                )}
              </div>
              <div className="mt-5">
                <button
                  type="submit"
                  className="btn btn-lg btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Password
