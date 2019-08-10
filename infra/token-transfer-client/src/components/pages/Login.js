import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import { formInput, formFeedback } from '@/utils/formHelpers'
import withSendEmailToken from '@/hoc/withSendEmailToken'

class Login extends Component {
  state = {
    email: '',
    emailError: null,
    redirectTo: null
  }

  handleSendEmailToken = async () => {
    const emailPattern = /.+@.+\..+/
    if (!emailPattern.test(this.state.email)) {
      this.setState({ emailError: 'That does not look like a valid email.' })
      return
    }
    try {
      await this.props.sendEmailToken(this.state.email)
    } catch (error) {
      this.setState({
        emailError: 'Failed to send email token. Try again shortly.'
      })
      return
    }

    this.setState({ redirectTo: '/check_email' })
  }

  render() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    if (this.state.redirectTo) {
      return <Redirect to={this.state.redirectTo} />
    }

    return (
      <>
        <div className="action-card">
          <h1>Sign In</h1>
          <p>We will send you a magic link to your email to confirm access</p>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input {...input('email')} />
            {Feedback('email')}
          </div>
          <button
            className="btn btn-primary btn-lg"
            style={{ marginTop: '40px' }}
            onClick={this.handleSendEmailToken}
          >
            Continue
          </button>
        </div>
      </>
    )
  }
}

export default withSendEmailToken(Login)
