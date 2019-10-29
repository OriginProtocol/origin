import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import { editUser } from '@/actions/user'
import {
  getError as getUserError,
  getIsEditing as getUserIsEditing
} from '@/reducers/user'

class RevisedTerms extends Component {
  state = {
    accepted: true,
    redirectTo: null
  }

  handleSubmit = async () => {
    const result = await this.props.editUser({
      revisedScheduleAgreedAt: moment()
    })
    if (result.type === 'EDIT_USER_SUCCESS') {
      this.setState({ redirectTo: '/terms' })
    }
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    }

    return (
      <>
        <div className="action-card">
          <h1>Investor Amendment Agreement</h1>
          <p>
            Please agree to the investor amendment below to use the Origin
            Investor Portal.
          </p>
          <div className="form-group">
            <div className="terms-wrapper">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
              odio lorem, lacinia sed molestie nec, suscipit quis ligula. Morbi
              vitae ornare felis. Curabitur leo justo, laoreet vel sem ac,
              vestibulum mollis mauris. Maecenas iaculis elit non elit dictum,
              ac pharetra nunc interdum. Mauris volutpat scelerisque quam non
              cursus. Sed eros purus, rhoncus et ex efficitur, dapibus convallis
              justo. Vestibulum diam eros, condimentum ut ante sit amet, porta
              mollis quam. Suspendisse sed magna vestibulum, imperdiet tellus a,
              venenatis metus. Nulla non volutpat dolor, vel placerat risus.
              Maecenas a imperdiet metus. Nulla volutpat lectus ligula, eget
              malesuada eros fringilla eget. Pellentesque porttitor ultricies
              mauris non congue.
              <br />
              <br />
              Nulla non volutpat dolor, vel placerat risus. Maecenas a imperdiet
              metus. Nulla volutpat lectus ligula, eget malesuada eros fringilla
              eget. Pellentesque porttitor ultricies mauris non congue.
            </div>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="acceptCheck"
              onClick={e => this.setState({ accepted: e.target.checked })}
              defaultChecked
            />
            <label className="form-check-label mt-0" htmlFor="acceptCheck">
              I have read and agree to the Revised Token Unlock Schedule
              Agreement
            </label>
          </div>
          <button
            className="btn btn-secondary btn-lg mt-5"
            onClick={this.handleSubmit}
            disabled={!this.state.accepted || this.props.userIsEditing}
          >
            Accept Agreement
          </button>
          <p>
            If you do not agree with the proposed amendment, you can contact
            Origin Investor Relations at
            <a href="mailto:investor-relations@originprotocol.com">
              investor-relations@originprotocol.com
            </a>
          </p>
        </div>
      </>
    )
  }
}

const mapStateToProps = ({ user }) => {
  return {
    userError: getUserError(user),
    userIsEditing: getUserIsEditing(user)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      editUser: editUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RevisedTerms)
