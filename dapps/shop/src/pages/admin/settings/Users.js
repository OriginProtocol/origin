import React, { useEffect, useState } from 'react'

import { formInput, formFeedback } from 'utils/formHelpers'
import useConfig from 'utils/useConfig'

function validate(state) {
  const newState = {}

  if (!state.name) {
    newState.nameError = 'Enter a name'
  }
  if (!state.email) {
    newState.emailError = 'Enter an email'
  }
  if (!state.password) {
    newState.passwordError = 'Enter a password'
  }
  if (!state.role) {
    newState.roleError = 'Select a role'
  }

  const valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

  return { valid, newState: { ...state, ...newState } }
}

const AdminUsers = () => {
  const { config } = useConfig()
  const [state, setStateRaw] = useState({ loading: false, users: [] })
  const setState = newState => setStateRaw({ ...state, ...newState })

  useEffect(() => {
    setState({ loading: true })
    fetch(`${config.backend}/shop/users`, {
      headers: {
        authorization: `bearer ${config.backendAuthToken}`,
        'content-type': 'application/json'
      },
      credentials: 'include'
    }).then(async res => {
      if (res.ok) {
        const json = await res.json()
        setState({ loading: false, users: json.users })
      }
    })
  }, [])

  const input = formInput(state, newState => setState(newState))
  const Feedback = formFeedback(state)

  return (
    <>
      {state.loading ? (
        'Loading...'
      ) : (
        <table className="table mt-4">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {state.users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <form
        className="d-flex flex-wrap align-items-start"
        onSubmit={e => {
          e.preventDefault()
          const { valid, newState } = validate(state)
          setState(newState)
          if (!valid) {
            return
          }
          fetch(`${config.backend}/shop/add-user`, {
            method: 'POST',
            headers: {
              authorization: `bearer ${config.backendAuthToken}`,
              'content-type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              name: state.name,
              email: state.email,
              password: state.password,
              role: state.role
            })
          }).then(async res => {
            if (res.ok) {
              const json = await res.json()
              console.log(json)
            }
          })
        }}
      >
        <div className="form-group mr-sm-2">
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            {...input('name')}
          />
          {Feedback('name')}
        </div>
        <div className="form-group mr-sm-2">
          <input
            type="text"
            className="form-control"
            placeholder="Email"
            {...input('email')}
          />
          {Feedback('email')}
        </div>
        <div className="form-group mr-sm-2">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            {...input('password')}
          />
          {Feedback('password')}
        </div>
        <div className="form-group mr-sm-2">
          <select className="form-control" {...input('role')}>
            <option>Role...</option>
            <option>Admin</option>
            <option>Basic </option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary mb-2">
          Add User
        </button>
      </form>
    </>
  )
}

export default AdminUsers
