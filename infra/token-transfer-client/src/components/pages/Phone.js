import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import get from 'lodash.get'

import { editUser } from '@/actions/user'
import {
  getError as getUserError,
  getIsEditing as getUserIsEditing
} from '@/reducers/user'
import { formInput, formFeedback } from '@/utils/formHelpers'
import CountryCodes from '@/constants/countryCodes'
import { getNextOnboardingPage } from '@/utils'

const TopCountries = ['us', 'gb', 'cn', 'kr', 'it', 'fr', 'es']
const SortedCountryCodes = [
  ...TopCountries.map(id => CountryCodes.find(c => c.code === id)),
  ...CountryCodes.filter(c => TopCountries.indexOf(c.code) < 0)
]

class Phone extends Component {
  state = {
    countryCode: 1,
    phone: '',
    redirectTo: null
  }

  componentDidUpdate(prevProps) {
    // Parse server errors for user edit
    if (get(prevProps, 'userError') !== this.props.userError) {
      this.handleServerError(this.props.userError)
    }
  }

  handleServerError(error) {
    if (error && error.status === 422) {
      // Parse validation errors from API
      if (error.response.body && error.response.body.errors) {
        error.response.body.errors.forEach(e => {
          this.setState({ [`${e.param}Error`]: e.msg })
        })
      } else {
        console.error(error.response.body)
      }
    }
  }

  isValidPhone() {
    // Very loose mobile phone validation
    return /^[0-9]{5,14}$/.test(this.state.phone)
  }

  handleSubmit = async () => {
    const result = await this.props.editUser({
      phone: `${this.state.countryCode} ${this.state.phone}`
    })
    if (result.type === 'EDIT_USER_SUCCESS') {
      this.setState({ redirectTo: getNextOnboardingPage(result.payload) })
    }
  }

  render() {
    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)

    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    }

    return (
      <>
        <div className="action-card narrow">
          <h1>Please provide a phone number</h1>
          <p>We will contact you to verify large withdrawals.</p>
          <form>
            <div className="form-group">
              <label htmlFor="country-code">Country Code</label>
              <select
                className="custom-select custom-select-lg"
                onChange={e => this.setState({ countryCode: e.target.value })}
              >
                {SortedCountryCodes.map(country => (
                  <option key={country.code} value={country.prefix}>
                    {country.name} (+{country.prefix})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input {...input('phone')} />
              {Feedback('phone')}
            </div>
            <button
              type="submit"
              className="btn btn-secondary btn-lg mt-5"
              onClick={this.handleSubmit}
              disabled={this.props.userIsEditing || !this.isValidPhone()}
            >
              {this.props.userIsEditing ? (
                <>
                  <span className="spinner-grow spinner-grow-sm"></span>
                  Loading...
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>
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

export default connect(mapStateToProps, mapDispatchToProps)(Phone)
