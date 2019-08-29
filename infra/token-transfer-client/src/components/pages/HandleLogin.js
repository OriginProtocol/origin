import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import { apiUrl } from '@/constants'
import agent from '@/utils/agent'

class HandleLogin extends Component {
  state = {
    loading: true,
    error: false,
    redirectTo: null
  }

  componentDidMount() {
    this.handleVerifyEmailToken(this.props.match.params.token)
  }

  handleVerifyEmailToken = async token => {
    let response
    try {
      response = await agent
        .post(`${apiUrl}/api/verify_email_token`)
        .set('Authorization', `Bearer ${token}`)
    } catch (error) {
      this.setState({ loading: false, error: 'Invalid login token' })
      return
    }

    const redirectTo = response.body.otpReady ? '/otp' : '/otp/explain'

    this.setState({ loading: false, redirectTo })
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="action-card">
          <div className="spinner-grow" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )
    } else if (this.state.error) {
      return (
        <div className="action-card">
          <h1>{this.state.error}</h1>
        </div>
      )
    } else if (this.state.redirectTo) {
      return <Redirect to={this.state.redirectTo} />
    }
  }
}

export default HandleLogin
