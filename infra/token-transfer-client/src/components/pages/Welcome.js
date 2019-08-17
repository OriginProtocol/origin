import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { fetchUser } from '@/actions/user'
import { apiUrl } from '@/constants'
import agent from '@/utils/agent'

class Welcome extends Component {
  state = {
    loading: true,
    redirectTo: null
  }

  componentDidMount() {
    this.handleWelcomeToken(this.props.match.params.token)
  }

  handleWelcomeToken = async token => {
    // Auth the user using the token
    let response
    try {
      response = await agent
        .post(`${apiUrl}/api/verify_email_token`)
        .set('Authorization', `Bearer ${token}`)
    } catch (error) {
      this.setState({ loading: false, error: 'Invalid token' })
      return
    }

    if (response.body.otpVerified) {
      // Looks like user has already onboarding, probably wants to login
      this.setState({ redirectTo: '/' })
    }

    // Load the user
    this.props.fetchUser()

    this.setState({ loading: false })
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect to={this.state.redirectTo} />
    }

    return (
      <>
        <div className="action-card">
          {this.state.loading || this.props.isFetching ? (
            <div className="spinner-grow" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <>
              <h1>Welcome to the Origin Investor Portal</h1>
              <p>
                You will be able to use this portal to manage your OGN
                investment.
              </p>
              <div className="form-group">
                <label>Name</label>
                <br />
                {this.props.user.name}
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <br />
                {this.props.user.email}
              </div>
              <button
                className="btn btn-primary btn-lg"
                style={{ marginTop: '40px' }}
                onClick={() => {
                  if (this.props.user.phone) {
                    this.setState({ redirectTo: '/terms' })
                  } else {
                    this.setState({ redirectTo: '/phone' })
                  }
                }}
              >
                Continue
              </button>
            </>
          )}
        </div>
      </>
    )
  }
}

const mapStateToProps = ({ user }) => {
  return {
    user: user.user,
    error: user.error,
    isFetching: user.isFetching
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchUser: fetchUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Welcome)
