import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import request from 'superagent'

import { setSessionEmail } from '../../actions'

class HandleLogin extends Component {
  state = {
    loading: true,
    error: false,
    redirectTo: null
  }

  componentDidMount() {
    this.handleVerifyEmailCode(this.props.match.params.code)
  }

  handleVerifyEmailCode = async code => {
    try {
      const apiUrl = process.env.PORTAL_API_URL || 'http://localhost:5000'
      await request.post(`${apiUrl}/api/verify_email_code`).send({ code })
    } catch (error) {
      this.setState({ loading: false, error: 'Invalid login code' })
    }

    this.setState({ redirectTo: '/otp' })
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="action-card">
          <h1>Loading</h1>
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
)(HandleLogin)
