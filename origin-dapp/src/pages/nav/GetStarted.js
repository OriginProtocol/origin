import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import store from 'utils/store'
const sessionStore = store('sessionStorage')

import Link from 'components/Link'
import Modal from 'components/Modal'

class GetStarted extends Component {
  state = { open: false }
  render() {
    return (
      <ul className="navbar-nav">
        {/* <li className="nav-item">
          <Link
            to="/onboard"
            className="nav-link px-3"
            onClick={() => {
              const { pathname, search } = this.props.location
              sessionStore.set('getStartedRedirect', { pathname, search })
            }}
          >
            Get Started
          </Link>
        </li> */}
        <li className="nav-item">
          <a
            href="#"
            className="nav-link px-3"
            onClick={e => {
              e.preventDefault()
              this.setState({ open: true })
            }}
          >
            Get Started
          </a>
        </li>
        <li className="nav-item d-none d-md-block">
          <Link
            to="/onboard"
            className="nav-link px-3"
            onClick={() =>
              sessionStore.set('getStartedRedirect', { pathname: '/create' })
            }
          >
            Sell on Origin
          </Link>
        </li>
        {!this.state.open ? null : (
          <Modal
            shouldClose={this.state.shouldClose}
            onClose={() => this.setState({ open: false, shouldClose: false })}
            className="sign-up"
          >
            {!this.state.loading ? null : <div className="loading" />}
            <h2>Sign Up</h2>
            <form>
              <div className="form-group">
                <input
                  placeholder="Email"
                  type="text"
                  value="nick@originprotocol.com"
                  className="form-control dark"
                />
              </div>
              <div className="form-group">
                <input
                  placeholder="Password"
                  type="password"
                  value="password123"
                  className="form-control dark"
                />
              </div>
            </form>

            <div className="actions d-flex">
              <button
                className="btn btn-outline-light"
                children="OK"
                onClick={() => {
                  this.setState({ shouldClose: true, loading: true })
                  localStorage.loggedInAs =
                    '0x1bbFBb2dAc53Da46e2a675aD956ACd82aBC96866'
                }}
              />
            </div>
          </Modal>
        )}
      </ul>
    )
  }
}

export default withRouter(GetStarted)

require('react-styl')(`
  .sign-up
    form
      text-align: left
    label
      color: white
`)
