import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import { apiUrl } from '@/constants'
import agent from '@/utils/agent'

class Welcome extends Component {
  state = {
    loading: true,
    error: false,
    user: {},
    redirectTo: null
  }

  componentDidMount() {
    this.handleWelcomeToken(this.props.match.params.token)
  }

  handleWelcomeToken = async token => {
    let response
    try {
      response = await
        agent
        .get(`${apiUrl}/api/user`)
        .set('Authorization', `Bearer ${token}`)
    } catch (error) {
      this.setState({ loading: false, error: 'Invalid token' })
      return
    }

    if (response.body.otpVerified) {
      // Looks like user has already onboarding, probably wants to login
      this.setState({ redirectTo: '/' })
    } else {
      this.setState({
        user: response.body
      })
    }
  }

  render() {
    if (this.state.emailSent) {
      return <Redirect to="/check_email" />
    }

    return (
      <>
        <div className="action-card">
          <h1>Welcome to the Origin Investor Portal</h1>
          <p>You will be able to use this portal to manage your OGN investment.</p>
          <div className="form-group">
            <label htmlFor="email">Investor</label>
            {this.state.user.name}
          </div>
          <div className="form-group">
            <label>Email Address</label>
            {this.state.user.emailAddress}
          </div>
          <button
            className="btn btn-primary btn-lg"
            style={{ marginTop: '40px' }}
            onClick={() => this.setState({ redirectTo: '/phone' })}
          >
            Continue
          </button>
        </div>
      </>
    )
  }
}

export default Welcome
