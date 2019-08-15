import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import { formInput, formFeedback } from '@/utils/formHelpers'
import { apiUrl } from '@/constants'
import agent from '@/utils/agent'

class Phone extends Component {
  state = {
    phone: '',
    phoneError: null,
    redirectTo: null
  }

  handleSubmit = async () => {
    try {
      await agent.post(`${apiUrl}/api/user`).send({ phone: this.state.phone })
    } catch (error) {
      this.setState({
        phoneError: 'Failed to save phone number. Try again shortly.'
      })
      return
    }

    this.setState({ redirectTo: '/terms' })
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
          <h1>Please provide a phone number</h1>
          <p>We will contact you to verify large withdrawals</p>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input {...input('phone')} />
            {Feedback('phone')}
          </div>
          <button
            className="btn btn-primary btn-lg"
            style={{ marginTop: '40px' }}
            onClick={this.handleSubmit}
          >
            Continue
          </button>
        </div>
      </>
    )
  }
}

export default Phone
