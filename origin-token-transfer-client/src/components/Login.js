import React, { Component } from 'react'
import { GoogleLogin } from 'react-google-login'
import { Dialog, Intent, Toaster } from '@blueprintjs/core'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import { setSessionEmail } from '../actions'

class Login extends Component {
  handleError = err => {
    Toaster.create({
      message: `Google login error: ${err}`,
      intent: Intent.DANGER
    })
  }

  handleSuccess = async response => {
    // Send token to server endpoint, which will authenticate it with Google.
    const tokenBlob = new Blob(
      [JSON.stringify({ access_token: response.accessToken }, null, 2)],
      { type: 'application/json' }
    )
    const opts = {
      method: 'POST',
      body: tokenBlob
    }
    const sessionEmail = response.profileObj.email

    fetch('/api/auth_google', opts).then(response => {
      if (response.ok) {
        this.props.setSessionEmail(sessionEmail)
      } else {
        this.props.setSessionEmail(undefined)
        this.handleError(response.statusText)
      }
    })
  }

  render() {
    return (
      <div>
        {this.props.sessionEmail &&
          this.props.sessionEmail !== '(need to login)' && (
            <Redirect to="/grants" />
          )}
        <Dialog id="loginDialog" isOpen={true}>
          <div className="bp3-dialog-header">
            <span className="bp3-icon-large bp3-icon-arrow-right" />
            <h4 className="bp3-heading">Origin T3</h4>
          </div>

          <div className="bp3-dialog-body">
            <p>
              Please login through Google Login. We don&apos;t ever receive your
              password.
            </p>
          </div>

          <div className="bp3-dialog-footer" id="loginFooter">
            {/* TODO: extract client ID into EnvPack */}
            <GoogleLogin
              clientId="715174050235-s2a22mca961has0fea8k4406mlqhg5b6.apps.googleusercontent.com"
              buttonText="Login"
              onSuccess={r => this.handleSuccess(r)}
              onFailure={this.handleError}
            />
          </div>
        </Dialog>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    sessionEmail: state.sessionEmail
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setSessionEmail: email => dispatch(setSessionEmail(email))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
