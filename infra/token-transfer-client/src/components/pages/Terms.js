import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import { editUser, fetchUser } from '@/actions/user'
import {
  getUser,
  getError as getUserError,
  getIsEditing as getUserIsEditing,
  getIsLoading as getUserIsLoading
} from '@/reducers/user'

class Terms extends Component {
  state = {
    accepted: false,
    redirectTo: null
  }

  componentDidMount() {
    if (!this.props.user) {
      this.props.fetchUser()
    }
  }

  handleSubmit = async () => {
    const result = await this.props.editUser({
      termsAgreedAt: moment()
    })
    if (result.type === 'EDIT_USER_SUCCESS') {
      this.setState({ redirectTo: '/phone' })
    }
  }

  renderLoading = () => {
    return (
      <div className="action-card">
        <div className="spinner-grow" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    } else if (!this.props.user || this.props.userIsLoading) {
      return this.renderLoading()
    }

    const skipRevisedSchedule =
      (this.props.user && this.props.user.revisedScheduleAgreedAt) ||
      this.props.user.revisedScheduleRejected

    return (
      <>
        <div className="action-card">
          <h1>
            Great!
            <br />
            Please review our Terms of Use
          </h1>
          <p>Please agree to our terms below and click Continue to proceed</p>
          <div className="form-group">
            <div className="terms-wrapper">
              The recipient acknowledges that they have been advised that the
              offers and sales of OGN have not been registered under any
              country’s securities laws and, therefore, cannot be resold except
              in compliance with the applicable country’s laws. Based on recent
              guidance from the SEC, it is possible that transfers of OGN would
              be deemed to be securities offerings in the United States at
              launch. We plan to work towards meeting the standards set by
              various jurisdictions around the world, including the United
              States, for transfers of OGN to not be considered offers and sales
              of securities in those jurisdictions; however we cannot assure you
              that those standards have been met as of now. In recognition of
              the foregoing, the recipient covenants to the Company that it will
              comply with all applicable laws, including United States
              securities laws, with respect to any transfer of OGN as if OGN was
              a security under the laws of the United States.
              <br />
              <br />
              The recipient acknowledges that they are solely responsible for
              maintaining the security of his, her or its login password as well
              as maintaining a secure backup.
            </div>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="acceptCheck"
              onClick={e => this.setState({ accepted: e.target.checked })}
            />
            <label className="form-check-label mt-0" htmlFor="acceptCheck">
              I have read and agree to the above terms and conditions and the{' '}
              <a
                href="https://www.originprotocol.com/en/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                privacy policy
              </a>{' '}
              and{' '}
              <a
                href="https://www.originprotocol.com/en/tos"
                target="_blank"
                rel="noopener noreferrer"
              >
                terms of service
              </a>{' '}
              of Origin Protocol Inc.
            </label>
          </div>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => {
              if (skipRevisedSchedule) {
                this.setState({ redirectTo: '/phone' })
              } else {
                this.setState({ redirectTo: '/revised_schedule' })
              }
            }}
          >
            Continue
          </button>
        </div>
      </>
    )
  }
}

const mapStateToProps = ({ user }) => {
  return {
    user: getUser(user),
    userError: getUserError(user),
    userIsEditing: getUserIsEditing(user),
    userIsLoading: getUserIsLoading(user)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      editUser: editUser,
      fetchUser: fetchUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Terms)
