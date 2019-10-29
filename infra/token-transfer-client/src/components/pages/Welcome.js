import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { fetchUser } from '@/actions/user'
import { getUser, getError, getIsLoading } from '@/reducers/user'
import { apiUrl } from '@/constants'
import agent from '@/utils/agent'

class Welcome extends Component {
  state = {
    loading: true,
    redirectTo: null,
    error: null
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

    this.props.fetchUser()

    this.setState({ loading: false })
  }

  renderError = () => {
    return (
      <>
        <h1>Error</h1>
        <p className="my-4">
          It looks like the link you used to access this page is no longer
          valid. Please{' '}
          <a href="mailto:investors@originprotocol.com">contact</a> the Origin
          Team.
        </p>
      </>
    )
  }

  renderLoading = () => {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  renderWelcome = () => {
    return (
      <>
        <h1>
          Welcome to the
          <br />
          Origin Investor Portal
        </h1>
        <p className="my-4">
          The wait is finally over! You can now start using this portal to
          manage your OGN investment.
        </p>
        <hr className="mx-5" />
        <div className="form-group">
          <label className="mt-0">Investor</label>
          <br />
          {this.props.user.name}
        </div>
        <div className="form-group">
          <label className="mt-0">Email Address</label>
          <br />
          {this.props.user.email}
        </div>
        <hr className="mx-5" />
        <p className="my-4">
          As part of our agreement with our listing exchanges, we’ve modified
          the token unlock schedule.
        </p>
        <button
          className="btn btn-secondary btn-lg"
          onClick={() => {
            if (
              this.props.user.revised_terms_agreed_at ||
              this.props.user.revised_schedule_rejected
            ) {
              this.setState({ redirectTo: '/terms' })
            } else {
              this.setState({ redirectTo: '/revised_schedule' })
            }
          }}
        >
          {this.props.user.revised_terms_agreed_at
            ? 'Continue'
            : 'View Revised Schedule'}
        </button>
      </>
    )
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    }

    let cardContent
    if (this.state.error) {
      cardContent = this.renderError()
    } else if (this.state.loading || this.props.isLoading) {
      cardContent = this.renderLoading()
    } else {
      cardContent = this.renderWelcome()
    }

    return <div className="action-card">{cardContent}</div>
  }
}

const mapStateToProps = ({ user }) => {
  return {
    user: getUser(user),
    error: getError(user),
    isLoading: getIsLoading(user)
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
