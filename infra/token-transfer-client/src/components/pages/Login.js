import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import request from 'superagent'

import EmailIcon from '../../assets/email-icon.svg'
import { formInput, formFeedback } from '../../utils/formHelpers'

class Login extends Component {
  state = {
    email: '',
    emailError: null,
    emailSent: false
  }

  handleSendEmailCode = async () => {
    const emailPattern = /.+@.+\..+/
    if (!emailPattern.test(this.state.email)) {
      this.setState({ emailError: 'That does not look like a valid email.' })
      return
    }

    try {
      const apiUrl = process.env.PORTAL_API_URL || 'http://localhost:5000'
      await request
        .post(`${apiUrl}/api/send_email_code`)
        .send({ email: this.state.email })
    } catch (error) {
      this.setState({
        emailError: 'Failed to send email code. Try again shortly.'
      })
    }

    this.setState({ emailSent: true })
  }

  render() {
    return this.state.emailSent
      ? this.renderCheckEmail()
      : this.renderEnterEmail()
  }

  renderEnterEmail() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)
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
            onClick={this.handleSendEmailCode}
          >
            Continue
          </button>
        </div>
        <div style={{ textAlign: 'center', margin: '20px auto' }}>
          <Link to="/register" style={{ color: 'white' }}>
            Don&apos;t have an account?
          </Link>
        </div>
      </>
    )
  }

  renderCheckEmail() {
    return (
      <>
        <div className="action-card">
          <h1>Check your email</h1>
          <img src={EmailIcon} style={{ margin: '40px 0' }} />
          <p>
            We just sent an email to {this.state.email}.<br />
            Please click the link in the email to proceed.
          </p>
        </div>
      </>
    )
  }
}

export default Login
